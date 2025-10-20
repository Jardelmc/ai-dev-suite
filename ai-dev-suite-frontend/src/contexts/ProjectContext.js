import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProjects } from '../services/api';
const ProjectContext = createContext();

const STORAGE_KEY = 'ai-dev-suite-selected-project';

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
const saveToStorage = (project) => {
  try {
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Erro ao salvar projeto no localStorage:', error);
  }
};

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Erro ao carregar projeto do localStorage:', error);
    return null;
  }
};
export const ProjectProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisExclusions, setAnalysisExclusions] = useState(new Set());

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectList = await getProjects();
      setProjects(projectList);
      if (selectedProject && !selectedProject.isManual) {
        const updatedProject = projectList.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          const updatedSelection = { ...updatedProject };
          setSelectedProject(updatedSelection);
          saveToStorage(updatedSelection);
        } else {
          setSelectedProject(null);
          saveToStorage(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const initializeContext = async () => {
      await loadProjects();
      
      const storedProject = loadFromStorage();
      if (storedProject) {
        setSelectedProject(storedProject);
      }
    };

    initializeContext();
  }, []);

  const clearAnalysisExclusions = () => {
    setAnalysisExclusions(new Set());
  };

  const toggleAnalysisExclusion = (subProjectId) => {
    setAnalysisExclusions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subProjectId)) {
        newSet.delete(subProjectId);
      } else {
        newSet.add(subProjectId);
      }
      return newSet;
    });
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    saveToStorage(project);
    clearAnalysisExclusions();
  };
  const clearSelection = () => {
    setSelectedProject(null);
    saveToStorage(null);
    clearAnalysisExclusions();
  };
  const getProjectSelection = () => {
    if (!selectedProject) return {};
    if (selectedProject.isManual) {
      return { projectDir: selectedProject.directory };
    }
    
    const selection = { projectId: selectedProject.id };

    if (analysisExclusions.size > 0) {
      selection.excludedSubprojectIds = Array.from(analysisExclusions);
    }
    
    return selection;
  };
  const value = {
    selectedProject,
    projects,
    loading,
    selectProject,
    clearSelection,
    loadProjects,
    getProjectSelection,
    analysisExclusions,
    toggleAnalysisExclusion
  };
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};