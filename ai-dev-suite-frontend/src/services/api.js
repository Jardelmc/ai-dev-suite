import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5858/api";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
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
export const getPrompts = async (categoryId = null) => {
  const params = categoryId ? { categoryId } : {};
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
  const response = await apiClient.post("/project-builder/generate-prompt", data);
  return response.data.data;
};
export const generateFavicons = async (data) => {
  const response = await apiClient.post('/favicons/generate', data);
  return response.data.data;
};
export const openInExplorer = async (data) => {
  const response = await apiClient.post("/explorer/open", data);
  return response.data.data;
};
export default apiClient;