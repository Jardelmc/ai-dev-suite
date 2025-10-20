import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
} from '@mui/material';
import RootProjectStep from '../components/ProjectBuilder/RootProjectStep';
import SubProjectsStep from '../components/ProjectBuilder/SubProjectsStep';
import SummaryAndBuildStep from '../components/ProjectBuilder/SummaryAndBuildStep';
import GeneratePromptStep from '../components/ProjectBuilder/GeneratePromptStep';

const steps = ['Projeto Raiz', 'Sub-Projetos', 'Construção', 'Gerar Prompt'];

const ProjectBuilderPage = ({ showNotification }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    rootProject: { name: '', description: '', directory: '' },
    subProjects: [],
  });
  const [buildResult, setBuildResult] = useState(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const updateProjectData = (data) => {
    setProjectData((prev) => ({ ...prev, ...data }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <RootProjectStep
            data={projectData.rootProject}
            onUpdate={(data) => updateProjectData({ rootProject: data })}
          />
        );
      case 1:
        return (
          <SubProjectsStep
            subProjects={projectData.subProjects}
            onUpdate={(data) => updateProjectData({ subProjects: data })}
            showNotification={showNotification}
          />
        );
      case 2:
        return (
          <SummaryAndBuildStep
            data={projectData}
            onBuildSuccess={(result) => {
              setBuildResult(result);
              handleNext();
            }}
            showNotification={showNotification}
          />
        );
      case 3:
        return (
          <GeneratePromptStep
            buildResult={buildResult}
            showNotification={showNotification}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Siga os passos para criar a estrutura do seu novo projeto e gerar um prompt técnico para desenvolvimento.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || activeStep >= 2}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep < 2 && (
               <Button onClick={handleNext}>
                Próximo
               </Button>
            )}
             {activeStep === 3 && (
                <Button onClick={() => setActiveStep(0)}>
                    Criar Novo Projeto
                </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectBuilderPage;