import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import { useProjectContext } from "../contexts/ProjectContext";
import {
  getProjectMetrics,
  createIgnore,
  analyzeProject,
} from "../services/api"; // Import analyzeProject
import {
  BarChart as BarChartIcon,
  Block as IgnoreIcon,
  FolderSpecial as DirectoryIcon,
  // ContentCopy as CopyIcon, // No longer needed directly here for refactor
} from "@mui/icons-material";
import DirectoryMetricsTable from "../components/Metrics/DirectoryMetricsTable";
import { getRefactorFilePrompt } from "../utils/prompts/promptAgentCodeRefactor";
import ProjectMetricsTable from "../components/Metrics/ProjectMetricsTable"; // Import the updated component

// getLineColor function remains the same
const getLineColor = (lines) => {
  if (lines > 600) return "#f44336";
  if (lines > 400) return "#ff9800";
  if (lines > 200) return "#ffc107";
  return "#4caf50";
};

const MetricCard = ({ title, value, color = "primary", icon }) => (
  <Card elevation={2}>
    <CardContent sx={{ textAlign: "center" }}>
      {icon}
      <Typography
        variant="h4"
        sx={{ color: `${color}.main`, fontWeight: "bold" }}
      >
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const MetricsPage = ({ showNotification }) => {
  const { selectedProject, getProjectSelection } = useProjectContext(); // Get getProjectSelection
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // Add state for action loading

  const fetchMetrics = useCallback(async () => {
    if (!selectedProject) {
      setMetrics(null);
      return;
    }
    setLoading(true);
    try {
      // Use getProjectSelection to include exclusions
      const selection = getProjectSelection();
      const result = await getProjectMetrics(selection);
      setMetrics(result);
    } catch (error) {
      showNotification(error.message || "Erro ao buscar métricas", "error");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, getProjectSelection, showNotification]); // Add getProjectSelection dependency

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleIgnoreFile = async (filePath, projectId) => {
    const fileName = filePath.split(/[\\/]/).pop();
    if (!fileName) {
      showNotification("Caminho de arquivo inválido.", "error");
      return;
    }

    try {
      await createIgnore({ path: fileName, scope: "project", projectId });
      showNotification(
        `'${fileName}' adicionado à lista de ignorados do projeto.`,
        "success"
      );
      fetchMetrics();
    } catch (error) {
      showNotification(error.message || "Erro ao ignorar arquivo", "error");
    }
  };

  const handleIgnoreDirectory = async (fullDirectoryPath) => {
    const pathParts = fullDirectoryPath.split("/");
    const projectTitle = pathParts[0];
    const project = metrics?.projects.find(
      (p) => p.projectTitle === projectTitle
    );
    if (!project) {
      showNotification(
        `Projeto '${projectTitle}' não encontrado para associar a regra.`,
        "error"
      );
      return;
    }

    const directoryToIgnore = pathParts[pathParts.length - 1];
    if (directoryToIgnore === ".") {
      showNotification(
        "Não é possível ignorar o diretório raiz a partir desta visualização.",
        "warning"
      );
      return;
    }

    if (
      !window.confirm(
        `Tem certeza que deseja ignorar o diretório '${directoryToIgnore}' no projeto '${project.projectTitle}'?`
      )
    ) {
      return;
    }

    try {
      await createIgnore({
        path: directoryToIgnore,
        scope: "project",
        projectId: project.projectId,
      });
      showNotification(
        `'${directoryToIgnore}' adicionado à lista de ignorados do projeto '${project.projectTitle}'.`,
        "success"
      );
      fetchMetrics();
    } catch (error) {
      showNotification(error.message || "Erro ao ignorar diretório.", "error");
    }
  };

  // --- New Refactor Action Handler ---
  const handleRefactorAction = async (filePath) => {
    if (!selectedProject) {
      showNotification("Nenhum projeto selecionado.", "warning");
      return;
    }
    setActionLoading(true); // Start loading indicator for the action button
    let copied = false;
    let analyzed = false;
    let agentOpened = false;

    // 1. Copy Prompt
    const prompt = getRefactorFilePrompt(filePath);
    try {
      await navigator.clipboard.writeText(prompt);
      showNotification(
        `Prompt de refatoração para '${filePath}' copiado!`,
        "success"
      );
      copied = true;
    } catch (error) {
      showNotification("Erro ao copiar prompt de refatoração.", "error");
    }

    // 2. Analyze and Download
    try {
      const selection = getProjectSelection(); // Get current selection with exclusions
      const result = await analyzeProject(selection);

      // Download logic (extracted and adapted)
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .substring(0, 16);
      const projectName = result.projectName.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${projectName}_${timestamp}.txt`;
      const blob = new Blob([result.projectContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("Análise do projeto baixada!", "success");
      analyzed = true;
    } catch (error) {
      showNotification(
        `Erro ao analisar ou baixar o projeto: ${error.message}`,
        "error"
      );
    }

    // 3. Open Agent URL
    try {
      const agentUrl = localStorage.getItem("aiDevSuiteAgentUrl");
      if (agentUrl) {
        window.open(agentUrl, "_blank", "noopener,noreferrer");
        agentOpened = true;
      } else {
        console.warn("URL do agente não configurada.");
        // Optionally notify if URL isn't set
        // showNotification("URL do agente não configurada para abertura automática.", "info");
      }
    } catch (error) {
      console.error("Erro ao tentar abrir a URL do agente:", error);
      showNotification("Erro ao tentar abrir a URL do agente.", "error");
    }

    setActionLoading(false); // Stop loading indicator
  };
  // --- End New Refactor Action Handler ---

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <BarChartIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Métricas do Projeto
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Analise a complexidade dos seus projetos através de métricas de linhas
          de código, estimativa de tokens e distribuição de arquivos por
          diretório.
        </Typography>
      </Box>

      {!selectedProject ? (
        <Alert severity="info">
          Selecione um projeto no painel lateral para visualizar as métricas.
        </Alert>
      ) : loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Analisando projeto...</Typography>
        </Box>
      ) : metrics ? (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MetricCard
                title="Estimativa Total de Tokens"
                value={metrics.totalTokens}
                icon={<BarChartIcon color="primary" sx={{ fontSize: 40 }} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MetricCard
                title="Diretórios Analisados"
                value={metrics.directoryMetrics.length}
                color="secondary"
                icon={<DirectoryIcon color="secondary" sx={{ fontSize: 40 }} />}
              />
            </Grid>
          </Grid>

          {metrics.directoryMetrics && metrics.directoryMetrics.length > 0 && (
            <DirectoryMetricsTable
              directoryData={metrics.directoryMetrics}
              onIgnoreDirectory={handleIgnoreDirectory}
            />
          )}

          <Divider sx={{ my: 3 }}>
            <Chip label="Métricas por Arquivo" />
          </Divider>

          {metrics.projects.map((projectData) => (
            <ProjectMetricsTable
              key={projectData.projectId}
              projectData={projectData}
              onIgnoreFile={handleIgnoreFile}
              onRefactorAction={handleRefactorAction} // Pass the new handler
              actionLoading={actionLoading} // Pass loading state
            />
          ))}
        </Box>
      ) : (
        <Alert severity="warning">
          Não foi possível carregar as métricas para o projeto selecionado.
        </Alert>
      )}
    </Container>
  );
};

export default MetricsPage;
