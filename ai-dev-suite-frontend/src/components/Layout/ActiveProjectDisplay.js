import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Folder as FolderIcon,
  AccountTree as SubprojectIcon,
  FolderOpen as ManualFolderIcon,
} from '@mui/icons-material';
import { useProjectContext } from '../../contexts/ProjectContext';

const ActiveProjectDisplay = ({ project }) => {
  const { projects } = useProjectContext();
  const getParentProject = () => {
    if (!project.parentId) return null;
    return projects.find(p => p.id === project.parentId);
  };
  const getProjectPath = () => {
    if (project.isManual) {
      return 'Diretório Manual';
    }

    const parent = getParentProject();
    if (parent) {
      return `${parent.title} › ${project.title}`;
    }
    return project.title;
  };

  const getProjectIcon = () => {
    if (project.isManual) return <ManualFolderIcon sx={{ fontSize: 20 }} />;
    if (project.parentId) return <SubprojectIcon sx={{ fontSize: 20 }} />;
    return <FolderIcon sx={{ fontSize: 20 }} />;
  };
  const getProjectTypeConfig = () => {
    if (project.isManual) {
      return {
        label: 'Manual',
        bgColor: '#fff3e0',
        chipColor: '#f57c00',
        iconColor: '#f57c00'
      };
    }
    if (project.parentId) {
      return {
        label: 'Subprojeto',
        bgColor: '#e3f2fd',
        chipColor: '#1976d2',
        iconColor: '#1976d2'
      };
    }
    return {
      label: 'Projeto',
      bgColor: '#ffebee',
      chipColor: '#CC092F',
      iconColor: '#CC092F'
    };
  };

  const getProjectInitials = () => {
    return project.title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };
  const typeConfig = getProjectTypeConfig();

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3,
        backgroundColor: 'background.paper',
        border: `1px solid ${typeConfig.chipColor}20`,
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ py: 2.5, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{ 
              width: 48,
              height: 48,
              backgroundColor: typeConfig.iconColor,
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {getProjectInitials()}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography 
                variant="h6" 
                component="span" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '1.1rem'
                }}
              >
                {getProjectPath()}
              </Typography>
              
              <Chip
                label={typeConfig.label}
                size="small"
                sx={{
                  backgroundColor: typeConfig.chipColor,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            </Box>

            {project.description ? (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.description}
              </Typography>
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.8rem',
                  fontStyle: 'italic'
                }}
              >
                Nenhuma descrição disponível
              </Typography>
            )}

            {project.directory && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  mt: 1,
                  display: 'block',
                  backgroundColor: 'action.hover',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                📁 {project.directory}
              </Typography>
            )}
          </Box>

          <Box sx={{ 
            backgroundColor: `${typeConfig.chipColor}10`,
            borderRadius: 2,
            py: 1,
            px: 2,
            border: `1px solid ${typeConfig.chipColor}30`
          }}>
            <Typography 
              variant="caption" 
              color={typeConfig.chipColor}
              sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5 }}
            >
              ATIVO
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActiveProjectDisplay;