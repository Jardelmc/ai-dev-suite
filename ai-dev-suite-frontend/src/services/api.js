import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5858/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased timeout for potentially longer operations like import/export
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";
    if (error.response?.data?.error?.message) {
      message = error.response.data.error.message;
    } else if (error.response?.data?.message) { // Handle cases where backend might send message directly
      message = error.response.data.message;
    } else if (error.message) {
        message = error.message;
    }

    // Handle specific error codes or statuses if needed
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'IMPORT_ERROR') {
        // More specific message for import errors
        message = `Erro na importação: ${message}`;
    }

    throw new Error(message);
  }
);

export const healthCheck = async () => {
  const response = await apiClient.get("/health");
  return response.data;
};

export const analyzeProject = async (data) => {
  const response = await apiClient.post("/analyzer/analyze", data);
  return response.data.data;
};

export const generateFiles = async (data) => {
  const response = await apiClient.post("/code-writer/generate", data);
  return response.data;
};

export const commitChanges = async (data) => {
  const response = await apiClient.post("/git/commit", data);
  return response.data.data;
};

export const revertChanges = async (data) => {
  const response = await apiClient.post("/git/revert", data);
  return response.data.data;
};

export const getGitStatus = async (projectId) => {
  const response = await apiClient.get(`/git/status/${projectId}`);
  return response.data.data;
};

export const getRemoteStatus = async (projectId) => {
  const response = await apiClient.get(`/git/remote-status/${projectId}`);
  return response.data.data;
};

export const createGitBranch = async (data) => {
  const response = await apiClient.post("/git/branch", data);
  return response.data.data;
};

export const mergeGitBranch = async (data) => {
  const response = await apiClient.post("/git/branch/merge", data);
  return response.data.data;
};

export const getProjectReferenceBranch = async (projectId) => {
  const response = await apiClient.get(`/git/reference-branch/${projectId}`);
  return response.data.data;
};

export const setProjectReferenceBranch = async (data) => {
  const response = await apiClient.post("/git/reference-branch", data);
  return response.data.data;
};

export const initGitRepository = async (data) => {
  const response = await apiClient.post("/git/init", data);
  return response.data;
};

export const getProjects = async (parentId = null) => {
  const params = parentId ? { parentId } : {};
  const response = await apiClient.get("/projects", { params });
  return response.data.data.projects;
};

export const getProject = async (id, includeChildren = false) => {
  const response = await apiClient.get(`/projects/${id}`, {
    params: { includeChildren },
  });
  return response.data.data;
};

export const createProject = async (data) => {
  const response = await apiClient.post("/projects", data);
  return response.data.data;
};

export const updateProject = async (id, data) => {
  const response = await apiClient.put(`/projects/${id}`, data);
  return response.data.data;
};

export const deleteProject = async (id) => {
  const response = await apiClient.delete(`/projects/${id}`);
  return response.data;
};

export const getPrompts = async (categoryId = null, tags = []) => {
  const params = {};
  if (categoryId) {
    params.categoryId = categoryId;
  }
  if (tags && tags.length > 0) {
    params.tags = tags.join(',');
  }
  const response = await apiClient.get("/prompts", { params });
  return response.data.data.prompts;
};

export const getPrompt = async (id) => {
  const response = await apiClient.get(`/prompts/${id}`);
  return response.data.data;
};

export const createPrompt = async (data) => {
  const response = await apiClient.post("/prompts", data);
  return response.data.data;
};

export const updatePrompt = async (id, data) => {
  const response = await apiClient.put(`/prompts/${id}`, data);
  return response.data.data;
};

export const deletePrompt = async (id) => {
  const response = await apiClient.delete(`/prompts/${id}`);
  return response.data;
};

// --- Export/Import Prompts ---
export const exportPrompts = async () => {
  const response = await apiClient.get("/prompts/export", {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'prompts_export_all.json';
  if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length === 2)
          filename = filenameMatch[1];
  }
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { success: true, filename };
};

export const exportPromptById = async (id) => {
  const response = await apiClient.get(`/prompts/export/${id}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  let filename = `prompt_${id}_export.json`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch && filenameMatch.length === 2) {
      filename = filenameMatch[1];
    }
  }
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { success: true, filename };
};

export const importPrompts = async (file) => {
  const formData = new FormData();
  formData.append('importFile', file);
  const response = await apiClient.post("/prompts/import", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
// --- End Export/Import Prompts ---


export const getCategories = async () => {
  const response = await apiClient.get("/categories");
  return response.data.data.categories;
};

export const getCategory = async (id) => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data.data;
};

export const createCategory = async (data) => {
  const response = await apiClient.post("/categories", data);
  return response.data.data;
};

export const updateCategory = async (id, data) => {
  const response = await apiClient.put(`/categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};

export const getIgnores = async () => {
  const response = await apiClient.get("/ignores");
  return response.data.data.ignores;
};

export const getIgnoresForProject = async (projectId) => {
  const response = await apiClient.get(`/ignores/project/${projectId}`);
  return response.data.data;
};

export const createIgnore = async (data) => {
  const response = await apiClient.post("/ignores", data);
  return response.data.data;
};

export const deleteIgnore = async (id) => {
  const response = await apiClient.delete(`/ignores/${id}`);
  return response.data;
};

export const openInVSCode = async (data) => {
  const response = await apiClient.post("/vscode/open", data);
  return response.data.data;
};

export const getProjectMetrics = async (data) => {
  const response = await apiClient.post("/metrics/analyze", data);
  return response.data.data;
};

export const getTemplates = async () => {
  const response = await apiClient.get("/templates");
  return response.data.data.templates;
};

export const getTemplate = async (id) => {
  const response = await apiClient.get(`/templates/${id}`);
  return response.data.data;
};

export const createTemplate = async (data) => {
  const response = await apiClient.post("/templates", data);
  return response.data.data;
};

export const updateTemplate = async (id, data) => {
  const response = await apiClient.put(`/templates/${id}`, data);
  return response.data.data;
};

export const deleteTemplate = async (id) => {
  const response = await apiClient.delete(`/templates/${id}`);
  return response.data;
};

export const buildProject = async (data) => {
  const response = await apiClient.post("/project-builder/build", data);
  return response.data.data;
};

export const generateSolutionPrompt = async (data) => {
  const response = await apiClient.post(
    "/project-builder/generate-prompt",
    data
  );
  return response.data.data;
};
export const generateFavicons = async (data) => {
  const response = await apiClient.post("/favicons/generate", data);
  return response.data.data;
};
export const openInExplorer = async (data) => {
  const response = await apiClient.post("/explorer/open", data);
  return response.data.data;
};

export const getGitRemotes = async (projectId) => {
  const response = await apiClient.get(`/git/remotes/${projectId}`);
  return response.data.data;
};

export const addGitRemote = async (data) => {
  const response = await apiClient.post("/git/remotes", data);
  return response.data.data;
};

export const removeGitRemote = async (data) => {
  const response = await apiClient.delete("/git/remotes", { data });
  return response.data.data;
};

export const pushToRemote = async (data) => {
  const response = await apiClient.post("/git/push", data);
  return response.data.data;
};

export const pullFromRemote = async (data) => {
  const response = await apiClient.post("/git/pull", data);
  return response.data.data;
};

export const cloneRepository = async (data) => {
  const response = await apiClient.post("/git/clone", data);
  return response.data.data;
};

// New API calls for branch management
export const getGitLocalBranches = async (projectId) => {
  const response = await apiClient.get(`/git/branch/local/${projectId}`);
  return response.data.data.branches;
};

export const checkoutGitBranch = async (data) => {
  // data = { projectId: string, branchName: string, applyToSubProjects: boolean }
  const response = await apiClient.post('/git/branch/checkout', data);
  return response.data.data;
};

// Git Config API calls
export const getGitConfig = async () => {
    const response = await apiClient.get('/git-config');
    return response.data.data;
};

export const setGitUserConfig = async (data) => {
    // data = { name: string, email: string }
    const response = await apiClient.post('/git-config/user', data);
    return response.data;
};

export const setGitEditorConfig = async (data) => {
    // data = { editor: string }
    const response = await apiClient.post('/git-config/editor', data);
    return response.data;
};

export const addGitAlias = async (data) => {
    // data = { alias: string, command: string }
    const response = await apiClient.post('/git-config/alias', data);
    return response.data;
};

export const removeGitAlias = async (aliasName) => {
    const response = await apiClient.delete(`/git-config/alias/${aliasName}`);
    return response.data;
};

// Database Export/Import API calls
export const exportDatabase = async () => {
    const response = await apiClient.get('/database/export', {
        responseType: 'blob', // Important to handle the file download
    });
    // Trigger download in the browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'ai-dev-suite-database-export.zip'; // Default filename
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
            filename = filenameMatch[1];
        }
    }
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true, filename }; // Return success status and filename
};

export const importDatabase = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('databaseZip', file);

    const response = await apiClient.post('/database/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress, // Pass the progress callback
    });
    return response.data; // Backend should return { success: true, message: '...' }
};


export default apiClient;