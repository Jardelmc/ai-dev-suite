import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Paper, Box, Alert, Grid } from '@mui/material';
import { useProjectContext } from '../contexts/ProjectContext';
import GoDevForm from '../components/GoDev/GoDevForm';
import PromptDisplay from '../components/GoDev/PromptDisplay';
import ActiveProjectDisplay from '../components/Layout/ActiveProjectDisplay';
import PromptSelectorModal from '../components/GoDev/PromptSelectorModal';

const GoDevPage = ({ showNotification }) => {
  const { selectedProject } = useProjectContext();
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  // Initialize performAutoAction based on localStorage or default to true
  const [performAutoAction, setPerformAutoAction] = useState(() => {
     const savedValue = localStorage.getItem('aiDevSuiteGoDevAutoAction');
     return savedValue !== null ? JSON.parse(savedValue) : true;
  });
  const [promptSelectorOpen, setPromptSelectorOpen] = useState(false);
  const [selectedLibraryPrompts, setSelectedLibraryPrompts] = useState([]);

  // Memoize handlePromptGenerated
  const handlePromptGenerated = useCallback((prompt, autoAction) => {
    let finalPrompt = '';
    if (selectedLibraryPrompts.length > 0) {
      const libraryContent = selectedLibraryPrompts.map(p => p.content).join('\n\n---\n\n');
      finalPrompt = `${libraryContent}\n\n---\n\n${prompt}`;
    } else {
      finalPrompt = prompt;
    }
    setGeneratedPrompt(finalPrompt);
    // Update the state AND save to localStorage when autoAction changes
    if (autoAction !== performAutoAction) {
        setPerformAutoAction(autoAction);
        try {
            localStorage.setItem('aiDevSuiteGoDevAutoAction', JSON.stringify(autoAction));
        } catch (error) {
            console.warn("Could not save auto action state to localStorage", error);
        }
    }
  }, [selectedLibraryPrompts, performAutoAction]); // Include performAutoAction here


  // Effect to clear prompt and selections when the selected project changes
  useEffect(() => {
    // Only clear if selectedProject exists (is not null/undefined)
    // This prevents clearing on initial mount if a project is loaded from storage
    if (selectedProject) {
        // Reset the generated prompt
        setGeneratedPrompt('');
        // Reset selected library prompts
        setSelectedLibraryPrompts([]);
        // Reset the auto action flag based on stored value or default
        const savedValue = localStorage.getItem('aiDevSuiteGoDevAutoAction');
        setPerformAutoAction(savedValue !== null ? JSON.parse(savedValue) : true);

    } else {
        // If no project is selected (cleared), also clear the prompt
        setGeneratedPrompt('');
        setSelectedLibraryPrompts([]);
        setPerformAutoAction(true); // Reset to default when no project
    }
    // Dependency only on selectedProject itself (or its ID for stability)
  }, [selectedProject]);


  const handleOpenPromptSelector = () => {
    setPromptSelectorOpen(true);
  };

  const handleClosePromptSelector = () => {
    setPromptSelectorOpen(false);
  };

  const handleSelectPrompts = (prompts) => {
    setSelectedLibraryPrompts(prompts);
    showNotification(`${prompts.length} prompt(s) selecionado(s) da biblioteca.`, 'success');

    // Automatically regenerate the prompt IF a base prompt exists
    // Find the base prompt part (the user-generated part after library prompts and separator)
    const separator = '\n\n---\n\n';
    let basePrompt = '';

    // Check if there was a previously generated prompt
    if (generatedPrompt) {
        const basePromptIndex = generatedPrompt.lastIndexOf(separator);
        // If library prompts were used before, extract the base part
        if (basePromptIndex !== -1 && selectedLibraryPrompts.length > 0) {
             basePrompt = generatedPrompt.substring(basePromptIndex + separator.length);
        } else {
            // If no library prompts were used before, the whole thing is the base
             basePrompt = generatedPrompt;
        }
    }

    // Regenerate using the extracted base prompt (if any) and current autoAction state
    // This ensures the display updates immediately with the newly selected library prompts
    // handlePromptGenerated needs to reconstruct the full prompt including library prompts
     let finalPrompt = '';
     if (prompts.length > 0) { // Use the newly selected prompts
       const libraryContent = prompts.map(p => p.content).join('\n\n---\n\n');
       finalPrompt = `${libraryContent}\n\n---\n\n${basePrompt}`; // Combine new library + old base
     } else {
       finalPrompt = basePrompt; // Just use the base if no library prompts are selected now
     }
     setGeneratedPrompt(finalPrompt);
     // Keep the current performAutoAction state, don't re-trigger it just for library selection
     // setPerformAutoAction(performAutoAction); // No need to set it to itself

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
                onOpenPromptSelector={handleOpenPromptSelector}
                selectedLibraryPromptsCount={selectedLibraryPrompts.length}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            {/* Display PromptDisplay section only if selectedProject exists */}
            {selectedProject && (
                 <Paper sx={{ p: 3, height: '100%' }}>
                    <PromptDisplay
                      prompt={generatedPrompt}
                      showNotification={showNotification}
                      // Pass performAutoAction only when the prompt is initially generated,
                      // not necessarily every time it updates (e.g., from library selection)
                      // Let PromptDisplay handle its internal useEffect based on the prompt content
                      performAutoAction={performAutoAction && generatedPrompt !== ''}
                    />
                 </Paper>
            )}
          </Grid>
        </Grid>
      )}
      <PromptSelectorModal
        open={promptSelectorOpen}
        onClose={handleClosePromptSelector}
        onSelect={handleSelectPrompts}
        showNotification={showNotification}
        initialSelection={selectedLibraryPrompts}
      />
    </Container>
  );
};

export default GoDevPage;