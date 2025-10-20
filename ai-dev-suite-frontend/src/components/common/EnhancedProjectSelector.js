import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  ButtonGroup,
  Tooltip,
} from "@mui/material";
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountTree as SubprojectIcon,
} from "@mui/icons-material";
import { getProjects } from "../../services/api";
import ProjectManager from "../Projects/ProjectManager";

const EnhancedProjectSelector = ({
  value,
  onChange,
  allowDirectPath = true,
  label = "Configuração do Projeto",
  required = false,
  helperText = "",
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState("project");
  const [selectedProject, setSelectedProject] = useState("");
  const [directPath, setDirectPath] = useState("");
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (value) {
      if (value.projectId) {
        setSelectionMode("project");
        setSelectedProject(value.projectId);
        const project = projects.find((p) => p.id === value.projectId);
        setSelectedProjectDetails(project);
      } else if (value.projectDir) {
        setSelectionMode("direct");
        setDirectPath(value.projectDir);
        setSelectedProjectDetails(null);
      }
    } else {
      setSelectionMode("project");
      setSelectedProject("");
      setDirectPath("");
      setSelectedProjectDetails(null);
    }
  }, [value, projects]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectList = await getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setSelectionMode(mode);
    if (mode === "project") {
      onChange(selectedProject ? { projectId: selectedProject } : {});
    } else {
      onChange(directPath ? { projectDir: directPath } : {});
    }
  };

  const handleProjectChange = (event) => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    const project = projects.find((p) => p.id === projectId);
    setSelectedProjectDetails(project);
    onChange(projectId ? { projectId } : {});
  };

  const handleDirectPathChange = (event) => {
    const path = event.target.value;
    setDirectPath(path);
    setSelectedProjectDetails(null);
    onChange(path ? { projectDir: path } : {});
  };

  const getProjectsByParent = (parentId = null) => {
    return projects.filter((p) => p.parentId === parentId);
  };

  const renderProjectOption = (project, level = 0) => {
    return (
      <MenuItem key={project.id} value={project.id} sx={{ pl: 2 + level * 2 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
        >
          {level > 0 ? (
            <SubprojectIcon fontSize="small" />
          ) : (
            <FolderIcon fontSize="small" />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" fontWeight={level === 0 ? 600 : 400}>
              {project.title}
            </Typography>
            {project.directory && (
              <Typography variant="caption" color="text.secondary">
                {project.directory}
              </Typography>
            )}
          </Box>
          {level > 0 && <Chip label="Sub" size="small" variant="outlined" />}
        </Box>
      </MenuItem>
    );
  };

  const renderProjectTree = () => {
    const rootProjects = getProjectsByParent();
    const allOptions = [];

    rootProjects.forEach((project) => {
      allOptions.push(renderProjectOption(project, 0));
      const children = getProjectsByParent(project.id);
      children.forEach((child) => {
        allOptions.push(renderProjectOption(child, 1));
      });
    });

    return allOptions;
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {label}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Atualizar lista de projetos">
            <IconButton size="small" onClick={loadProjects} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Gerenciar projetos">
            <IconButton
              size="small"
              onClick={() => setProjectManagerOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={showAdvanced ? "Ocultar opções" : "Mostrar opções avançadas"}
          >
            <IconButton
              size="small"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {helperText && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {helperText}
        </Alert>
      )}

      <ButtonGroup variant="outlined" sx={{ mb: 2 }} fullWidth>
        <Button
          variant={selectionMode === "project" ? "contained" : "outlined"}
          onClick={() => handleModeChange("project")}
          startIcon={<FolderIcon />}
        >
          Projeto Salvo
        </Button>
        {allowDirectPath && (
          <Button
            variant={selectionMode === "direct" ? "contained" : "outlined"}
            onClick={() => handleModeChange("direct")}
            startIcon={<FolderOpenIcon />}
          >
            Diretório Manual
          </Button>
        )}
      </ButtonGroup>

      {selectionMode === "project" ? (
        <Box>
          <FormControl fullWidth required={required}>
            <InputLabel id="project-select-label">
              Selecione o Projeto
            </InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProject}
              label="Selecione o Projeto"
              onChange={handleProjectChange}
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Carregando...
                </MenuItem>
              ) : projects.length === 0 ? (
                <MenuItem disabled>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AddIcon fontSize="small" />
                    Nenhum projeto encontrado
                  </Box>
                </MenuItem>
              ) : (
                renderProjectTree()
              )}
            </Select>
          </FormControl>

          {selectedProjectDetails && (
            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  {selectedProjectDetails.parentId ? (
                    <SubprojectIcon color="primary" />
                  ) : (
                    <FolderIcon color="primary" />
                  )}
                  <Typography variant="h6">
                    {selectedProjectDetails.title}
                  </Typography>
                  {selectedProjectDetails.parentId && (
                    <Chip
                      label="Subprojeto"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>

                {selectedProjectDetails.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedProjectDetails.description}
                  </Typography>
                )}

                {selectedProjectDetails.directory && (
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    📁 {selectedProjectDetails.directory}
                  </Typography>
                )}

                {!selectedProjectDetails.directory && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Este projeto não possui diretório configurado
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        <TextField
          fullWidth
          label="Caminho do Diretório"
          value={directPath}
          onChange={handleDirectPathChange}
          placeholder="/caminho/completo/para/o/projeto"
          required={required}
          helperText="Informe o caminho absoluto para o diretório do projeto"
          InputProps={{
            sx: { fontFamily: "monospace" },
          }}
        />
      )}

      <Collapse in={showAdvanced}>
        <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Opções Avançadas
          </Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setProjectManagerOpen(true)}
            sx={{ mr: 1 }}
          >
            Novo Projeto
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadProjects}
            disabled={loading}
          >
            Recarregar
          </Button>
        </Box>
      </Collapse>

      <ProjectManager
        open={projectManagerOpen}
        onClose={() => setProjectManagerOpen(false)}
        onProjectCreated={loadProjects}
      />
    </Box>
  );
};

export default EnhancedProjectSelector;
