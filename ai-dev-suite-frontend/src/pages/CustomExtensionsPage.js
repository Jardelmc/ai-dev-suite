import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Box, Paper, TextField, Button, List, ListItem, ListItemText,
    IconButton, Divider, Alert, CircularProgress, Grid, Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Extension as ExtensionIcon } from '@mui/icons-material';
import {
    getCustomExtensions,
    getDefaultExtensions,
    addCustomExtension,
    deleteCustomExtension
} from '../services/api';

const CustomExtensionsPage = ({ showNotification }) => {
    const [customExtensions, setCustomExtensions] = useState([]);
    const [defaultLists, setDefaultLists] = useState({ extensions: [], noExtensionFiles: [] });
    const [newExtension, setNewExtension] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [customData, defaultData] = await Promise.all([
                getCustomExtensions(),
                getDefaultExtensions()
            ]);
            setCustomExtensions(customData || []);
            setDefaultLists(defaultData || { extensions: [], noExtensionFiles: [] });
        } catch (e) {
            const msg = `Erro ao carregar extensões: ${e.message}`;
            setError(msg);
            showNotification(msg, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddExtension = async () => {
        if (!newExtension.trim() || !newExtension.startsWith('.')) {
            showNotification('Formato inválido. A extensão deve começar com um ponto (ex: ".ext").', 'warning');
            return;
        }
        setActionLoading(true);
        try {
            await addCustomExtension(newExtension.trim());
            setNewExtension('');
            showNotification('Extensão customizada adicionada com sucesso!', 'success');
            loadData();
        } catch (e) {
            showNotification(`Erro ao adicionar extensão: ${e.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteExtension = async (id) => {
        setActionLoading(true);
        try {
            await deleteCustomExtension(id);
            showNotification('Extensão customizada removida com sucesso!', 'success');
            loadData();
        } catch (e) {
            showNotification(`Erro ao remover extensão: ${e.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ExtensionIcon sx={{ mr: 1 }} />
                    Extensões de Arquivo de Texto Customizadas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gerencie extensões de arquivo adicionais que devem ser tratadas como texto pelas ferramentas Analyzer e Metrics.
                    Estas regras são aplicadas globalmente a todos os projetos.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Custom Extensions Management */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Adicionar/Remover Extensões</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                size="small"
                                label="Nova Extensão (ex: .myext)"
                                value={newExtension}
                                onChange={(e) => setNewExtension(e.target.value)}
                                fullWidth
                                disabled={actionLoading}
                                onKeyPress={(e) => { if (e.key === 'Enter') handleAddExtension(); }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddExtension}
                                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                                disabled={actionLoading || !newExtension.trim() || !newExtension.startsWith('.')}
                            >
                                Adicionar
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" gutterBottom>Extensões Customizadas ({customExtensions.length})</Typography>
                        {loading && customExtensions.length === 0 ? (
                            <CircularProgress size={24} />
                        ) : customExtensions.length === 0 ? (
                             <Typography variant="body2" color="text.secondary">Nenhuma extensão customizada adicionada.</Typography>
                        ): (
                            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                <List dense>
                                    {customExtensions.map((item) => (
                                        <ListItem
                                            key={item.id}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleDeleteExtension(item.id)}
                                                    disabled={actionLoading}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={item.extension}
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: { fontFamily: 'monospace', fontSize: '0.85rem' }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                         <Alert severity="info" sx={{ mt: 2 }}>
                            As alterações podem levar alguns minutos para serem refletidas nas ferramentas devido ao cache.
                        </Alert>
                    </Paper>
                </Grid>

                {/* Default Extensions Display */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Extensões Padrão (Hardcoded)</Typography>
                         {loading ? (
                             <CircularProgress size={24} />
                         ) : (
                             <>
                                <Typography variant="subtitle2" gutterBottom>Arquivos baseados em extensão:</Typography>
                                <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 1, mb: 2 }}>
                                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {defaultLists.extensions.sort().map(ext => (
                                            <Chip key={ext} label={ext} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Paper>

                                <Typography variant="subtitle2" gutterBottom>Arquivos sem extensão (baseados no nome):</Typography>
                                <Paper variant="outlined" sx={{ maxHeight: 100, overflow: 'auto', p: 1 }}>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {defaultLists.noExtensionFiles.sort().map(name => (
                                            <Chip key={name} label={name} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Paper>
                             </>
                         )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CustomExtensionsPage;