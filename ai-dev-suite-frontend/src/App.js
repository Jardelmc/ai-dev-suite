import React, { useState, useMemo, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import getAppTheme from './theme';
import { ProjectProvider } from './contexts/ProjectContext';
import MainLayout from './components/Layout/MainLayout';
import AnalyzerPage from './pages/AnalyzerPage';
import CodeWriterPage from './pages/CodeWriterPage';
import GitPage from './pages/GitPage';
import PromptsPage from './pages/PromptsPage';
import ProjectsPage from './pages/ProjectsPage';
import MetricsPage from './pages/MetricsPage';
import TemplatesPage from './pages/TemplatesPage';
import ProjectBuilderPage from './pages/ProjectBuilderPage';
import FaviconGeneratorPage from './pages/FaviconGeneratorPage';
import GoDevPage from './pages/GoDevPage';
import { healthCheck } from './services/api';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const App = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [apiStatus, setApiStatus] = useState('checking');
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  React.useEffect(() => {
    checkApiHealth();
  }, []);
  const checkApiHealth = async () => {
    try {
      await healthCheck();
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('disconnected');
      showNotification('Não foi possível conectar com a API', 'error');
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProjectProvider>
          <Router>
            <MainLayout apiStatus={apiStatus} showNotification={showNotification}>
              <Routes>
                <Route path="/" element={<AnalyzerPage showNotification={showNotification} />} />
                <Route path="/analyzer" element={<AnalyzerPage showNotification={showNotification} />} />
                <Route path="/code-writer" element={<CodeWriterPage showNotification={showNotification} />} />
                <Route path="/git" element={<GitPage showNotification={showNotification} />} />
                <Route path="/projects" element={<ProjectsPage showNotification={showNotification} />} />
                <Route path="/prompts" element={<PromptsPage showNotification={showNotification} />} />
                <Route path="/metrics" element={<MetricsPage showNotification={showNotification} />} />
                <Route path="/go-dev" element={<GoDevPage showNotification={showNotification} />} />
                <Route path="/templates" element={<TemplatesPage showNotification={showNotification} />} />
                <Route path="/project-builder" element={<ProjectBuilderPage showNotification={showNotification} />} />
                <Route path="/favicon-generator" element={<FaviconGeneratorPage showNotification={showNotification} />} />
              </Routes>
            </MainLayout>
            <Snackbar
              open={notification.open}
              autoHideDuration={6000}
              onClose={closeNotification}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert
                onClose={closeNotification}
                severity={notification.severity}
                sx={{ width: '100%' }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </Router>
        </ProjectProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;