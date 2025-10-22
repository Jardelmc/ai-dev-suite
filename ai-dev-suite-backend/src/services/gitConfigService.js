const simpleGit = require("simple-git");
const logger = require("../utils/logger");

const git = simpleGit();

const getGitConfigValue = async (key) => {
  try {
    const value = await git.raw(['config', '--global', key]);
    return value ? value.trim() : null;
  } catch (error) {
    if (error.message.includes('exit code 1')) {
      return null;
    }
    logger.error(`Error getting Git config value for ${key}: ${error.message}`);
    throw error;
  }
};

const setGitConfigValue = async (key, value) => {
  try {
    await git.raw(['config', '--global', key, value]);
    logger.info(`Git config set: ${key} = ${value}`);
  } catch (error) {
    logger.error(`Error setting Git config ${key}: ${error.message}`);
    throw error;
  }
};

const unsetGitConfigValue = async (key) => {
    try {
        await git.raw(['config', '--global', '--unset', key]);
        logger.info(`Git config unset: ${key}`);
    } catch (error) {
        logger.error(`Error unsetting Git config ${key}: ${error.message}`);
        throw error;
    }
};

const getGitAliases = async () => {
    try {
        const output = await git.raw(['config', '--global', '--get-regexp', '^alias\\.']);
        if (!output) return {};

        const aliases = {};
        const lines = output.trim().split('\n');
        lines.forEach(line => {
            const match = line.match(/^alias\.([^ ]+) (.*)$/);
            if (match) {
                aliases[match[1]] = match[2];
            }
        });
        return aliases;
    } catch (error) {
        if (error.message.includes('exit code 1')) {
            return {};
        }
        logger.error(`Error getting Git aliases: ${error.message}`);
        throw error;
    }
};


const getGitConfig = async () => {
  try {
    const name = await getGitConfigValue('user.name');
    const email = await getGitConfigValue('user.email');
    const editor = await getGitConfigValue('core.editor');
    const aliases = await getGitAliases();

    return { name, email, editor, aliases };
  } catch (error) {
    throw new Error(`Failed to retrieve Git config: ${error.message}`);
  }
};

const setGitUserConfig = async (name, email) => {
  if (!name || !email) {
    throw new Error('Name and Email are required.');
  }
  try {
    await setGitConfigValue('user.name', name);
    await setGitConfigValue('user.email', email);
  } catch (error) {
    throw new Error(`Failed to set Git user config: ${error.message}`);
  }
};

const setGitEditorConfig = async (editor) => {
  if (!editor) {
    throw new Error('Editor command is required.');
  }
  try {
    await setGitConfigValue('core.editor', editor);
  } catch (error) {
    throw new Error(`Failed to set Git editor config: ${error.message}`);
  }
};

const addGitAlias = async (alias, command) => {
    if (!alias || !command) {
        throw new Error('Alias name and command are required.');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
        throw new Error('Alias name can only contain letters, numbers, underscores, and hyphens.');
    }
    const key = `alias.${alias}`;
    try {
        await setGitConfigValue(key, command);
    } catch (error) {
        throw new Error(`Failed to add Git alias: ${error.message}`);
    }
};

const removeGitAlias = async (alias) => {
    if (!alias) {
        throw new Error('Alias name is required.');
    }
    const key = `alias.${alias}`;
    try {
        await unsetGitConfigValue(key);
    } catch (error) {
        throw new Error(`Failed to remove Git alias: ${error.message}`);
    }
};

module.exports = {
  getGitConfig,
  setGitUserConfig,
  setGitEditorConfig,
  addGitAlias,
  removeGitAlias,
};