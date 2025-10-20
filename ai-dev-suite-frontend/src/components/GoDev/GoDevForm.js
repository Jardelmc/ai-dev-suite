import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { AutoFixHigh as GenerateIcon } from '@mui/icons-material';
import { getProject } from '../../services/api';

const GoDevForm = ({ project, onPromptGenerated, showNotification }) => {
  const [impactedApplications, setImpactedApplications] = useState([]);
  const [requestType, setRequestType] = useState('Nova funcionalidade');
  const [subProjects, setSubProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubProjects = async () => {
      if (project && !project.parentId && !project.isManual) {
        setLoading(true);
        try {
          const projectWithChildren = await getProject(project.id, true);
          const children = projectWithChildren.children || [];
          setSubProjects(children);
          setImpactedApplications([]); // Start with no applications selected
        } catch (error) {
          showNotification("Falha ao buscar sub-projetos: " + error.message, 'error');
        } finally {
          setLoading(false);
        }
      } else {
        setSubProjects([]);
        setImpactedApplications([]);
      }
    };

    fetchSubProjects();
    onPromptGenerated(''); // Clear prompt on project change
  }, [project]);

  const handleApplicationChange = (event) => {
    const { value, checked } = event.target;
    setImpactedApplications((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleRequestTypeChange = (event) => {
    setRequestType(event.target.value);
  };

  const generatePrompt = () => {
    let prompt = 'Analise PROFUNDAMENTE o projeto em anexo.\n\n';
    prompt += `**Tipo de Solicitação:** ${requestType}\n\n`;

    if (subProjects.length > 0) {
      if (impactedApplications.length > 0) {
        const selectedApps = subProjects.filter(p => impactedApplications.includes(p.id));
        prompt += `**Aplicações Impactadas:**\n${selectedApps.map(p => `- ${p.title}`).join('\n')}\n`;
      } else {
        prompt += '**Aplicações Impactadas:** Nenhuma aplicação específica foi marcada como impactada.\n'
      }
    } else if (project) {
      prompt += `**Aplicação Impactada:** ${project.title}\n`;
    }

    onPromptGenerated(prompt);
  };
  
  const isRootProjectWithSubProjects = subProjects.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        1. Configure o Prompt
      </Typography>

      {loading ? <CircularProgress /> :
        isRootProjectWithSubProjects && (
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Aplicações a serem Impactadas</FormLabel>
            <FormGroup>
              {subProjects.map((sub) => (
                <FormControlLabel
                  key={sub.id}
                  control={
                    <Checkbox
                      checked={impactedApplications.includes(sub.id)}
                      onChange={handleApplicationChange}
                      value={sub.id}
                      size="small"
                    />
                  }
                  label={sub.title}
                />
              ))}
            </FormGroup>
          </FormControl>
        )}
      
      <Divider sx={{ my: 2 }} />

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Tipo de Solicitação</FormLabel>
        <RadioGroup
          value={requestType}
          onChange={handleRequestTypeChange}
        >
          <FormControlLabel value="Nova funcionalidade" control={<Radio size="small" />} label="Nova funcionalidade" />
          <FormControlLabel value="Melhoria em funcionalidade existente" control={<Radio size="small"/>} label="Melhoria em funcionalidade" />
          <FormControlLabel value="Correção de Bug" control={<Radio size="small"/>} label="Correção de Bug" />
        </RadioGroup>
      </FormControl>

      <Button 
        variant="contained" 
        onClick={generatePrompt}
        startIcon={<GenerateIcon />}
        fullWidth
        size="large"
      >
        Gerar Prompt
      </Button>
    </Box>
  );
};

export default GoDevForm;