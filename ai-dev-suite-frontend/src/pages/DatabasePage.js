import React, { useState, useRef } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Divider,
    LinearProgress,
} from '@mui/material';
import { Download as ExportIcon, UploadFile as ImportIcon } from '@mui/icons-material';
import { exportDatabase, importDatabase } from '../services/api'; // Assuming you add these functions

const DatabasePage = ({ showNotification }) => {
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleExport = async () => {
        setExportLoading(true);
        try {
            await exportDatabase(); // Assumes api.js handles the download trigger
            // No direct success message here as the download is browser-handled
        } catch (error) {
            showNotification(`Erro ao exportar banco de dados: ${error.message}`, 'error');
        } finally {
            setExportLoading(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.zip')) {
            showNotification('Por favor, selecione um arquivo .zip válido.', 'warning');
            return;
        }

        setImportLoading(true);
        setImportProgress(0); // Reset progress

        try {
            const result = await importDatabase(file, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setImportProgress(percentCompleted);
            });
            showNotification(result.message || 'Importação bem-sucedida! A página será atualizada.', 'success');

            // Start countdown for refresh
            let countdown = 5;
            showNotification(`Atualizando a página em ${countdown}...`, 'info');
            const intervalId = setInterval(() => {
                countdown -= 1;
                if (countdown > 0) {
                    showNotification(`Atualizando a página em ${countdown}...`, 'info');
                } else {
                    clearInterval(intervalId);
                    window.location.reload();
                }
            }, 1000);

        } catch (error) {
            showNotification(`Erro ao importar banco de dados: ${error.message}`, 'error');
        } finally {
            setImportLoading(false);
            setImportProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gerenciamento do Banco de Dados
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Exporte o banco de dados atual (db.json e db_templates.json) como um arquivo .zip ou importe um backup para restaurar os dados.
                </Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={4} alignItems="center">
                    {/* Export Section */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Exportar Dados</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Faça o download de um arquivo .zip contendo os arquivos `db.json` e `db_templates.json` atuais.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <ExportIcon />}
                            onClick={handleExport}
                            disabled={exportLoading || importLoading}
                            fullWidth
                            size="large"
                        >
                            {exportLoading ? 'Exportando...' : 'Exportar Banco de Dados'}
                        </Button>
                    </Grid>

                    {/* Import Section */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Importar Dados</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Substitua os dados atuais importando um arquivo .zip (gerado anteriormente). <strong>Atenção: Esta ação sobrescreverá todos os dados existentes.</strong>
                        </Typography>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".zip"
                            style={{ display: 'none' }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={importLoading ? <CircularProgress size={20} /> : <ImportIcon />}
                            onClick={handleImportClick}
                            disabled={importLoading || exportLoading}
                            fullWidth
                            size="large"
                        >
                            {importLoading ? 'Importando...' : 'Selecionar Arquivo .zip'}
                        </Button>
                        {importLoading && (
                            <Box sx={{ width: '100%', mt: 1 }}>
                                <LinearProgress variant="determinate" value={importProgress} />
                                <Typography variant="caption" display="block" textAlign="center">{`${importProgress}%`}</Typography>
                            </Box>
                        )}
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Após a importação, a aplicação será reiniciada automaticamente.
                        </Alert>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default DatabasePage;