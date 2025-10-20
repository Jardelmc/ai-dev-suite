const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const DB_PATH = path.join(process.cwd(), 'db_templates.json');

const readDb = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('db_templates.json not found, creating a new one.');
      const initialData = { templates: [] };
      await writeDb(initialData);
      return initialData;
    }
    logger.error(`Error reading from db_templates.json: ${error.message}`);
    throw new Error('Could not read from template database.');
  }
};

const writeDb = async (data) => {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    logger.error(`Error writing to db_templates.json: ${error.message}`);
    throw new Error('Could not write to template database.');
  }
};

module.exports = {
  readDb,
  writeDb
};