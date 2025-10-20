import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Grid,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const EnhancedResultDisplay = ({ result, wasAutoDownloaded = false }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(wasAutoDownloaded);

  useEffect(() => {
    if (wasAutoDownloaded) {
      setDownloadSuccess(true);
      const timer = setTimeout(() => setDownloadSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [wasAutoDownloaded]);

  const handleDownload = () => {
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

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error("Erro no download:", error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.projectContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const getPreviewContent = () => {
    const lines = result.projectContent.split("\n");
    return lines.slice(0, 25).join("\n") + (lines.length > 25 ? "\n..." : "");
  };

  const formatFileSize = () => {
    const sizeInBytes = Math.round(result.base64.length * 0.75);
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${Math.round(sizeInBytes / 1024)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getLineCount = () => {
    return result.projectContent.split("\n").length.toLocaleString();
  };

  const getGeneratedTimestamp = () => {
    return new Date().toLocaleString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <FolderIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6">Resultado da Análise</Typography>
        {wasAutoDownloaded && (
          <Chip
            label="Download Automático"
            color="success"
            size="small"
            icon={<CheckCircleIcon />}
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {downloadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Arquivo baixado automaticamente com sucesso!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="primary">
                Informações do Projeto
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={result.projectName}
                  color="primary"
                  sx={{ mb: 1, fontWeight: 600 }}
                />
              </Box>

              <Box sx={{ display: "grid", gap: 1 }}>
                <Typography variant="body2">
                  <strong>Diretório:</strong>
                  <Typography
                    component="span"
                    sx={{ fontFamily: "monospace", ml: 1 }}
                  >
                    {result.directory}
                  </Typography>
                </Typography>

                <Typography variant="body2">
                  <strong>Tamanho:</strong> {formatFileSize()}
                </Typography>

                <Typography variant="body2">
                  <strong>Linhas:</strong> {getLineCount()}
                </Typography>

                <Typography variant="body2">
                  <strong>Gerado em:</strong> {getGeneratedTimestamp()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="primary">
                Ações Disponíveis
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={
                    downloadSuccess ? <CheckCircleIcon /> : <DownloadIcon />
                  }
                  onClick={handleDownload}
                  color={downloadSuccess ? "success" : "primary"}
                  fullWidth
                >
                  {downloadSuccess ? "Baixado!" : "Baixar Análise"}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={handleCopy}
                  color={copySuccess ? "success" : "primary"}
                  fullWidth
                >
                  {copySuccess ? "Copiado!" : "Copiar Conteúdo"}
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: "block" }}
              >
                Formato do arquivo: [NomeProjeto]_AAAA-MM-DD_HH-mm.txt
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" color="primary">
                  Prévia do Conteúdo
                </Typography>
                <IconButton
                  onClick={() => setShowFullContent(!showFullContent)}
                >
                  {showFullContent ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <TextField
                multiline
                fullWidth
                value={
                  showFullContent ? result.projectContent : getPreviewContent()
                }
                rows={showFullContent ? 35 : 12}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: "monospace", fontSize: "0.875rem" },
                }}
              />

              {!showFullContent && (
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Mostrando apenas as primeiras 25 linhas de {getLineCount()}{" "}
                    total
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setShowFullContent(true)}
                    endIcon={<ExpandMoreIcon />}
                  >
                    Ver tudo
                  </Button>
                </Box>
              )}

              {showFullContent && (
                <Button
                  size="small"
                  onClick={() => setShowFullContent(false)}
                  endIcon={<ExpandLessIcon />}
                  sx={{ mt: 1 }}
                >
                  Ocultar
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedResultDisplay;
