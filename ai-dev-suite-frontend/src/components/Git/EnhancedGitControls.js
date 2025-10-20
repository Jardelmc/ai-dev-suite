import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { 
  Commit as CommitIcon, 
  Undo as UndoIcon 
} from '@mui/icons-material';
import { commitChanges, revertChanges } from '../../services/api';

const EnhancedGitControls = ({ 
  onGitAction, 
  onError, 
  preselectedProject = null 
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState({ commit: false, revert: false });
  const [useCustomDirectory, setUseCustomDirectory] = useState(false);
  const [customDirectory, setCustomDirectory] = useState('');
  const handleCommitMessageChange = (event) => {
    setCommitMessage(event.target.value);
  };
  const handleCommit = async () => {
    let dataToSubmit;
    if (useCustomDirectory) {
      if (!customDirectory.trim()) {
        onError(new Error('Informe o diretório personalizado'));
        return;
      }
      dataToSubmit = {
        projectDir: customDirectory.trim(),
        commitMessage: commitMessage || 'Commit via AI Dev Suite'
      };
    } else {
      if (!preselectedProject || (!preselectedProject.projectId && !preselectedProject.projectDir)) {
        onError(new Error('Selecione um projeto ou informe um diretório'));
        return;
      }
      dataToSubmit = {
        ...preselectedProject,
        commitMessage: commitMessage || 'Commit via AI Dev Suite'
      };
    }

    setLoading(prev => ({ ...prev, commit: true }));
    try {
      const result = await commitChanges(dataToSubmit);
      onGitAction(result, 'commit');
    } catch (error) {
      onError(error);
    } finally {
      setLoading(prev => ({ ...prev, commit: false }));
    }
  };
  const handleRevert = async () => {
    if (!window.confirm('Tem certeza que deseja reverter todas as alterações? Esta ação não pode ser desfeita.')) {
      return;
    }

    let dataToSubmit;
    
    if (useCustomDirectory) {
      if (!customDirectory.trim()) {
        onError(new Error('Informe o diretório personalizado'));
        return;
      }
      dataToSubmit = { projectDir: customDirectory.trim() };
    } else {
      if (!preselectedProject || (!preselectedProject.projectId && !preselectedProject.projectDir)) {
        onError(new Error('Selecione um projeto ou informe um diretório'));
        return;
      }
      dataToSubmit = preselectedProject;
    }

    setLoading(prev => ({ ...prev, revert: true }));
    try {
      const result = await revertChanges(dataToSubmit);
      onGitAction(result, 'revert');
    } catch (error) {
      onError(error);
    } finally {
      setLoading(prev => ({ ...prev, revert: false }));
    }
  };
  const hasProjectSelected = preselectedProject && (preselectedProject.projectId || preselectedProject.projectDir);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Controle de Versão Git
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        {hasProjectSelected 
          ? 'Projeto selecionado. Faça commit das alterações ou reverta para o último estado salvo.'
          : 'Selecione um projeto usando o botão flutuante ou informe um diretório manualmente.'
        }
      </Typography>

      {hasProjectSelected && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Projeto Ativo:</strong> Selecionado via sidebar
          </Typography>
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={useCustomDirectory}
              onChange={(e) => setUseCustomDirectory(e.target.checked)}
            />
          }
          label="Usar diretório personalizado (sobrescreve seleção)"
        />

        {useCustomDirectory && (
          <TextField
            fullWidth
            label="Diretório Personalizado"
            value={customDirectory}
            onChange={(e) => setCustomDirectory(e.target.value)}
            placeholder="/caminho/completo/para/o/projeto"
            margin="dense"
            required
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Fazer Commit
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Salve as alterações atuais no histórico do repositório Git.
            </Typography>

            <TextField
              fullWidth
              label="Mensagem do Commit"
              value={commitMessage}
              onChange={handleCommitMessageChange}
              placeholder="feat: implementa nova funcionalidade..."
              multiline
              rows={4}
              sx={{ mb: 2 }}
              helperText="Descreva brevemente as alterações realizadas (opcional)"
            />

            <Button
              variant="contained"
              size="large"
              startIcon={loading.commit ? <CircularProgress size={20} color="inherit" /> : <CommitIcon />}
              onClick={handleCommit}
              disabled={
                loading.commit ||
                loading.revert || 
                (!useCustomDirectory && !hasProjectSelected) ||
                (useCustomDirectory && !customDirectory.trim())
              }
              fullWidth
            >
              {loading.commit ? 'Fazendo Commit...' : 'Fazer Commit'}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ p: 3, border: '1px solid #ffcdd2', borderRadius: 2, backgroundColor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom color="error">
              Reverter Alterações
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Desfaz todas as alterações não commitadas, retornando ao último commit.
            </Typography>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Atenção:</strong> Esta operação irá desfazer permanentemente todas as 
                alterações não salvas no Git. Use com cuidado!
              </Typography>
            </Alert>

            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={loading.revert ? <CircularProgress size={20} color="inherit" /> : <UndoIcon />}
              onClick={handleRevert}
              disabled={
                loading.commit ||
                loading.revert || 
                (!useCustomDirectory && !hasProjectSelected) ||
                (useCustomDirectory && !customDirectory.trim())
              }
              fullWidth
            >
              {loading.revert ? 'Revertendo...' : 'Reverter Alterações'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedGitControls;