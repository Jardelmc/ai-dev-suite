import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Folder as FolderIcon,
  AccountTree as SubprojectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useProjectContext } from "../../contexts/ProjectContext";

const ProjectSidebar = ({ open, onClose, onProjectSelect }) => {
  const { projects, selectedProject } = useProjectContext();
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  const toggleExpanded = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const buildProjectTree = (projectList) => {
    const projectMap = projectList.reduce((acc, project) => {
      acc[project.id] = { ...project, children: [] };
      return acc;
    }, {});

    const rootProjects = [];

    projectList.forEach((project) => {
      if (project.parentId && projectMap[project.parentId]) {
        projectMap[project.parentId].children.push(projectMap[project.id]);
      } else {
        rootProjects.push(projectMap[project.id]);
      }
    });

    return rootProjects;
  };

  const handleProjectClick = (project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const renderProject = (project, level = 0) => {
    const hasChildren = project.children && project.children.length > 0;
    const isExpanded = expandedProjects.has(project.id);
    const isSelected = selectedProject?.id === project.id;

    return (
      <React.Fragment key={project.id}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            selected={isSelected}
            onClick={() => handleProjectClick(project)}
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(project.id);
                  }}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              ) : level > 0 ? (
                <SubprojectIcon fontSize="small" />
              ) : (
                <FolderIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={level === 0 ? 600 : 400}
                    noWrap
                  >
                    {project.title}
                  </Typography>
                  {level > 0 && (
                    <Chip label="Sub" size="small" variant="outlined" />
                  )}
                </Box>
              }
              secondary={
                project.directory ? (
                  <Tooltip title={project.directory}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: 200 }}
                    >
                      {project.directory}
                    </Typography>
                  </Tooltip>
                ) : null
              }
            />
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {project.children.map((child) => renderProject(child, level + 1))}
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const projectTree = buildProjectTree(projects);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        "& .MuiDrawer-paper": {
          width: 320,
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Seleção de Projeto
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {projectTree.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum projeto encontrado
            </Typography>
          </Box>
        ) : (
          <List dense>
            {projectTree.map((project) => renderProject(project))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default ProjectSidebar;
