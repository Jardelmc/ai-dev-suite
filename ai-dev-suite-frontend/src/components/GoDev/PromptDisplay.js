import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Divider,
} from '@mui/material';
import { 
  ContentCopy as CopyIcon, 
  CheckCircle as CheckCircleIcon,
  OpenInNew as OpenInNewIcon,
  Save as SaveIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const PromptDisplay = ({ prompt, showNotification }) => {
  const [copying, setCopying] = useState(false);
  const [agentUrl, setAgentUrl] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('aiDevSuiteAgentUrl');
    if (savedUrl) {
      setAgentUrl(savedUrl);
    }
  }, []);

  const handleCopy = async () => {
    if (!prompt) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(prompt);
      showNotification('Prompt copiado para a área de transferência!', 'success');
    } catch (error) {
      showNotification('Falha ao copiar o prompt.', 'error');
    } finally {
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const handleSaveUrl = () => {
    if (agentUrl.trim()) {
      localStorage.setItem('aiDevSuiteAgentUrl', agentUrl.trim());
      showNotification('URL do Agente salva com sucesso!', 'success');
    } else {
      localStorage.removeItem('aiDevSuiteAgentUrl');
      showNotification('URL do Agente removida.', 'info');
    }
  };

  const handleOpenAgent = () => {
    if (agentUrl) {
      window.open(agentUrl, '_blank', 'noopener,noreferrer');
    } else {
      showNotification('Nenhuma URL de agente configurada para abrir.', 'warning');
    }
  };

  const getPromptStats = () => {
    if (!prompt) return { words: 0, chars: 0 };
    const words = prompt.trim().split(/\s+/).length;
    const chars = prompt.length;
    return { words, chars };
  };
  
  const stats = getPromptStats();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          2. Prompt Gerado
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleCopy}
            disabled={!prompt || copying}
            startIcon={copying ? <CheckCircleIcon /> : <CopyIcon />}
          >
            {copying ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenAgent}
            startIcon={<OpenInNewIcon />}
            disabled={!agentUrl}
            color="secondary"
          >
            Abrir Agente
          </Button>
        </Box>
      </Box>

      <TextField
        multiline
        fullWidth
        value={prompt}
        variant="outlined"
        rows={12}
        InputProps={{
          readOnly: true,
          sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
        }}
        sx={{ flexGrow: 1, '& .MuiInputBase-root': { height: '100%' } }}
      />
      
      <Box sx={{ mt: 1, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
            {stats.words} palavras | {stats.chars} caracteres
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Configurar URL do Agente
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="URL do Agente"
          value={agentUrl}
          onChange={(e) => setAgentUrl(e.target.value)}
          placeholder="https://gemini.google.com/app"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={handleSaveUrl}
          startIcon={<SaveIcon />}
        >
          Salvar
        </Button>
      </Box>
    </Box>
  );
};

export default PromptDisplay;