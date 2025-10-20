import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import NavigationHeader from './NavigationHeader';
import ProjectPanel from './ProjectPanel';
import { useProjectContext } from '../../contexts/ProjectContext';
import OpenInVSCodeButton from './OpenInVSCodeButton';
import OpenInExplorerButton from './OpenInExplorerButton';

const MainLayout = ({ children, apiStatus, showNotification }) => {
  const location = useLocation();
  const { selectProject } = useProjectContext();

  const handleProjectSelect = (project) => {
    selectProject(project);
    if (showNotification) {
      showNotification(`Projeto "${project.title}" selecionado!`, 'success');
    }
  };
  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <NavigationHeader apiStatus={apiStatus} />
      
      <ProjectPanel onProjectSelect={handleProjectSelect} />
      
      <OpenInVSCodeButton showNotification={showNotification} />
      <OpenInExplorerButton showNotification={showNotification} />
      
      <Box
        sx={{
          marginLeft: '64px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          '@media (min-width: 1200px)': {
            marginLeft: '320px',
          },
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            mt: 3, 
            mb: 4, 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;