import React, {
  useState,
  useMemo,
  createContext,
  useEffect,
  useCallback,
} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Snackbar, Alert } from "@mui/material";
import getAppTheme from "./theme";
import { ProjectProvider } from "./contexts/ProjectContext";
import MainLayout from "./components/Layout/MainLayout";
import AnalyzerPage from "./pages/AnalyzerPage";
import CodeWriterPage from "./pages/CodeWriterPage";
import GitPage from "./pages/GitPage";
import PromptsPage from "./pages/PromptsPage";
import ProjectsPage from "./pages/ProjectsPage";
import MetricsPage from "./pages/MetricsPage";
import TemplatesPage from "./pages/TemplatesPage";
import ProjectBuilderPage from "./pages/ProjectBuilderPage";
import FaviconGeneratorPage from "./pages/FaviconGeneratorPage";
import GoDevPage from "./pages/GoDevPage";
import GitConfigPage from "./pages/GitConfigPage";
import DatabasePage from "./pages/DatabasePage"; // Import the new DatabasePage
import { healthCheck } from "./services/api";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const App = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
    key: 0, // Key to allow showing the same message consecutively
  });
  const [apiStatus, setApiStatus] = useState("checking");

  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem("ai-dev-suite-theme-mode");
      return savedMode || "light";
    } catch (error) {
      console.warn("Could not read theme mode from localStorage", error);
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ai-dev-suite-theme-mode", mode);
    } catch (error) {
      console.warn("Could not save theme mode to localStorage", error);
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await healthCheck();
      setApiStatus("connected");
    } catch (error) {
      setApiStatus("disconnected");
      showNotification("Não foi possível conectar com a API", "error");
    }
  };

  // Wrap showNotification in useCallback to stabilize its reference
  const showNotification = useCallback((message, severity = "info") => {
    setNotification((prev) => ({
      open: true,
      message,
      severity,
      key: prev.key + 1, // Increment key to re-trigger Snackbar even if message/severity is the same
    }));
  }, []);

  const closeNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProjectProvider>
          <Router>
            <MainLayout
              apiStatus={apiStatus}
              showNotification={showNotification}
            >
              <Routes>
                <Route
                  path="/"
                  element={<AnalyzerPage showNotification={showNotification} />}
                />
                <Route
                  path="/analyzer"
                  element={<AnalyzerPage showNotification={showNotification} />}
                />
                <Route
                  path="/code-writer"
                  element={
                    <CodeWriterPage showNotification={showNotification} />
                  }
                />
                <Route
                  path="/git"
                  element={<GitPage showNotification={showNotification} />}
                />
                <Route
                  path="/projects"
                  element={<ProjectsPage showNotification={showNotification} />}
                />
                <Route
                  path="/prompts"
                  element={<PromptsPage showNotification={showNotification} />}
                />
                <Route
                  path="/metrics"
                  element={<MetricsPage showNotification={showNotification} />}
                />
                <Route
                  path="/go-dev"
                  element={<GoDevPage showNotification={showNotification} />}
                />
                <Route
                  path="/templates"
                  element={
                    <TemplatesPage showNotification={showNotification} />
                  }
                />
                <Route
                  path="/project-builder"
                  element={
                    <ProjectBuilderPage showNotification={showNotification} />
                  }
                />
                <Route
                  path="/favicon-generator"
                  element={
                    <FaviconGeneratorPage showNotification={showNotification} />
                  }
                />
                <Route
                  path="/git-config"
                  element={
                    <GitConfigPage showNotification={showNotification} />
                  }
                />
                <Route
                  path="/database"
                  element={<DatabasePage showNotification={showNotification} />}
                />
              </Routes>
            </MainLayout>
            <Snackbar
              key={notification.key} // Use key here
              open={notification.open}
              autoHideDuration={6000}
              onClose={closeNotification}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Alert
                onClose={closeNotification}
                severity={notification.severity}
                sx={{ width: "100%" }}
                elevation={6}
                variant="filled"
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
