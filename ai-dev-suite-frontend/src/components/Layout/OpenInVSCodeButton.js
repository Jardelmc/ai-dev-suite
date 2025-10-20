import React, { useState } from 'react';
import { Fab, CircularProgress, Tooltip } from '@mui/material';
import VSCodeIcon from '../common/icons/VSCodeIcon';
import { openInVSCode } from '../../services/api';
import { useProjectContext } from '../../contexts/ProjectContext';

const OpenInVSCodeButton = ({ showNotification }) => {
    const { selectedProject } = useProjectContext();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!selectedProject || !selectedProject.directory) {
            showNotification('Nenhum diretório de projeto selecionado.', 'warning');
            return;
        }
        setLoading(true);
        try {
            const result = await openInVSCode({ directory: selectedProject.directory });
            showNotification(result.message, 'success');
        } catch (error) {
            showNotification(error.message || 'Erro ao abrir o VS Code.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedProject || !selectedProject.directory || selectedProject.isManual) {
        return null;
    }

    return (
        <Tooltip title={`Abrir ${selectedProject.title} no VS Code`}>
            <Fab
                color="primary"
                aria-label="open in vscode"
                onClick={handleClick}
                disabled={loading}
                sx={{
                    position: 'fixed',
                    top: '80px',
                    right: '24px',
                    zIndex: 1300,
                    backgroundColor: '#007ACC',
                    '&:hover': {
                        backgroundColor: '#0065A9',
                    }
                }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : <VSCodeIcon />}
            </Fab>
        </Tooltip>
    );
};

export default OpenInVSCodeButton;