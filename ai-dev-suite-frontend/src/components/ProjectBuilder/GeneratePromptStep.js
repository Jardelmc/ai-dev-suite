import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ContentCopy as CopyIcon, AutoFixHigh as GenerateIcon } from '@mui/icons-material';
import { generateSolutionPrompt } from '../../services/api';

const GeneratePromptStep = ({ buildResult, showNotification }) => {
  const [functionalities, setFunctionalities] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!functionalities.trim()) {
      showNotification('Por favor, descreva as funcionalidades desejadas.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const result = await generateSolutionPrompt({
        projectId: buildResult.rootProject.id,
        functionalities,
      });
      setGeneratedPrompt(result.prompt);
      showNotification('Prompt gerado com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao gerar prompt: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      showNotification('Prompt copiado para a área de transferência!', 'success');
    } catch (error) {
      showNotification('Erro ao copiar o prompt.', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gerar Prompt para Solução Técnica
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        O projeto foi criado com sucesso. Agora, descreva as funcionalidades que você deseja implementar para gerar um prompt detalhado para uma IA.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        Projeto Raiz: <strong>{buildResult.rootProject.title}</strong>
      </Alert>

      <TextField
        fullWidth
        multiline
        rows={8}
        label="Descreva as Funcionalidades Desejadas"
        value={functionalities}
        onChange={(e) => setFunctionalities(e.target.value)}
        placeholder="Ex: 1. CRUD de Usuários com autenticação. 2. Sistema de upload de imagens para produtos. 3. Integração com API de pagamento..."
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={loading || !functionalities.trim()}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GenerateIcon />}
      >
        {loading ? 'Gerando...' : 'Gerar Prompt'}
      </Button>

      {generatedPrompt && (
        <Paper sx={{ mt: 3 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Prompt Gerado</Typography>
            <Button
              startIcon={<CopyIcon />}
              onClick={handleCopy}
            >
              Copiar
            </Button>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={generatedPrompt}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default GeneratePromptStep;