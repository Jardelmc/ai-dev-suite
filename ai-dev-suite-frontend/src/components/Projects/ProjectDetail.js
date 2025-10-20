import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Block as IgnoreIcon,
  Folder as FolderIcon,
  AccountTree as SubprojectIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { deleteProject, getIgnoresForProject } from '../../services/api';
import IgnoreListDisplay from './IgnoreListDisplay';

const ProjectDetail = ({ 
  project, 
  onEdit, 
  onAddSubproject, 
  onManageIgnores, 
  onDeleteSuccess,
  showNotification 
}) => {
  const [ignores, setIgnores] = useState({ global: [], project: [] });
  const [loadingIgnores, setLoadingIgnores] = useState(false);
  const [showIgnores, setShowIgnores] = useState(false);

  useEffect(() => {
    const fetchIgnores = async () => {
      if (project) {
        setLoadingIgnores(true);
        try {
          const ignoreData = await getIgnoresForProject(project.id);
          setIgnores({
            global: ignoreData.global || [],
            project: ignoreData.project || []
          });
        } catch (error) {
          showNotification(`Erro ao carregar itens ignorados: ${error.message}`, 'error');
        } finally {
          setLoadingIgnores(false);
        }
      }
    };

    if (showIgnores) {
      fetchIgnores();
    }
  }, [project, showNotification, showIgnores]);

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <FolderIcon sx={{ fontSize: 60, color: 'grey.400' }} />
        <Typography variant="h6" color="text.secondary">
          Selecione um projeto para ver os detalhes
        </Typography>
      </Box>
    );
  }

  const handleDelete = async () => {
    if (project.children && project.children.length > 0) {
      showNotification('Não é possível excluir um projeto que possui sub-projetos.', 'error');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o projeto "${project.title}"?`)) {
      try {
        await deleteProject(project.id);
        onDeleteSuccess('Projeto excluído com sucesso!');
      } catch (error) {
        showNotification(`Erro ao excluir projeto: ${error.message}`, 'error');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {project.title}
          </Typography>
          <Chip
            icon={project.parentId ? <SubprojectIcon /> : <FolderIcon />}
            label={project.parentId ? 'Sub-Projeto' : 'Projeto Raiz'}
            color={project.parentId ? 'secondary' : 'primary'}
            size="small"
          />
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(project)}
            sx={{ mr: 1 }}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Informações do Projeto
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Descrição:</strong>
                </Typography>
                <Typography variant="body1" paragraph>
                  {project.description || 'Sem descrição'}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Diretório:</strong>
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  {project.directory || 'Não configurado'}
                </Typography>

                {project.children && project.children.length > 0 && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Sub-projetos:</strong>
                    </Typography>
                    <List dense>
                      {project.children.map((child) => (
                        <ListItem key={child.id}>
                          <ListItemIcon>
                            <SubprojectIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={child.title} secondary={child.directory} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            </CardContent>
            <CardActions>
              {!project.parentId && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onAddSubproject(project)}
                >
                  Adicionar Sub-projeto
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Arquivos e Diretórios Ignorados
                </Typography>
                <Button
                  size="small"
                  startIcon={showIgnores ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  onClick={() => setShowIgnores(!showIgnores)}
                >
                  {showIgnores ? 'Ocultar' : 'Mostrar'}
                </Button>
              </Box>

              {showIgnores ? (
                loadingIgnores ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <IgnoreListDisplay title="Específicos deste Projeto" items={ignores.project} />
                    <IgnoreListDisplay title="Globais" items={ignores.global} />
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Os arquivos ignorados não aparecerão nas análises de métricas e no analisador de projeto.
                    </Alert>
                  </>
                )
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Clique em "Mostrar" para carregar e visualizar os itens ignorados.
                </Alert>
              )}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<IgnoreIcon />}
                onClick={() => onManageIgnores(project)}
              >
                Gerenciar Ignorados do Projeto
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetail;