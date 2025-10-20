import React, { useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Folder as FolderIcon,
  AccountTree as SubprojectIcon,
} from '@mui/icons-material';

const ProjectListItem = ({ project, level, onSelect, selectedId, expanded, onToggleExpand }) => {
  const hasChildren = project.children && project.children.length > 0;
  const isSelected = selectedId === project.id;
  const isExpanded = expanded.has(project.id);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleExpand(project.id);
  };

  const handleSelect = () => {
    onSelect(project);
  };

  return (
    <>
      <ListItemButton
        onClick={handleSelect}
        selected={isSelected}
        sx={{
          pl: 2 + level * 2,
          borderLeft: isSelected ? 3 : 0,
          borderColor: 'primary.main',
          backgroundColor: isSelected ? 'action.selected' : 'transparent',
          mb: 0.5,
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {level > 0 ? <SubprojectIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
        </ListItemIcon>
        <ListItemText
          primary={project.title}
          primaryTypographyProps={{
            fontWeight: isSelected ? 'bold' : 'normal',
            noWrap: true,
          }}
        />
        {hasChildren && (
          <IconButton onClick={handleToggle} size="small">
            {isExpanded ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        )}
      </ListItemButton>
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {project.children.map((child) => (
              <ProjectListItem
                key={child.id}
                project={child}
                level={level + 1}
                onSelect={onSelect}
                selectedId={selectedId}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const ProjectList = ({ projects, selectedProject, onSelectProject }) => {
  const [expanded, setExpanded] = useState(new Set());

  const handleToggleExpand = (projectId) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };
  
  // When a project is selected, make sure its ancestors are expanded
  React.useEffect(() => {
    if (selectedProject?.parentId) {
        setExpanded(prev => new Set(prev).add(selectedProject.parentId));
    }
  }, [selectedProject]);


  return (
    <Box>
        <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
            Projetos
        </Typography>
        <List component="nav" dense>
        {projects.map((project) => (
            <ProjectListItem
                key={project.id}
                project={project}
                level={0}
                onSelect={onSelectProject}
                selectedId={selectedProject?.id}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
            />
        ))}
        </List>
    </Box>
  );
};

export default ProjectList;