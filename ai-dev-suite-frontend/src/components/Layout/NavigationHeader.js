import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  GitHub as GitIcon,
  LibraryBooks as PromptsIcon,
  Folder as ProjectsIcon,
  Menu as MenuIcon,
  CheckCircle as ConnectedIcon,
  Error as DisconnectedIcon,
  HourglassEmpty as CheckingIcon,
  BarChart as MetricsIcon,
  FileCopy as TemplatesIcon,
  Construction as BuilderIcon,
  Image as ImageIcon,
  Bolt as GoDevIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from "@mui/icons-material";
import logo from "../../assets/logo.png";
import { ColorModeContext } from "../../App";
const NavigationHeader = ({ apiStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/analyzer")) return 0;
    if (path.startsWith("/code-writer")) return 1;
    if (path.startsWith("/git")) return 2;
    if (path.startsWith("/go-dev")) return 3;
    if (path.startsWith("/metrics")) return 4;
    if (path.startsWith("/prompts")) return 5;
    return 0;
  };

  const handleTabChange = (event, newValue) => {
    const routes = [
      "analyzer",
      "code-writer",
      "git",
      "go-dev",
      "metrics",
      "prompts",
    ];
    navigate(`/${routes[newValue]}`);
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case "connected":
        return <ConnectedIcon sx={{ color: "#4caf50", fontSize: 20 }} />;
      case "disconnected":
        return <DisconnectedIcon sx={{ color: "#f44336", fontSize: 20 }} />;
      default:
        return <CheckingIcon sx={{ color: "#ff9800", fontSize: 20 }} />;
    }
  };
  const getStatusTitle = () => {
    switch (apiStatus) {
      case "connected":
        return "API Conectada";
      case "disconnected":
        return "API Desconectada";
      default:
        return "Verificando API...";
    }
  };
  const handleProjectMenuClick = (event) => {
    setProjectMenuAnchor(event.currentTarget);
  };
  const handleProjectMenuClose = () => {
    setProjectMenuAnchor(null);
  };
  const handleViewProjects = () => {
    navigate("/projects");
    handleProjectMenuClose();
  };
  const handleViewTemplates = () => {
    navigate("/templates");
    handleProjectMenuClose();
  };
  const handleViewBuilder = () => {
    navigate("/project-builder");
    handleProjectMenuClose();
  };
  const handleViewFavicons = () => {
    navigate("/favicon-generator");
    handleProjectMenuClose();
  };
  return (
    <AppBar position="sticky" color="primary" elevation={1} sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            onClick={handleProjectMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tabs
              value={getActiveTab()}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                "& .MuiTab-root": {
                  color: "rgba(255,255,255,0.8)",
                  minWidth: "auto",
                  padding: "6px 12px",
                  "&.Mui-selected": {
                    color: "white",
                  },
                },
              }}
            >
              <Tab icon={<AnalyticsIcon />} label="Analyzer" />
              <Tab icon={<CodeIcon />} label="Code Writer" />
              <Tab icon={<GitIcon />} label="Git" />
              <Tab
                icon={<GoDevIcon />}
                label="Go Dev"
                sx={{
                  marginLeft: 6,
                  paddingLeft: 4,
                  borderLeft: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />
              <Tab icon={<MetricsIcon />} label="Metrics" />
              <Tab icon={<PromptsIcon />} label="Prompts" />
            </Tabs>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title={theme.palette.mode === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <IconButton
            title={getStatusTitle()}
            sx={{
              p: 1,
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            {getStatusIcon()}
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            <Avatar
              src={logo}
              alt="AI Dev Suite"
              sx={{
                width: 36,
                height: 36,
                "& img": {
                  objectFit: "contain",
                },
              }}
            />
          </Box>
        </Box>

        <Menu
          anchorEl={projectMenuAnchor}
          open={Boolean(projectMenuAnchor)}
          onClose={handleProjectMenuClose}
        >
          <MenuItem onClick={handleViewBuilder}>
            <BuilderIcon sx={{ mr: 1 }} />
            Project Builder
          </MenuItem>
          <MenuItem onClick={handleViewFavicons}>
            <ImageIcon sx={{ mr: 1 }} />
            Favicon Generator
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleViewProjects}>
            <ProjectsIcon sx={{ mr: 1 }} />
            Ver Projetos
          </MenuItem>
          <MenuItem onClick={handleViewTemplates}>
            <TemplatesIcon sx={{ mr: 1 }} />
            Templates de Projetos
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationHeader;