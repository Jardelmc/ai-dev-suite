import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  TextField,
} from '@mui/material';
import { AutoFixHigh as GenerateIcon, LibraryBooks as LibraryIcon } from '@mui/icons-material';
import { getProject } from '../../services/api';
const GoDevForm = ({ project, onPromptGenerated, showNotification, onOpenPromptSelector, selectedLibraryPromptsCount }) => {
  const [impactedApplications, setImpactedApplications] = useState([]);
  const [requestType, setRequestType] = useState('Nova funcionalidade');
  const [functionalityDetail, setFunctionalityDetail] = useState('');
  const [subProjects, setSubProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoAction, setAutoAction] = useState(true);
 useEffect(() => {
    const savedValue = localStorage.getItem('aiDevSuiteGoDevAutoAction');
    if (savedValue !== null) {
      setAutoAction(JSON.parse(savedValue));
    }
  }, []);
 useEffect(() => {
    localStorage.setItem('aiDevSuiteGoDevAutoAction', JSON.stringify(autoAction));
  }, [autoAction]);
  const fetchSubProjects = useCallback(async () => {
    if (project && !project.parentId && !project.isManual) {
      setLoading(true);
      try {
        const projectWithChildren = await getProject(project.id, true);
        const children = projectWithChildren.children || [];
        setSubProjects(children);
        setImpactedApplications([]);
      } catch (error) {

        if (showNotification) {
            showNotification("Falha ao buscar sub-projetos: " + error.message, 'error');
        } else {
            console.error("Falha ao buscar sub-projetos: " + error.message);
        }
      } finally {
        setLoading(false);
      }

     } else {
      setSubProjects([]);
      setImpactedApplications([]);
    }
  }, [project, showNotification]);
 useEffect(() => {
    fetchSubProjects();
  }, [fetchSubProjects]);


  const handleApplicationChange = (event) => {
    const { value, checked } = event.target;
 setImpactedApplications((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
 };

  const handleRequestTypeChange = (event) => {
    setRequestType(event.target.value);
  };
 const handleFunctionalityDetailChange = (event) => {
    setFunctionalityDetail(event.target.value);
  };
 const generatePrompt = () => {
    let prompt = 'Analise PROFUNDAMENTE o projeto em anexo.\n\n';
 prompt += `**Tipo de Solicitação:** ${requestType}`;
    if (showDetailField && functionalityDetail.trim()) {
      prompt += `\n**Detalhe:** ${functionalityDetail.trim()}\n\n`;
 } else {
      prompt += '\n\n';
 }

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

    onPromptGenerated(prompt, autoAction);
  };

  const isRootProjectWithSubProjects = subProjects.length > 0;
  const showDetailField = true;

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

      <FormControl component="fieldset" sx={{ mb: 2 }}> {/* Reduced margin bottom */}
        <FormLabel component="legend">Tipo de Solicitação</FormLabel>
        <RadioGroup
          value={requestType}
          onChange={handleRequestTypeChange}
        >
          <FormControlLabel value="Nova funcionalidade" control={<Radio size="small" />} label="Nova funcionalidade" />
          <FormControlLabel value="Melhoria em funcionalidade
 existente" control={<Radio size="small" />} label="Melhoria em funcionalidade" />
          <FormControlLabel value="Correção de Bug" control={<Radio size="small" />} label="Correção de Bug" />
        </RadioGroup>
      </FormControl>

      {showDetailField && (
        <TextField
          label="Qual funcionalidade/bug/detalhe?"
          value={functionalityDetail}

           onChange={handleFunctionalityDetailChange}
          fullWidth
          margin="dense"
          size="small"
          placeholder="Ex: Tela de login, Cálculo de frete, Nova API..."
          sx={{ mb: 3 }}
        />
      )}


      <Divider sx={{ my: 2 }} />


       <Button
        variant="outlined"
        onClick={onOpenPromptSelector}
        startIcon={<LibraryIcon />}
        fullWidth
        sx={{ mb: 2 }}
      >
        Incluir Prompts da Biblioteca
        {selectedLibraryPromptsCount > 0 && <Chip label={selectedLibraryPromptsCount} size="small" sx={{ ml: 1 }} />}
      </Button>

      <FormGroup>

       <FormControlLabel
          control={
            <Checkbox
              checked={autoAction}
              onChange={(e) => setAutoAction(e.target.checked)}
            />
          }
          label="Copiar e abrir agente automaticamente"
        />

     </FormGroup>

      <Button
        variant="contained"
        onClick={generatePrompt}
        startIcon={<GenerateIcon />}
        fullWidth
        size="large"
        sx={{ mt: 2 }}
        disabled={!project}
      >
        Gerar Prompt
      </Button>

   </Box>
  );
};

export default GoDevForm;