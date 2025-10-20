import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { getIgnoresForProject, getIgnores, createIgnore, deleteIgnore } from '../../services/api';

const IgnoreManager = ({ project, onAction, onClose }) => {
  const [ignores, setIgnores] = useState({ global: [], project: [], subProject: [], all: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newIgnore, setNewIgnore] = useState('');

  const isGlobalMode = !project;
  const scope = isGlobalMode ? 'global' : 'project';
  const title = isGlobalMode 
    ? 'Itens Ignorados Globalmente' 
    : `Itens Ignorados para ${project.title}`;

  const loadIgnores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (isGlobalMode) {
        const allIgnores = await getIgnores();
        const globalIgnores = allIgnores.filter(i => i.scope === 'global');
        setIgnores({ 
          global: globalIgnores, 
          project: [], 
          subProject: [], 
          all: globalIgnores 
        });
      } else {
        const ignoreList = await getIgnoresForProject(project.id);
        setIgnores(ignoreList);
      }
    } catch (e) {
      setError(`Erro ao carregar lista de ignorados: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [project, isGlobalMode]);

  useEffect(() => {
    loadIgnores();
  }, [loadIgnores]);

  const handleAddIgnore = async () => {
    if (!newIgnore.trim()) return;

    setLoading(true);
    try {
      await createIgnore({
        path: newIgnore.trim(),
        scope,
        projectId: project ? project.id : null
      });
      setNewIgnore('');
      loadIgnores();
      onAction('Item adicionado à lista de ignorados!', 'success');
    } catch (e) {
      setError(`Erro ao adicionar item: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIgnore = async (id) => {
    setLoading(true);
    try {
      await deleteIgnore(id);
      loadIgnores();
      onAction('Item removido da lista de ignorados!', 'success');
    } catch (e) {
      setError(`Erro ao remover item: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isGlobalMode 
            ? 'Estes arquivos e diretórios serão ignorados em TODOS os projetos durante a análise.'
            : 'Estes arquivos e diretórios serão ignorados especificamente para este projeto.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            label="Arquivo ou diretório a ignorar"
            value={newIgnore}
            onChange={(e) => setNewIgnore(e.target.value)}
            fullWidth
            disabled={loading}
            placeholder="Ex: node_modules, *.log, temp/"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddIgnore();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddIgnore}
            startIcon={<AddIcon />}
            disabled={loading || !newIgnore.trim()}
          >
            Adicionar
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {loading && ignores.all.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {!isGlobalMode && ignores.global.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Ignorados Globais (aplicados a todos os projetos)
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 150, overflow: 'auto' }}>
                  <List dense>
                    {ignores.global.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemText 
                          primary={item.path}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}

            {!isGlobalMode && ignores.subProject.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Ignorados do Projeto Pai (herdados)
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 150, overflow: 'auto' }}>
                  <List dense>
                    {ignores.subProject.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemText 
                          primary={item.path}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}

            <Typography variant="subtitle2" gutterBottom>
              {isGlobalMode ? 'Lista Global' : 'Específicos deste Projeto'}
            </Typography>
            
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {(isGlobalMode ? ignores.global : ignores.project).length === 0 ? (
                  <ListItem>
                    <ListItemText primary="Nenhum item ignorado para este escopo." />
                  </ListItem>
                ) : (
                  (isGlobalMode ? ignores.global : ignores.project).map((item) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteIgnore(item.id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={item.path}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontFamily: 'monospace', fontSize: '0.85rem' }
                        }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </>
  );
};

export default IgnoreManager;