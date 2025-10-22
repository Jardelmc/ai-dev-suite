import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProjects } from '../services/api';

const ProjectContext = createContext();

const STORAGE_KEY = 'ai-dev-suite-selected-project';
const EXCLUSIONS_STORAGE_KEY = 'ai-dev-suite-project-exclusions';

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

const saveExclusionsToStorage = (exclusions) => {
  try {
    localStorage.setItem(EXCLUSIONS_STORAGE_KEY, JSON.stringify(exclusions));
  } catch (error) {
    console.warn('Erro ao salvar exclusões no localStorage:', error);
  }
};

const loadExclusionsFromStorage = () => {
  try {
    const stored = localStorage.getItem(EXCLUSIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Erro ao carregar exclusões do localStorage:', error);
    return {};
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
        const allExclusions = loadExclusionsFromStorage();
        const projectExclusions = allExclusions[storedProject.id] || [];
        setAnalysisExclusions(new Set(projectExclusions));
      }
    };

    initializeContext();
  }, []);

  const toggleAnalysisExclusion = (subProjectId) => {
    if (!selectedProject || selectedProject.isManual) return;
    
    const newExclusions = new Set(analysisExclusions);
    if (newExclusions.has(subProjectId)) {
      newExclusions.delete(subProjectId);
    } else {
      newExclusions.add(subProjectId);
    }
    setAnalysisExclusions(newExclusions);

    const allExclusions = loadExclusionsFromStorage();
    if (newExclusions.size > 0) {
        allExclusions[selectedProject.id] = Array.from(newExclusions);
    } else {
        delete allExclusions[selectedProject.id];
    }
    saveExclusionsToStorage(allExclusions);
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    saveToStorage(project);
    
    const allExclusions = loadExclusionsFromStorage();
    const projectExclusions = allExclusions[project.id] || [];
    setAnalysisExclusions(new Set(projectExclusions));
  };

  const clearSelection = () => {
    setSelectedProject(null);
    saveToStorage(null);
    setAnalysisExclusions(new Set());
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