import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { ContentCopy as CopyIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const PromptDisplay = ({ prompt, showNotification }) => {
  const [copying, setCopying] = useState(false);

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
        <Button
            variant="contained"
            onClick={handleCopy}
            disabled={!prompt || copying}
            startIcon={copying ? <CheckCircleIcon /> : <CopyIcon />}
        >
            {copying ? 'Copiado!' : 'Copiar'}
        </Button>
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
    </Box>
  );
};

export default PromptDisplay;