import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Folder as FolderIcon,
  AccountTree as SubprojectIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  FolderOpen as FolderOpenIcon,
} from "@mui/icons-material";
import { useProjectContext } from "../../contexts/ProjectContext";

const GlobalProjectSelector = () => {
  const {
    selectedProject,
    projects,
    loading,
    selectProject,
    clearSelection,
    loadProjects,
  } = useProjectContext();

  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualDirectory, setManualDirectory] = useState("");

  const handleProjectChange = (event) => {
    const projectId = event.target.value;
    if (projectId === "") {
      clearSelection();
    } else {
      const project = projects.find((p) => p.id === projectId);
      selectProject(project);
    }
  };

  const handleManualDirectory = () => {
    if (manualDirectory.trim()) {
      selectProject({
        id: "manual",
        title: "Diretório Manual",
        directory: manualDirectory.trim(),
        isManual: true,
      });
      setManualDialogOpen(false);
      setManualDirectory("");
    }
  };

  const renderProjectOption = (project) => {
    const isSubproject = !!project.parentId;
    const parentProject = isSubproject
      ? projects.find((p) => p.id === project.parentId)
      : null;

    return (
      <MenuItem key={project.id} value={project.id}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
        >
          {isSubproject ? (
            <SubprojectIcon fontSize="small" />
          ) : (
            <FolderIcon fontSize="small" />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" fontWeight={isSubproject ? 400 : 600}>
              {isSubproject && parentProject ? `${parentProject.title} > ` : ""}
              {project.title}
            </Typography>
            {project.directory && (
              <Typography variant="caption" color="text.secondary">
                {project.directory}
              </Typography>
            )}
          </Box>
          {isSubproject && <Chip label="Sub" size="small" variant="outlined" />}
        </Box>
      </MenuItem>
    );
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 400 }}>
      <FormControl size="small" sx={{ minWidth: 300, flexGrow: 1 }}>
        <InputLabel id="global-project-select-label">Projeto Ativo</InputLabel>
        <Select
          labelId="global-project-select-label"
          value={selectedProject?.id || ""}
          label="Projeto Ativo"
          onChange={handleProjectChange}
          disabled={loading}
        >
          <MenuItem value="">
            <Typography variant="body2" color="text.secondary">
              Nenhum projeto selecionado
            </Typography>
          </MenuItem>

          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Carregando...
            </MenuItem>
          ) : (
            projects.map((project) => renderProjectOption(project))
          )}
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Usar diretório manual">
          <IconButton
            size="small"
            onClick={() => setManualDialogOpen(true)}
            color="primary"
          >
            <FolderOpenIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Atualizar projetos">
          <IconButton size="small" onClick={loadProjects} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        {selectedProject && (
          <Tooltip title="Limpar seleção">
            <IconButton size="small" onClick={clearSelection} color="error">
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {selectedProject && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={
              selectedProject.isManual ? (
                <FolderOpenIcon />
              ) : selectedProject.parentId ? (
                <SubprojectIcon />
              ) : (
                <FolderIcon />
              )
            }
            label={selectedProject.title}
            color="primary"
            size="small"
            variant="filled"
          />
        </Box>
      )}

      <Dialog
        open={manualDialogOpen}
        onClose={() => setManualDialogOpen(false)}
      >
        <DialogTitle>Diretório Manual</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Caminho do Diretório"
            fullWidth
            variant="outlined"
            value={manualDirectory}
            onChange={(e) => setManualDirectory(e.target.value)}
            placeholder="/caminho/completo/para/o/projeto"
            helperText="Informe o caminho absoluto para o diretório do projeto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleManualDirectory}
            variant="contained"
            disabled={!manualDirectory.trim()}
          >
            Selecionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GlobalProjectSelector;
