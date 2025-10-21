import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert
} from '@mui/material';
import { CloudDownload as ImportIcon, ChevronRight, ChevronLeft } from '@mui/icons-material';
import { cloneRepository } from '../../services/api';

const steps = ['Configurar Repositório', 'Selecionar Projeto Raiz', 'Confirmar e Importar'];

const GitImportModal = ({ projects, onClose, onSuccess, showNotification }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [rootProjectType, setRootProjectType] = useState('existing');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [newRootProjectName, setNewRootProjectName] = useState('');
  const [newRootProjectDirectory, setNewRootProjectDirectory] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleImport = async () => {
    setLoading(true);
    try {
      let payload;
      const projectName = repositoryUrl.split('/').pop().replace('.git', '');

      if (rootProjectType === 'existing') {
        const parentProject = projects.find(p => p.id === selectedParentId);
        payload = {
            parentId: selectedParentId,
            repositoryUrl,
            projectName: projectName,
            directory: parentProject.directory,
        };
      } else {
        payload = {
            parentId: null,
            repositoryUrl,
            projectName: newRootProjectName,
            directory: newRootProjectDirectory,
        };
      }

      const result = await cloneRepository(payload);
      setBranches(result.branches);
      handleNext();
    } catch (error) {
      showNotification(`Erro ao clonar repositório: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetReferenceBranch = async () => {
    onSuccess('Sub-projeto importado com sucesso!');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="URL do Repositório Git"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/usuario/repositorio.git"
              helperText="Use HTTPS ou SSH"
              margin="normal"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <RadioGroup row value={rootProjectType} onChange={(e) => setRootProjectType(e.target.value)}>
              <FormControlLabel value="existing" control={<Radio />} label="Usar Projeto Raiz Existente" />
              <FormControlLabel value="new" control={<Radio />} label="Criar Novo Projeto Raiz" />
            </RadioGroup>

            {rootProjectType === 'existing' ? (
              <FormControl fullWidth margin="normal">
                <InputLabel>Selecione o Projeto Raiz</InputLabel>
                <Select value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)}>
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Nome do Novo Projeto Raiz"
                  value={newRootProjectName}
                  onChange={(e) => setNewRootProjectName(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Diretório do Novo Projeto Raiz"
                  value={newRootProjectDirectory}
                  onChange={(e) => setNewRootProjectDirectory(e.target.value)}
                  margin="normal"
                  helperText="O repositório será clonado dentro desta pasta."
                />
              </>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography>Repositório clonado com sucesso!</Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Selecione a Branch de Referência</InputLabel>
              <Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                {branches.map((branch) => (
                  <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      default:
        return 'Passo desconhecido';
    }
  };

  const isNextDisabled = () => {
    if (activeStep === 0 && !repositoryUrl.trim()) return true;
    if (activeStep === 1) {
      if (rootProjectType === 'existing' && !selectedParentId) return true;
      if (rootProjectType === 'new' && (!newRootProjectName.trim() || !newRootProjectDirectory.trim())) return true;
    }
    return false;
  };

  return (
    <Box>
      <Typography variant="h6" id="import-git-subproject-title" gutterBottom>
        Importar Sub-Projeto de Repositório Git
      </Typography>
      <Stepper activeStep={activeStep} sx={{ my: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {getStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Voltar
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={activeStep === 1 ? handleImport : handleNext}
            disabled={isNextDisabled() || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Clonando...' : 'Próximo'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSetReferenceBranch}
            disabled={!selectedBranch}
          >
            Finalizar Importação
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default GitImportModal;