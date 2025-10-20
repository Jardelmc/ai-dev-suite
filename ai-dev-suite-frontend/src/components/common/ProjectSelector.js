import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getProjects } from '../../services/api';

const ProjectSelector = ({ 
  value, 
  onChange, 
  allowDirectPath = true, 
  label = "Selecione o Projeto ou Diretório",
  required = false 
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectionType, setSelectionType] = useState('project');
  const [selectedProject, setSelectedProject] = useState('');
  const [directPath, setDirectPath] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectList = await getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionTypeChange = (event) => {
    const newType = event.target.value;
    setSelectionType(newType);
    
    if (newType === 'project') {
      onChange({ projectId: selectedProject });
    } else {
      onChange({ projectDir: directPath });
    }
  };

  const handleProjectChange = (event) => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    onChange({ projectId });
  };

  const handleDirectPathChange = (event) => {
    const path = event.target.value;
    setDirectPath(path);
    onChange({ projectDir: path });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      
      <RadioGroup
        row
        value={selectionType}
        onChange={handleSelectionTypeChange}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="project" control={<Radio />} label="Projeto Salvo" />
        {allowDirectPath && (
          <FormControlLabel value="direct" control={<Radio />} label="Diretório Manual" />
        )}
      </RadioGroup>

      {selectionType === 'project' ? (
        <FormControl fullWidth required={required}>
          <InputLabel id="project-select-label">Projeto</InputLabel>
          <Select
            labelId="project-select-label"
            value={selectedProject}
            label="Projeto"
            onChange={handleProjectChange}
            disabled={loading}
          >
            {loading ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Carregando...
              </MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                  {project.directory && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({project.directory})
                    </Typography>
                  )}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          label="Caminho do Diretório"
          value={directPath}
          onChange={handleDirectPathChange}
          placeholder="/caminho/para/o/projeto"
          required={required}
          helperText="Informe o caminho completo para o diretório do projeto"
        />
      )}
    </Box>
  );
};

export default ProjectSelector;