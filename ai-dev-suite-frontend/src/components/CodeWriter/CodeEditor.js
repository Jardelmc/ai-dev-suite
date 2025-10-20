import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Create as CreateIcon } from '@mui/icons-material';
import ProjectSelector from '../common/ProjectSelector';
import { generateFiles } from '../../services/api';

const CodeEditor = ({ onGenerationComplete, onError }) => {
  const [formData, setFormData] = useState({ generatedCode: '' });
  const [loading, setLoading] = useState(false);

  const handleProjectChange = (selection) => {
    setFormData(prev => ({ ...prev, ...selection }));
  };

  const handleCodeChange = (event) => {
    setFormData(prev => ({ ...prev, generatedCode: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.projectId && !formData.projectDir) {
      onError(new Error('Selecione um projeto ou informe um diretório'));
      return;
    }

    if (!formData.generatedCode.trim()) {
      onError(new Error('Informe o código a ser gerado'));
      return;
    }

    if (!formData.generatedCode.includes('[FILEPATH:')) {
      onError(new Error('O código deve conter ao menos um bloco [FILEPATH:...][/FILEPATH]'));
      return;
    }

    setLoading(true);
    try {
      const result = await generateFiles(formData);
      onGenerationComplete(result);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Configuração da Geração
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ProjectSelector
          value={formData}
          onChange={handleProjectChange}
          allowDirectPath={true}
          required={true}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Código Gerado
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={20}
          value={formData.generatedCode}
          onChange={handleCodeChange}
          placeholder="Cole aqui o código gerado com a notação [FILEPATH:caminho/arquivo.js]...código...[/FILEPATH]"
          variant="outlined"
          required
          InputProps={{
            sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
          }}
        />
        <Alert severity="info" sx={{ mt: 1 }}>
          Use a notação <code>[FILEPATH:caminho/arquivo.js]código do arquivo[/FILEPATH]</code> para cada arquivo que deseja gerar.
        </Alert>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CreateIcon />}
          disabled={loading}
          sx={{ minWidth: 160 }}
        >
          {loading ? 'Gerando...' : 'Gerar Arquivos'}
        </Button>
      </Box>
    </Box>
  );
};

export default CodeEditor;