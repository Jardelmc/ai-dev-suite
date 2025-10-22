import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment, // Removed CircularProgress as copying state is handled differently
  Divider,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  OpenInNew as OpenInNewIcon,
  Save as SaveIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const PromptDisplay = ({ prompt, showNotification, performAutoAction }) => {
  const [copying, setCopying] = useState(false);
  const [agentUrl, setAgentUrl] = useState('');

  // Load saved URL on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('aiDevSuiteAgentUrl');
    if (savedUrl) {
      setAgentUrl(savedUrl);
    }
  }, []);

  const handleCopy = useCallback(async (isAuto = false) => {
    if (!prompt) return;
    if (!isAuto) setCopying(true); // Only show visual feedback for manual copy
    try {
      await navigator.clipboard.writeText(prompt);
      showNotification(isAuto ? 'Prompt copiado automaticamente!' : 'Prompt copiado para a área de transferência!', 'success');
    } catch (error) {
      showNotification(isAuto ? 'Falha ao copiar o prompt automaticamente.' : 'Falha ao copiar o prompt.', 'error');
    } finally {
      if (!isAuto) {
        // Reset visual feedback after a delay for manual copy
        const timer = setTimeout(() => setCopying(false), 2000);
        return () => clearTimeout(timer); // Cleanup timer on unmount or re-run
      }
    }
  }, [prompt, showNotification]);

  const handleOpenAgent = useCallback(() => {
    const savedUrl = localStorage.getItem('aiDevSuiteAgentUrl');
    if (savedUrl) {
      window.open(savedUrl, '_blank', 'noopener,noreferrer');
    } else {
        // Optionally notify user if URL isn't set when auto-opening
        console.warn("Attempted to auto-open agent, but no URL is saved.");
        showNotification("URL do agente não configurada para abertura automática.", "warning");
    }
  }, [showNotification]); // Added showNotification dependency

   // Effect for automatic actions
   useEffect(() => {
    // Only perform actions if performAutoAction is true AND the prompt has content
    if (performAutoAction && prompt) {
      handleCopy(true); // isAuto = true
      handleOpenAgent();
    }
    // Dependency array: run when prompt or performAutoAction changes
  }, [prompt, performAutoAction, handleCopy, handleOpenAgent]);

  const handleSaveUrl = () => {
    if (agentUrl.trim()) {
      localStorage.setItem('aiDevSuiteAgentUrl', agentUrl.trim());
      showNotification('URL do Agente salva com sucesso!', 'success');
    } else {
      localStorage.removeItem('aiDevSuiteAgentUrl');
      showNotification('URL do Agente removida.', 'info');
    }
  };

  // Renamed to avoid conflict with auto-open logic
  const manualOpenAgentClick = () => {
    const savedUrl = localStorage.getItem('aiDevSuiteAgentUrl');
    if(savedUrl) {
        window.open(savedUrl, '_blank', 'noopener,noreferrer');
    } else {
        showNotification('Nenhuma URL de agente configurada para abrir.', 'warning');
    }
  };


  const getPromptStats = () => {
    if (!prompt) return { words: 0, chars: 0 };
    const words = prompt.trim().split(/\s+/).filter(w => w.length > 0).length; // More robust word count
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
            onClick={() => handleCopy(false)} // isAuto = false for manual click
            disabled={!prompt || copying} // Keep disabled logic for manual copy
            startIcon={copying ? <CheckCircleIcon /> : <CopyIcon />} // Visual feedback only for manual
          >
            {copying ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button
            variant="contained"
            onClick={manualOpenAgentClick} // Use renamed handler for manual click
            startIcon={<OpenInNewIcon />}
            disabled={!agentUrl} // Still disable if no URL is set
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
        rows={12} // Adjusted rows for potentially better layout fit
        InputProps={{
          readOnly: true,
          sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
        }}
        // Ensure flexGrow works correctly with surrounding elements
        sx={{ flexGrow: 1, mb: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }}
      />

      {/* Stats Section */}
      <Box sx={{ textAlign: 'right', mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
            {stats.words} palavras | {stats.chars} caracteres
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Agent URL Config */}
      <Typography variant="subtitle1" gutterBottom>
        Configurar URL do Agente (para botão "Abrir Agente")
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="URL do Agente"
          value={agentUrl}
          onChange={(e) => setAgentUrl(e.target.value)}
          placeholder="https://gemini.google.com/app ou outra URL"
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