import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Analytics as AnalyticsIcon } from '@mui/icons-material';
import ProjectSelector from '../common/ProjectSelector';
import { analyzeProject } from '../../services/api';

const AnalyzerForm = ({ onAnalysisComplete, onError, loading, setLoading }) => {
  const [formData, setFormData] = useState({});

  const handleProjectChange = (selection) => {
    setFormData(selection);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.projectId && !formData.projectDir) {
      onError(new Error('Selecione um projeto ou informe um diretório'));
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeProject(formData);
      onAnalysisComplete(result);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Configuração da Análise
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ProjectSelector
          value={formData}
          onChange={handleProjectChange}
          allowDirectPath={true}
          required={true}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
          disabled={loading || (!formData.projectId && !formData.projectDir)}
          sx={{ minWidth: 160 }}
        >
          {loading ? 'Analisando...' : 'Analisar Projeto'}
        </Button>
      </Box>
    </Box>
  );
};

export default AnalyzerForm;