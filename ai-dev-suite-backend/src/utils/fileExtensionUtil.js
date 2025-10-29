const dbService = require('../services/dbService');
const logger = require('./logger');

const DEFAULT_TEXT_EXTENSIONS = [
  ".txt", ".js", ".json", ".md", ".html", ".css", ".csv", ".xml", ".yml", ".yaml",
  ".ts", ".tsx", ".jsx", ".java", ".py", ".c", ".cpp", ".h", ".sh", ".php",
  ".rb", ".go", ".rs", ".kt", ".swift", ".scala", ".clj", ".sql", ".r", ".m",
  ".pl", ".lua", ".dart", ".vue", ".svelte", ".scss", ".sass", ".less", ".styl",
  ".coffee", ".ps1", ".bat", ".cmd", ".ini", ".cfg", ".conf", ".log", ".env",
  ".env.example", ".dockerfile", ".gitignore", ".gitkeep", ".editorconfig",
  ".prettierrc", ".eslintrc", ".babelrc", ".npmrc", ".yarnrc", ".nvmrc",
  ".dockerignore", ".htaccess", ".robots", ".sitemap",
];

const DEFAULT_NO_EXTENSION_TEXT_FILES = [
  "readme", "license", "changelog", "makefile", "dockerfile", "procfile",
  "gemfile", "rakefile", "vagrantfile", "jenkinsfile", "gruntfile", "gulpfile",
];

let cachedCustomExtensions = null;
let lastReadTime = 0;
const CACHE_DURATION = 60 * 1000; // Cache for 1 minute

const getCustomExtensionsFromDb = async () => {
    const now = Date.now();
    if (cachedCustomExtensions && now - lastReadTime < CACHE_DURATION) {
        return cachedCustomExtensions;
    }
    try {
        const db = await dbService.readDb();
        cachedCustomExtensions = (db.customTextExtensions || []).map(item => item.extension);
        lastReadTime = now;
        logger.info(`Fetched ${cachedCustomExtensions.length} custom text extensions from DB.`);
        return cachedCustomExtensions;
    } catch (error) {
        logger.error(`Error fetching custom text extensions from DB: ${error.message}`);
        // Return cached version if available, otherwise empty array
        return cachedCustomExtensions || [];
    }
};

const getAllowedTextExtensions = async () => {
    const customExtensions = await getCustomExtensionsFromDb();
    const combined = new Set([...DEFAULT_TEXT_EXTENSIONS, ...customExtensions]);
    return Array.from(combined);
};

const getAllowedNoExtensionFiles = () => {
    return DEFAULT_NO_EXTENSION_TEXT_FILES;
};

module.exports = {
  DEFAULT_TEXT_EXTENSIONS, // Export default list if needed elsewhere
  DEFAULT_NO_EXTENSION_TEXT_FILES, // Export default list if needed elsewhere
  getAllowedTextExtensions,
  getAllowedNoExtensionFiles,
  getCustomExtensionsFromDb // Export this to potentially use in the new service
};