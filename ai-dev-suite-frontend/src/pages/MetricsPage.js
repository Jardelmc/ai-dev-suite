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
import { getProjectMetrics, createIgnore } from "../services/api";
import {
  BarChart as BarChartIcon,
  Block as IgnoreIcon,
  FolderSpecial as DirectoryIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import DirectoryMetricsTable from "../components/Metrics/DirectoryMetricsTable";
import { getRefactorFilePrompt } from "../utils/prompts/promptAgentCodeRefactor";

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
const ProjectMetricsTable = ({
  projectData,
  onIgnoreFile,
  onCopyRefactorPrompt,
}) => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("lines");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedFiles = React.useMemo(() => {
    return [...projectData.fileMetrics].sort((a, b) => {
      if (orderBy === "lines" || orderBy === "tokens") {
        return order === "asc"
          ? a[orderBy] - b[orderBy]
          : b[orderBy] - a[orderBy];
      }
      if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [order, orderBy, projectData.fileMetrics]);
  return (
    <Paper variant="outlined" sx={{ mt: 3 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "grey.100",
        }}
      >
        <Typography variant="h6">{projectData.projectTitle}</Typography>
        <Chip label={`${projectData.totalTokens} Tokens`} color="primary" />
      </Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "path" ? order : false}>
                <TableSortLabel
                  active={orderBy === "path"}
                  direction={orderBy === "path" ? order : "asc"}
                  onClick={() => handleRequestSort("path")}
                >
                  Arquivo
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "lines" ? order : false}>
                <TableSortLabel
                  active={orderBy === "lines"}
                  direction={orderBy === "lines" ? order : "asc"}
                  onClick={() => handleRequestSort("lines")}
                >
                  Linhas
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "tokens" ? order : false}>
                <TableSortLabel
                  active={orderBy === "tokens"}
                  direction={orderBy === "tokens" ? order : "asc"}
                  onClick={() => handleRequestSort("tokens")}
                >
                  Tokens (estimado)
                </TableSortLabel>
              </TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFiles.map((file) => (
              <TableRow key={file.path}>
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {file.path}
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.lines}
                    size="small"
                    sx={{
                      backgroundColor: getLineColor(file.lines),
                      color: "white",
                    }}
                  />
                </TableCell>
                <TableCell>{file.tokens}</TableCell>
                <TableCell>
                  <Tooltip title="Adicionar à lista de ignorados">
                    <IconButton
                      size="small"
                      onClick={() =>
                        onIgnoreFile(file.path, projectData.projectId)
                      }
                    >
                      <IgnoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copiar prompt de refatoração">
                    <IconButton
                      size="small"
                      onClick={() => onCopyRefactorPrompt(file.path)}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const MetricsPage = ({ showNotification }) => {
  const { selectedProject } = useProjectContext();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchMetrics = useCallback(async () => {
    if (!selectedProject) {
      setMetrics(null);
      return;
    }
    setLoading(true);
    try {
      const result = await getProjectMetrics({ projectId: selectedProject.id });
      setMetrics(result);
    } catch (error) {
      showNotification(error.message || "Erro ao buscar métricas", "error");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, showNotification]);
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

  const handleCopyRefactorPrompt = async (filePath) => {
    const prompt = getRefactorFilePrompt(filePath);
    try {
      await navigator.clipboard.writeText(prompt);
      showNotification(
        `Prompt de refatoração para '${filePath}' copiado!`,
        "success"
      );
    } catch (error) {
      showNotification("Erro ao copiar prompt.", "error");
    }
  };

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
              onCopyRefactorPrompt={handleCopyRefactorPrompt}
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
