import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import { buildProject } from '../../services/api';

const SummaryAndBuildStep = ({ data, onBuildSuccess, showNotification }) => {
  const [loading, setLoading] = useState(false);

  const handleBuild = async () => {
    setLoading(true);
    try {
      const result = await buildProject(data);
      showNotification('Projeto construído com sucesso!', 'success');
      onBuildSuccess(result);
    } catch (error) {
      showNotification('Erro ao construir projeto: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Resumo e Construção
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Revise as informações do projeto. Se tudo estiver correto, clique em "Construir Projeto" para criar a estrutura de pastas e arquivos.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">{data.rootProject.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {data.rootProject.directory}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>{data.rootProject.description}</Typography>
      </Paper>

      <Typography variant="subtitle1" gutterBottom>
        Sub-Projetos
      </Typography>
      <Paper>
        <List>
          {data.subProjects.map((sub, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText primary={sub.name} secondary={sub.description} />
              </ListItem>
              {index < data.subProjects.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        A ação de construir criará as pastas e arquivos no diretório especificado. Esta ação pode sobrescrever arquivos existentes se os nomes coincidirem.
      </Alert>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BuildIcon />}
          onClick={handleBuild}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Construindo...' : 'Construir Projeto'}
        </Button>
      </Box>
    </Box>
  );
};

export default SummaryAndBuildStep;