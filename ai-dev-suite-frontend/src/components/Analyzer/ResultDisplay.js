import React, { useState } from 'react';
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
  Collapse,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

const ResultDisplay = ({ result }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([result.projectContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.projectContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const getPreviewContent = () => {
    const lines = result.projectContent.split('\n');
    return lines.slice(0, 20).join('\n') + (lines.length > 20 ? '\n...' : '');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Resultado da Análise
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Informações do Projeto
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label={result.projectName} color="primary" sx={{ mb: 1 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Diretório:</strong> {result.directory}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Tamanho:</strong> {Math.round(result.base64.length * 0.75 / 1024)} KB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Ações
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={handleCopy}
                  color={copySuccess ? 'success' : 'primary'}
                >
                  {copySuccess ? 'Copiado!' : 'Copiar'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">
                  Conteúdo do Projeto
                </Typography>
                <IconButton onClick={() => setShowFullContent(!showFullContent)}>
                  {showFullContent ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <TextField
                multiline
                fullWidth
                value={showFullContent ? result.projectContent : getPreviewContent()}
                rows={showFullContent ? 30 : 10}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                }}
              />
              
              {!showFullContent && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Mostrando apenas as primeiras 20 linhas. Clique no botão acima para ver o conteúdo completo.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultDisplay;