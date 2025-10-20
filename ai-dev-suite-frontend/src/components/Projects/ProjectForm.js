import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { createProject, updateProject } from '../../services/api';

const ProjectForm = ({ projectToEdit, parentProject, projects, onSaveSuccess, onCancel, showNotification }) => {
  const [formData, setFormData] = useState({
    title: '',
    directory: '',
    parentId: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        title: projectToEdit.title || '',
        directory: projectToEdit.directory || '',
        parentId: projectToEdit.parentId || '',
        description: projectToEdit.description || '',
      });
    } else if (parentProject) {
      setFormData({
        title: '',
        directory: '',
        parentId: parentProject.id,
        description: '',
      });
    } else {
      setFormData({
        title: '',
        directory: '',
        parentId: '',
        description: '',
      });
    }
  }, [projectToEdit, parentProject]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.directory.trim()) {
      showNotification('Nome do projeto e diretório são obrigatórios.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...formData,
        parentId: formData.parentId || null,
      };
      if (projectToEdit) {
        await updateProject(projectToEdit.id, data);
        onSaveSuccess('Projeto atualizado com sucesso!');
      } else {
        await createProject(data);
        onSaveSuccess('Projeto criado com sucesso!');
      }
    } catch (error) {
      showNotification('Erro ao salvar projeto: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFormTitle = () => {
    if (projectToEdit) return `Editando: ${projectToEdit.title}`;
    if (parentProject) return `Novo Sub-Projeto para: ${parentProject.title}`;
    return 'Criar Novo Projeto Raiz';
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h2" gutterBottom>
        {getFormTitle()}
      </Typography>
      
      <TextField
        label="Nome do Projeto"
        value={formData.title}
        onChange={handleChange('title')}
        fullWidth
        margin="normal"
        required
        autoFocus
      />

      <TextField
        label="Diretório"
        value={formData.directory}
        onChange={handleChange('directory')}
        fullWidth
        margin="normal"
        required
        placeholder="/caminho/completo/para/o/projeto"
        helperText="Informe o caminho absoluto para o diretório do projeto"
      />

      <FormControl fullWidth margin="normal" disabled={!!parentProject}>
        <InputLabel>Projeto Pai</InputLabel>
        <Select
          value={formData.parentId}
          label="Projeto Pai"
          onChange={handleChange('parentId')}
        >
          <MenuItem value="">
            <em>Nenhum (Projeto Raiz)</em>
          </MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Descrição"
        value={formData.description}
        onChange={handleChange('description')}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectForm;