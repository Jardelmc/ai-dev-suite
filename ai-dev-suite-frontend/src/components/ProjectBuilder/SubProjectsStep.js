import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getTemplates } from '../../services/api';

const SubProjectsStep = ({ subProjects, onUpdate, showNotification }) => {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [currentSub, setCurrentSub] = useState({
    name: '',
    description: '',
    templateId: '',
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        showNotification('Erro ao carregar templates: ' + error.message, 'error');
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [showNotification]);

  const handleInputChange = (field) => (event) => {
    setCurrentSub((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAddSubProject = () => {
    if (!currentSub.name.trim() || !currentSub.templateId) {
      showNotification('Nome e Template são obrigatórios para cada sub-projeto.', 'warning');
      return;
    }
    onUpdate([...subProjects, currentSub]);
    setCurrentSub({ name: '', description: '', templateId: '' });
  };

  const handleRemoveSubProject = (indexToRemove) => {
    onUpdate(subProjects.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Adicionar Sub-Projetos
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Adicione os sub-projetos (ex: backend, frontend, microserviços) e associe um template a cada um.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Nome do Sub-Projeto"
              value={currentSub.name}
              onChange={handleInputChange('name')}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Descrição"
              value={currentSub.description}
              onChange={handleInputChange('description')}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Template</InputLabel>
              <Select
                value={currentSub.templateId}
                label="Template"
                onChange={handleInputChange('templateId')}
                disabled={loadingTemplates}
              >
                {loadingTemplates ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSubProject}
              disabled={!currentSub.name.trim() || !currentSub.templateId}
            >
              Adicionar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="subtitle1" gutterBottom>
        Sub-Projetos Adicionados ({subProjects.length})
      </Typography>
      <Paper>
        <List>
          {subProjects.map((sub, index) => {
            const template = templates.find(t => t.id === sub.templateId);
            return (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSubProject(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={sub.name}
                  secondary={sub.description}
                />
                {template && (
                  <Chip
                    label={`${template.name} (${template.type})`}
                    color={template.type === 'backend' ? 'primary' : 'secondary'}
                    size="small"
                  />
                )}
              </ListItem>
            );
          })}
          {subProjects.length === 0 && (
            <ListItem>
                <ListItemText primary="Nenhum sub-projeto adicionado ainda." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default SubProjectsStep;