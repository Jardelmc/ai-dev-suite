import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Alert,
} from "@mui/material";
import { useProjectContext } from "../contexts/ProjectContext";
import EnhancedAnalyzerForm from "../components/Analyzer/EnhancedAnalyzerForm";
import EnhancedResultDisplay from "../components/Analyzer/EnhancedResultDisplay";

const AnalyzerPage = ({ showNotification }) => {
  const { selectedProject, getProjectSelection } = useProjectContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wasAutoDownloaded, setWasAutoDownloaded] = useState(false);

  const handleAnalysisComplete = (analysisResult, autoDownload = false) => {
    setResult(analysisResult);
    setWasAutoDownloaded(autoDownload);

    if (autoDownload) {
      showNotification(
        "Análise concluída e arquivo baixado automaticamente!",
        "success"
      );
    } else {
      showNotification("Análise concluída com sucesso!", "success");
    }
  };

  const handleError = (error) => {
    showNotification(error.message || "Erro na análise", "error");
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Analise a estrutura e conteúdo completo de projetos de
          desenvolvimento. Configure o download automático para maior agilidade.
        </Typography>
      </Box>

      {!selectedProject && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Nenhum projeto selecionado.</strong> Selecione um projeto no
            seletor global acima ou use o formulário abaixo para informar um
            diretório específico.
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <EnhancedAnalyzerForm
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          loading={loading}
          setLoading={setLoading}
          preselectedProject={selectedProject ? getProjectSelection() : null}
        />
      </Paper>

      {result && (
        <>
          <Divider sx={{ my: 3 }} />
          <Paper sx={{ p: 3 }}>
            <EnhancedResultDisplay
              result={result}
              wasAutoDownloaded={wasAutoDownloaded}
            />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default AnalyzerPage;
