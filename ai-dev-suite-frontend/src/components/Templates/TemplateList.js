import React from 'react';
import {
  Grid, Card, CardContent, Typography, Box, IconButton, Menu, MenuItem, Chip, CircularProgress
} from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { getTemplate } from '../../services/api';

const TemplateList = ({ templates, onEdit, onDelete, showNotification }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [downloading, setDownloading] = React.useState(null);

  const handleMenuOpen = (event, template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleEdit = () => {
    onEdit(selectedTemplate);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(selectedTemplate.id);
    handleMenuClose();
  };

  const handleDownload = async () => {
    if (!selectedTemplate) return;
    setDownloading(selectedTemplate.id);
    handleMenuClose();
    try {
      const fullTemplate = await getTemplate(selectedTemplate.id);
      const blob = new Blob([fullTemplate.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${fullTemplate.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Download do template iniciado!', 'success');
    } catch (e) {
      showNotification('Erro ao fazer download do template: ' + e.message, 'error');
    } finally {
      setDownloading(null);
    }
  };


  if (templates.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center" sx={{ p: 4 }}>
        Nenhum template encontrado. Crie um novo para começar.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} key={template.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {template.name}
                </Typography>
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, template)} disabled={!!downloading}>
                  {downloading === template.id ? <CircularProgress size={20} /> : <MoreVertIcon />}
                </IconButton>
              </Box>
              <Chip
                label={template.type === 'backend' ? 'Backend' : 'Frontend'}
                color={template.type === 'backend' ? 'primary' : 'secondary'}
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {template.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Excluir
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default TemplateList;