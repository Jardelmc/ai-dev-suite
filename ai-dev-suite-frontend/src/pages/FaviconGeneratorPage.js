import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, Alert, TextField, Button, CircularProgress, Grid
} from '@mui/material';
import { Image as ImageIcon, AutoFixHigh as GenerateIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';
import { useProjectContext } from '../contexts/ProjectContext';
import { generateFavicons } from '../services/api';
import EnhancedProjectSelector from '../components/common/EnhancedProjectSelector';

const FaviconGeneratorPage = ({ showNotification }) => {
  const { selectedProject: globalSelectedProject } = useProjectContext();
  const [selectedProject, setSelectedProject] = useState(null);
  const [appName, setAppName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleProjectChange = (selection) => {
    setSelectedProject(selection);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview('');
      showNotification('Por favor, selecione um arquivo de imagem válido.', 'warning');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProject || !selectedProject.projectId) {
      showNotification('Selecione um projeto primeiro.', 'warning');
      return;
    }
    if (!appName.trim()) {
      showNotification('O nome da aplicação é obrigatório.', 'warning');
      return;
    }
    if (!imageFile) {
      showNotification('Selecione uma imagem para gerar os favicons.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(',')[1];
        const response = await generateFavicons({
          projectId: selectedProject.projectId,
          appName: appName.trim(),
          imageBase64: base64String,
        });
        setResult(response);
        showNotification(response.message, 'success');
      } catch (error) {
        showNotification(error.message || 'Erro ao gerar favicons.', 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      showNotification('Erro ao ler o arquivo de imagem.', 'error');
      setLoading(false);
    };
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Favicon Generator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gere e configure automaticamente todos os favicons e o `manifest.json` para seus projetos ReactJS (Vite ou react-scripts).
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <EnhancedProjectSelector
              value={selectedProject}
              onChange={handleProjectChange}
              allowDirectPath={false}
              label="1. Selecione o Projeto Frontend"
              required
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>2. Configuração</Typography>
            <TextField
              fullWidth
              label="Nome da Aplicação"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              helperText="Será usado no manifest.json e na tag <title> do HTML."
              sx={{ mb: 3 }}
              required
              disabled={!selectedProject}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              fullWidth
              disabled={!selectedProject}
            >
              Selecionar Imagem (512x512 pixels ou maior)
              <input type="file" hidden accept="image/png, image/jpeg, image/svg+xml" onChange={handleImageChange} />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 2, p: 1, border: '1px dashed grey', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="caption">Pré-visualização:</Typography>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '8px' }} />
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <GenerateIcon />}
            onClick={handleSubmit}
            disabled={loading || !selectedProject || !appName || !imageFile}
            sx={{ minHeight: '56px', width: '50%' }}
          >
            {loading ? 'Gerando e Atualizando...' : 'Gerar Favicons e Atualizar index.html'}
          </Button>
        </Box>
        
        {result && (
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
             <Alert icon={<SuccessIcon fontSize="inherit" />} severity="success">
              <Typography variant="h6">Processo Concluído!</Typography>
              <Typography variant="body2">{result.message}</Typography>
              <Typography variant="body2" sx={{mt: 1}}>Recarregue a página da sua aplicação para ver as mudanças.</Typography>
            </Alert>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default FaviconGeneratorPage;