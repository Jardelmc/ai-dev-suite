import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { 
  Commit as CommitIcon, 
  Undo as UndoIcon 
} from '@mui/icons-material';
import ProjectSelector from '../common/ProjectSelector';
import { commitChanges, revertChanges } from '../../services/api';

const GitControls = ({ onGitAction, onError }) => {
  const [formData, setFormData] = useState({ commitMessage: '' });
  const [loading, setLoading] = useState({ commit: false, revert: false });

  const handleProjectChange = (selection) => {
    setFormData(prev => ({ ...prev, ...selection }));
  };

  const handleCommitMessageChange = (event) => {
    setFormData(prev => ({ ...prev, commitMessage: event.target.value }));
  };

  const handleCommit = async () => {
    if (!formData.projectId && !formData.projectDir) {
      onError(new Error('Selecione um projeto ou informe um diretório'));
      return;
    }

    setLoading(prev => ({ ...prev, commit: true }));
    try {
      const result = await commitChanges({
        projectId: formData.projectId,
        projectDir: formData.projectDir,
        commitMessage: formData.commitMessage || 'Commit via AI Dev Suite'
      });
      onGitAction(result, 'commit');
    } catch (error) {
      onError(error);
    } finally {
      setLoading(prev => ({ ...prev, commit: false }));
    }
  };

  const handleRevert = async () => {
    if (!formData.projectId && !formData.projectDir) {
      onError(new Error('Selecione um projeto ou informe um diretório'));
      return;
    }

    if (!window.confirm('Tem certeza que deseja reverter todas as alterações? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(prev => ({ ...prev, revert: true }));
    try {
      const result = await revertChanges({
        projectId: formData.projectId,
        projectDir: formData.projectDir
      });
      onGitAction(result, 'revert');
    } catch (error) {
      onError(error);
    } finally {
      setLoading(prev => ({ ...prev, revert: false }));
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Controles Git
      </Typography>

      <Box sx={{ mb: 4 }}>
        <ProjectSelector
          value={formData}
          onChange={handleProjectChange}
          allowDirectPath={true}
          required={true}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Fazer Commit
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Salve as alterações atuais no repositório Git.
            </Typography>

            <TextField
              fullWidth
              label="Mensagem do Commit"
              value={formData.commitMessage}
              onChange={handleCommitMessageChange}
              placeholder="Descreva as alterações realizadas..."
              multiline
              rows={3}
              sx={{ mb: 2 }}
              helperText="Se vazio, será usada uma mensagem padrão"
            />

            <Button
              variant="contained"
              size="large"
              startIcon={loading.commit ? <CircularProgress size={20} color="inherit" /> : <CommitIcon />}
              onClick={handleCommit}
              disabled={loading.commit || loading.revert || (!formData.projectId && !formData.projectDir)}
              fullWidth
            >
              {loading.commit ? 'Fazendo Commit...' : 'Fazer Commit'}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h6" gutterBottom color="error">
              Reverter Alterações
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Reverte todas as alterações não commitadas para o último commit.
            </Typography>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Atenção:</strong> Esta ação irá desfazer todas as alterações não salvas no Git. 
              Esta operação não pode ser desfeita.
            </Alert>

            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={loading.revert ? <CircularProgress size={20} color="inherit" /> : <UndoIcon />}
              onClick={handleRevert}
              disabled={loading.commit || loading.revert || (!formData.projectId && !formData.projectDir)}
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

export default GitControls;