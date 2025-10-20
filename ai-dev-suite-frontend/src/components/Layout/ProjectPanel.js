import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
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
  CircularProgress,
  Avatar,
  Badge,
  Card,
  CardContent,
  Checkbox,
} from "@mui/material";
import {
  Folder as FolderIcon,
  AccountTree as SubprojectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import { useProjectContext } from "../../contexts/ProjectContext";

const STORAGE_KEY = "ai-dev-suite-project-panel-minimized";
const ProjectPanel = ({ onProjectSelect }) => {
  const {
    projects,
    selectedProject,
    loading,
    analysisExclusions,
    toggleAnalysisExclusion,
  } = useProjectContext();
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsMinimized(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Erro ao carregar estado do painel:", error);
    }
  }, []);
  const saveMinimizedState = (minimized) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimized));
      setIsMinimized(minimized);
    } catch (error) {
      console.warn("Erro ao salvar estado do painel:", error);
    }
  };
  const toggleMinimized = () => {
    saveMinimizedState(!isMinimized);
  };
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

  const getProjectInitials = (title) => {
    return title
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getProjectColor = (project, isSelected) => {
    if (isSelected) return "#CC092F";
    if (project.parentId) return "#1976d2";
    return "#388e3c";
  };

  const getProjectTypeConfig = (project) => {
    if (project.isManual) {
      return {
        label: "Manual",
        bgColor: "#fff3e0",
        chipColor: "#f57c00",
        iconColor: "#f57c00",
      };
    }
    if (project.parentId) {
      return {
        label: "Sub-sistema",
        bgColor: "#e3f2fd",
        chipColor: "#1976d2",
        iconColor: "#1976d2",
      };
    }
    return {
      label: "Projeto",
      bgColor: "#ffebee",
      chipColor: "#CC092F",
      iconColor: "#CC092F",
    };
  };

  const renderProject = (project, level = 0) => {
    const hasChildren = project.children && project.children.length > 0;
    const isExpanded = expandedProjects.has(project.id);
    const isSelected = selectedProject?.id === project.id;
    const isSubproject = level > 0;
    const isChildOfSelected = selectedProject && project.parentId === selectedProject.id;
    return (
      <React.Fragment key={project.id}>
        <ListItem
          disablePadding
          sx={{
            pl: level * 1.5,
            mb: 0.5,
          }}
        >
          <ListItemButton
            selected={isSelected}
            onClick={() => handleProjectClick(project)}
            sx={{
              minHeight: 56,
              borderRadius: 2,
              mx: 1,
              transition: "all 0.2s ease-in-out",
              "&.Mui-selected": {
                backgroundColor: "rgba(204, 9, 47, 0.08)",
                borderLeft: "3px solid #CC092F",
                "&:hover": {
                  backgroundColor: "rgba(204, 9, 47, 0.12)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                transform: "translateX(2px)",
              },
            }}
          >
            {isChildOfSelected && !isMinimized && (
              <Tooltip title="Incluir na Análise">
                <Checkbox
                  size="small"
                  edge="start"
                  checked={!analysisExclusions.has(project.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleAnalysisExclusion(project.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ mr: 1, p: 0.5 }}
                />
              </Tooltip>
            )}
            <ListItemIcon sx={{ minWidth: isMinimized ? "auto" : 48 }}>
              {!isMinimized && hasChildren ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(project.id);
                  }}
                  sx={{
                    p: 0.5,
                    mr: 0.5,
                    transition: "transform 0.2s ease-in-out",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              ) : (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: getProjectColor(project, isSelected),
                    color: "white",
                  }}
                >
                  {getProjectInitials(project.title)}
                </Avatar>
              )}
            </ListItemIcon>

            {!isMinimized && (
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={isSelected ? 600 : isSubproject ? 400 : 500}
                      sx={{
                        fontSize: isSubproject ? "0.8rem" : "0.875rem",
                        color: isSelected ? "#CC092F" : "text.primary",
                        lineHeight: 1.2,
                      }}
                    >
                      {project.title}
                    </Typography>
                    {isSubproject && (
                      <Chip
                        label="Sub"
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 18,
                          fontSize: "0.6rem",
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    )}
                    {hasChildren && (
                      <Badge
                        badgeContent={project.children.length}
                        color="primary"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.6rem",
                            minWidth: 16,
                            height: 16,
                          },
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  project.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.7rem",
                        lineHeight: 1.2,
                        mt: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.description}
                    </Typography>
                  )
                }
                sx={{ my: 0 }}
              />
            )}

            {isSelected && (
              <DotIcon
                sx={{
                  fontSize: 8,
                  color: "#CC092F",
                  ml: 0.5,
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && !isMinimized && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ ml: 1 }}>
              {project.children.map((child) => renderProject(child, level + 1))}
            </Box>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const projectTree = buildProjectTree(projects);

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        left: 0,
        top: 72,
        height: "calc(100vh - 72px)",
        width: isMinimized ? 64 : 320,
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        borderRight: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          minHeight: 64,
          backgroundColor: "background.paper",
        }}
      >
        {!isMinimized && (
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ fontSize: "1rem", color: "text.primary" }}
            >
              Projetos
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
            </Typography>
          </Box>
        )}
        <Tooltip
          title={isMinimized ? "Expandir painel" : "Minimizar painel"}
          placement="right"
        >
          <IconButton
            onClick={toggleMinimized}
            size="small"
            sx={{
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "action.selected" },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {isMinimized ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {selectedProject && (
        <Card
          elevation={0}
          sx={{
            m: 2,
            mb: 1,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(204, 9, 47, 0.1) 0%, rgba(204, 9, 47, 0.05) 100%)",
            border: "2px solid rgba(204, 9, 47, 0.2)",
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            {isMinimized ? (
              <Tooltip
                title={`Projeto Ativo: ${selectedProject.title}`}
                placement="right"
              >
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      backgroundColor: "#CC092F",
                      color: "white",
                      border: "2px solid white",
                      boxShadow: "0 2px 8px rgba(204, 9, 47, 0.3)",
                    }}
                  >
                    {getProjectInitials(selectedProject.title)}
                  </Avatar>
                </Box>
              </Tooltip>
            ) : (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          color: "#CC092F",
                          fontSize: "1rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {selectedProject.title}
                      </Typography>
                      <Chip
                        label={getProjectTypeConfig(selectedProject).label}
                        size="small"
                        sx={{
                          backgroundColor:
                            getProjectTypeConfig(selectedProject).chipColor,
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.65rem",
                          height: 22,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {selectedProject.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "1rem",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mt: 1.5,
                      mb: 1,
                    }}
                  >
                    {selectedProject.description}
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ flexGrow: 1, overflow: "auto", py: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : projectTree.length === 0 ? (
          !isMinimized && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8rem" }}
              >
                Nenhum projeto encontrado
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem" }}
              >
                Use o gerenciador para criar novos projetos
              </Typography>
            </Box>
          )
        ) : (
          <List dense sx={{ px: 0.5 }}>
            {projectTree.map((project) => renderProject(project))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default ProjectPanel;