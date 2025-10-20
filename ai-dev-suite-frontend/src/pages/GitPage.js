import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  Grid,
  Tooltip,
} from '@mui/material';
import { 
    AddCircleOutline as AddIcon, 
    Edit as EditIcon, 
    RemoveCircleOutline as RemoveIcon,
    HelpOutline as UnknownIcon
} from '@mui/icons-material';
import { useProjectContext } from '../contexts/ProjectContext';
import EnhancedGitControls from '../components/Git/EnhancedGitControls';
import { getGitStatus } from '../services/api';

const GitPage = ({ showNotification }) => {
  const { selectedProject, getProjectSelection } = useProjectContext();
  const [lastResult, setLastResult] = useState(null);
  const [status, setStatus] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (selectedProject) {
        setLoadingStatus(true);
        setStatus([]);
        try {
          const result = await getGitStatus(selectedProject.id);
          setStatus(result);
        } catch (error) {
          showNotification('Erro ao buscar status do Git: ' + error.message, 'error');
        } finally {
          setLoadingStatus(false);
        }
      } else {
        setStatus([]);
      }
    };
    fetchStatus();
  }, [selectedProject, showNotification]);

  const handleGitAction = (result, actionType) => {
    setLastResult({ ...result, actionType });
    if (actionType === 'commit') {
      if (result.commitPerformed) {
        showNotification('Commit realizado com sucesso!', 'success');
      } else {
        showNotification('Nenhuma alteração para fazer commit', 'info');
      }
    } else if (actionType === 'revert') {
      showNotification('Alterações revertidas com sucesso!', 'success');
    }
    // Refresh status after action
    if (selectedProject) {
        const fetchStatus = async () => {
            setLoadingStatus(true);
            try {
                const result = await getGitStatus(selectedProject.id);
                setStatus(result);
            } catch (error) {
                showNotification('Erro ao buscar status do Git: ' + error.message, 'error');
            } finally {
                setLoadingStatus(false);
            }
        };
        fetchStatus();
    }
  };

  const handleError = (error) => {
    showNotification(error.message || 'Erro na operação Git', 'error');
  };

  const getFileStatusChip = (file) => {
    const statusMap = {
      '?': { label: 'Novo', color: 'success', icon: <AddIcon /> },
      'M': { label: 'Modificado', color: 'primary', icon: <EditIcon /> },
      'D': { label: 'Deletado', color: 'error', icon: <RemoveIcon /> },
    };
    const fileStatus = statusMap[file.working_dir.trim()] || { label: 'Desconhecido', color: 'default', icon: <UnknownIcon /> };
    return (
      <Tooltip title={`${file.path} - ${fileStatus.label}`} key={file.path}>
        <Chip 
          icon={fileStatus.icon}
          label={file.path}
          color={fileStatus.color}
          size="small"
          sx={{ mr: 1, mt: 1 }} 
        />
      </Tooltip>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Git Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie o controle de versão dos seus projetos. Faça commits organizados ou 
          reverta alterações quando necessário.
        </Typography>
      </Box>

      {!selectedProject && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Nenhum projeto selecionado.</strong> Selecione um projeto no seletor global 
            acima ou use o formulário abaixo para informar um diretório específico.
          </Typography>
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <EnhancedGitControls
          onGitAction={handleGitAction}
          onError={handleError}
          preselectedProject={selectedProject ? getProjectSelection() : null}
        />
      </Paper>

      {lastResult && (
        <Paper sx={{ p: 3, mb: 3 }}>
           <Typography variant="h6" gutterBottom>
            Resultado da Última Operação
          </Typography>
          
          <Alert 
            severity="success"
            sx={{ mb: 2 }}
          >
            {lastResult.message}
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Repositório:</strong> <code>{lastResult.directory}</code>
          </Typography>

          {lastResult.actionType === 'commit' && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Git Inicializado:</strong> {lastResult.gitInitialized ? 'Sim' : 'Não'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Commit Realizado:</strong> {lastResult.commitPerformed ? 'Sim' : 'Não'}
              </Typography>
            </>
          )}
        </Paper>
      )}

      {selectedProject && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Status do Git</Typography>
          {loadingStatus ? <CircularProgress /> :
            <Grid container spacing={2}>
              {status.map(projStatus => (
                <Grid item xs={12} md={status.length > 1 ? 6 : 12} key={projStatus.projectId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
                        {projStatus.projectTitle}
                      </Typography>
                      {!projStatus.isDirectory ? (
                        <Chip label="Diretório não encontrado" color="error" size="small" />
                      ) : !projStatus.isRepo ? (
                        <Chip label="Não é um repositório Git" color="warning" size="small" />
                      ) : (
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Total de alterações:</strong> 
                            <Chip label={projStatus.totalChanges} color="primary" size="small" sx={{ ml: 1 }}/>
                          </Typography>
                          <Box>
                            {projStatus.files.length > 0 ? 
                              projStatus.files.map(file => getFileStatusChip(file))
                              :
                              <Typography variant="caption" color="text.secondary">Nenhum arquivo alterado.</Typography>
                            }
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          }
        </Paper>
      )}
    </Container>
  );
};

export default GitPage;