import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Modal,
  Stack
} from "@mui/material";
import { Add as AddIcon, Block as IgnoreIcon, CloudDownload as ImportIcon } from '@mui/icons-material';
import { getProjects } from "../services/api";
import ProjectList from "../components/Projects/ProjectList";
import ProjectDetail from "../components/Projects/ProjectDetail";
import ProjectForm from "../components/Projects/ProjectForm";
import IgnoreManager from "../components/Projects/IgnoreManager";
import GitImportModal from "../components/Projects/GitImportModal";

const ProjectsPage = ({ showNotification }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('detail');
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [parentForNewSubproject, setParentForNewSubproject] = useState(null);
  const [ignoreModalOpen, setIgnoreModalOpen] = useState(false);
  const [projectForIgnore, setProjectForIgnore] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadProjectsData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const projectList = await getProjects();
      const projectMap = projectList.reduce((acc, project) => {
        acc[project.id] = { ...project, children: [] };
        return acc;
      }, {});

      const rootProjects = [];
      projectList.forEach((project) => {
        if (project.parentId && projectMap[project.parentId]) {
          projectMap[project.parentId].children.push(projectMap[project.id]);
        } else {
          rootProjects.push(projectMap[project.id]);
        }
      });
      setProjects(rootProjects);

      if (selectedProject) {
        const updatedSelected = projectList.find(p => p.id === selectedProject.id);
        if (updatedSelected) {
          const updatedSelectedWithChildren = projectMap[updatedSelected.id];
          setSelectedProject(updatedSelectedWithChildren);
        } else {
          setSelectedProject(null);
          setView('detail');
        }
      }

    } catch (e) {
      const msg = "Erro ao carregar projetos: " + e.message;
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedProject, showNotification]);

  useEffect(() => {
    loadProjectsData();
  }, []);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setView('detail');
    setProjectToEdit(null);
    setParentForNewSubproject(null);
  };

  const handleStartCreate = () => {
    setProjectToEdit(null);
    setParentForNewSubproject(null);
    setView('create');
  };

  const handleStartEdit = (project) => {
    setProjectToEdit(project);
    setView('edit');
  };

  const handleStartCreateSubproject = (parentProject) => {
    setProjectToEdit(null);
    setParentForNewSubproject(parentProject);
    setView('create');
  };

  const handleCancelForm = () => {
    setView('detail');
    setProjectToEdit(null);
    setParentForNewSubproject(null);
  };

  const handleSaveSuccess = (message) => {
    showNotification(message, 'success');
    loadProjectsData();
    setView('detail');
    setProjectToEdit(null);
    setParentForNewSubproject(null);
  };

  const openIgnoreManager = (project = null) => {
    setProjectForIgnore(project);
    setIgnoreModalOpen(true);
  };

  const closeIgnoreManager = () => {
    setIgnoreModalOpen(false);
    setProjectForIgnore(null);
  };

  const handleImportSuccess = (message) => {
    showNotification(message, 'success');
    setImportModalOpen(false);
    loadProjectsData();
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gerenciamento de Projetos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize, visualize e gerencie todos os seus projetos e sub-sistemas em um único lugar.
          </Typography>
        </Box>
        <Stack direction="column" spacing={1} alignItems="flex-end">
            <Stack direction="row" spacing={1}>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IgnoreIcon />}
                    onClick={() => openIgnoreManager(null)}
                >
                    Ignorados Globais
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ImportIcon />}
                    onClick={() => setImportModalOpen(true)}
                >
                    Importar Sub-Projeto Git
                </Button>
            </Stack>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleStartCreate}
            >
                Novo Projeto Raiz
            </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {loading && projects.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={handleSelectProject}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 3, height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {view === 'detail' && (
              <ProjectDetail
                project={selectedProject}
                onEdit={handleStartEdit}
                onAddSubproject={handleStartCreateSubproject}
                onManageIgnores={openIgnoreManager}
                onDeleteSuccess={handleSaveSuccess}
                showNotification={showNotification}
              />
            )}
            {(view === 'create' || view === 'edit') && (
              <ProjectForm
                projectToEdit={projectToEdit}
                parentProject={parentForNewSubproject}
                projects={projects}
                onSaveSuccess={handleSaveSuccess}
                onCancel={handleCancelForm}
                showNotification={showNotification}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
      
        <Modal
            open={ignoreModalOpen}
            onClose={closeIgnoreManager}
            aria-labelledby="ignore-manager-title"
        >
          <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 600 },
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 2
            }}>
                <IgnoreManager
                    project={projectForIgnore}
                    onAction={(msg, sev) => showNotification(msg, sev)}
                    onClose={closeIgnoreManager}
                />
            </Box>
        </Modal>
        <Modal
            open={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            aria-labelledby="import-git-subproject-title"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 700 },
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 2,
                p: 4,
            }}>
                <GitImportModal
                    projects={projects.filter(p => !p.parentId)}
                    onClose={() => setImportModalOpen(false)}
                    onSuccess={handleImportSuccess}
                    showNotification={showNotification}
                />
            </Box>
        </Modal>
    </Container>
  );
};

export default ProjectsPage;