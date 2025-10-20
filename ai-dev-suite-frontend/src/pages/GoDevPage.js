import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Alert, Grid, Divider } from '@mui/material';
import { useProjectContext } from '../contexts/ProjectContext';
import GoDevForm from '../components/GoDev/GoDevForm';
import PromptDisplay from '../components/GoDev/PromptDisplay';
import ActiveProjectDisplay from '../components/Layout/ActiveProjectDisplay';

const GoDevPage = ({ showNotification }) => {
  const { selectedProject } = useProjectContext();
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handlePromptGenerated = (prompt) => {
    setGeneratedPrompt(prompt);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Go Dev
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Acelere seu desenvolvimento gerando um prompt inicial detalhado para a LLM com base no contexto do seu projeto ativo.
        </Typography>
      </Box>

      {!selectedProject ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Nenhum projeto selecionado.</strong> Por favor, selecione um projeto no painel lateral para começar.
          </Typography>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ActiveProjectDisplay project={selectedProject} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <GoDevForm 
                project={selectedProject} 
                onPromptGenerated={handlePromptGenerated} 
                showNotification={showNotification}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            {generatedPrompt && (
              <Paper sx={{ p: 3, height: '100%' }}>
                <PromptDisplay 
                  prompt={generatedPrompt} 
                  showNotification={showNotification} 
                />
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default GoDevPage;