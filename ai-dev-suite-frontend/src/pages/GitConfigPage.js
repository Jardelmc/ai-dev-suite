import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { getGitConfig } from '../services/api';
import GitConfigForm from '../components/Git/GitConfigForm';

const GitConfigPage = ({ showNotification }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadConfig = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const result = await getGitConfig();
            setConfig(result);
        } catch (e) {
            setError(`Erro ao carregar configurações do Git: ${e.message}`);
            showNotification(`Erro ao carregar configurações do Git: ${e.message}`, 'error');
            setConfig(null); // Ensure config is null on error
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const handleActionSuccess = (message) => {
        showNotification(message, 'success');
        loadConfig(); // Reload config after successful action
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    Configurações Globais do Git
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualize e modifique suas configurações globais do Git (`--global`) diretamente.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Carregando configurações...</Typography>
                    </Box>
                ) : config ? (
                    <GitConfigForm
                        initialConfig={config}
                        onActionSuccess={handleActionSuccess}
                        showNotification={showNotification}
                    />
                ) : !error ? (
                     <Alert severity="warning">Não foi possível carregar as configurações do Git.</Alert>
                ): null }
            </Paper>
        </Container>
    );
};

export default GitConfigPage;