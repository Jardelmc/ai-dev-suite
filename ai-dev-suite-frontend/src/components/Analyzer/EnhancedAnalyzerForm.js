import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  TextField,
  Divider,
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Bolt as GoDevIcon,
} from "@mui/icons-material";
import { analyzeProject } from "../../services/api";

const EnhancedAnalyzerForm = ({
  onAnalysisComplete,
  onError,
  loading,
  setLoading,
  preselectedProject = null,
}) => {
  const navigate = useNavigate();
  const [autoDownload, setAutoDownload] = useState(true);
  const [useCustomDirectory, setUseCustomDirectory] = useState(false);
  const [customDirectory, setCustomDirectory] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    let dataToSubmit;
    if (useCustomDirectory) {
      if (!customDirectory.trim()) {
        onError(new Error("Informe o diretório personalizado"));
        return;
      }
      dataToSubmit = { projectDir: customDirectory.trim() };
    } else {
      if (
        !preselectedProject ||
        (!preselectedProject.projectId && !preselectedProject.projectDir)
      ) {
        onError(new Error("Selecione um projeto ou informe um diretório"));
        return;
      }
      dataToSubmit = preselectedProject;
    }

    setLoading(true);
    try {
      const result = await analyzeProject(dataToSubmit);

      if (autoDownload) {
        handleAutoDownload(result);
      }

      onAnalysisComplete(result, autoDownload);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDownload = (result) => {
    try {
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
    } catch (error) {
      console.error("Erro no download automático:", error);
    }
  };

  const hasProjectSelected =
    preselectedProject &&
    (preselectedProject.projectId || preselectedProject.projectDir);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Análise de Projeto
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        {hasProjectSelected
          ? "Projeto selecionado. Use o botão flutuante para alterar ou escolha um diretório personalizado."
          : "Selecione um projeto usando o botão flutuante ou informe um diretório manualmente."}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={useCustomDirectory}
              onChange={(e) => setUseCustomDirectory(e.target.checked)}
            />
          }
          label="Usar diretório personalizado (sobrescreve seleção)"
        />

        {useCustomDirectory && (
          <TextField
            fullWidth
            label="Diretório Personalizado"
            value={customDirectory}
            onChange={(e) => setCustomDirectory(e.target.value)}
            placeholder="/caminho/completo/para/o/projeto"
            margin="dense"
            required
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoDownload}
              onChange={(e) => setAutoDownload(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                Download automático após análise
              </Typography>
              <Typography variant="caption" color="text.secondary">
                O arquivo será baixado automaticamente com data/hora no nome
              </Typography>
            </Box>
          }
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AnalyticsIcon />
                )
              }
              disabled={
                loading ||
                (!useCustomDirectory && !hasProjectSelected) ||
                (useCustomDirectory && !customDirectory.trim())
              }
              sx={{ minWidth: 180 }}
            >
              {loading ? "Analisando..." : "Analisar Projeto"}
            </Button>

            {autoDownload && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                disabled
                sx={{ minWidth: 160 }}
              >
                Download Automático
              </Button>
            )}
        </Box>
        
        <Button
            variant="outlined"
            size="large"
            color="secondary"
            startIcon={<GoDevIcon />}
            onClick={() => navigate('/go-dev')}
            sx={{ minWidth: 140 }}
        >
            Go Dev
        </Button>
      </Box>
    </Box>
  );
};

export default EnhancedAnalyzerForm;