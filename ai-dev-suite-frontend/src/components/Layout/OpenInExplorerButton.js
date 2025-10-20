import React, { useState } from 'react';
import { Fab, CircularProgress, Tooltip } from '@mui/material';
import { FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import { openInExplorer } from '../../services/api';
import { useProjectContext } from '../../contexts/ProjectContext';

const OpenInExplorerButton = ({ showNotification }) => {
    const { selectedProject } = useProjectContext();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!selectedProject || !selectedProject.directory) {
            showNotification('Nenhum diretório de projeto selecionado.', 'warning');
            return;
        }
        setLoading(true);
        try {
            const result = await openInExplorer({ directory: selectedProject.directory });
            showNotification(result.message, 'success');
        } catch (error) {
            showNotification(error.message || 'Erro ao abrir o Explorer.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedProject || !selectedProject.directory || selectedProject.isManual) {
        return null;
    }

    return (
        <Tooltip title={`Abrir ${selectedProject.title} no Explorer`}>
            <Fab
                color="secondary" // Alterado para 'warning' para cor amarela
                aria-label="open in explorer"
                onClick={handleClick}
                disabled={loading}
                sx={{
                    position: 'fixed',
                    top: '150px',
                    right: '24px',
                    zIndex: 1300,
                    backgroundColor: 'warning.main', // Assegura que o fundo seja amarelo
                    '&:hover': {
                        backgroundColor: 'warning.dark', // Escurece no hover
                    }
                }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : <FolderOpenIcon />}
            </Fab>
        </Tooltip>
    );
};

export default OpenInExplorerButton;