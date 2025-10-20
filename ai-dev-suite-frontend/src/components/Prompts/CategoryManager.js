import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { createCategory, updateCategory, deleteCategory } from '../../services/api';

const PRESET_COLORS = [
  '#CC092F', '#1976d2', '#388e3c', '#f57c00',
  '#7b1fa2', '#303f9f', '#00796b', '#f44336',
  '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688',
  '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b',
  '#ffc107', '#ff9800', '#ff5722', '#795548'
];

const CategoryManager = ({ categories, loading, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#CC092F' });
  const [formLoading, setFormLoading] = useState(false);

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#CC092F'
    });
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(categoryToDelete.id);
      onAction('Categoria excluída com sucesso!');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      onAction('Erro ao excluir categoria: ' + error.message, 'error');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#CC092F' });
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) return;

    setFormLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        onAction('Categoria atualizada com sucesso!');
      } else {
        await createCategory(formData);
        onAction('Categoria criada com sucesso!');
      }
      handleFormClose();
    } catch (error) {
      onAction('Erro ao salvar categoria: ' + error.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Categorias ({categories.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Nova Categoria
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={category.name}
                      sx={{ 
                        backgroundColor: category.color || '#CC092F',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, category)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {category.description && (
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Criado em {new Date(category.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Nenhuma categoria cadastrada
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedCategory)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedCategory)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Excluir
        </MenuItem>
      </Menu>

      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon fontSize="small" />
              Cor da Categoria
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {PRESET_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: formData.color === color ? '2px solid #000' : '2px solid transparent',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
            <TextField
              margin="dense"
              label="Código da Cor"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              size="small"
              sx={{ mt: 1, width: 120 }}
            />
          </Box>

          <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1, backgroundColor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Pré-visualização:
            </Typography>
            <Chip
              label={formData.name || 'Nome da categoria'}
              sx={{ 
                backgroundColor: formData.color,
                color: 'white'
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleFormClose} disabled={formLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained"
            disabled={formLoading || !formData.name.trim()}
            startIcon={formLoading && <CircularProgress size={20} />}
          >
            {formLoading ? 'Salvando...' : (editingCategory ? 'Atualizar' : 'Criar')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita e pode afetar prompts associados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManager;