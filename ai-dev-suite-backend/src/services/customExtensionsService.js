const { v4: uuidv4 } = require('uuid');
const dbService = require('./dbService');
const logger = require('../utils/logger');
const { DEFAULT_TEXT_EXTENSIONS, DEFAULT_NO_EXTENSION_TEXT_FILES } = require('../utils/fileExtensionUtil');

const getAllCustomExtensions = async () => {
  const db = await dbService.readDb();
  return db.customTextExtensions || [];
};

const getDefaultExtensions = () => {
    return {
        extensions: DEFAULT_TEXT_EXTENSIONS,
        noExtensionFiles: DEFAULT_NO_EXTENSION_TEXT_FILES
    };
};

const createCustomExtension = async (extension) => {
  if (!extension || typeof extension !== 'string' || !extension.startsWith('.')) {
      throw new Error('Invalid extension format. Must start with a dot (e.g., ".ext").');
  }
  const normalizedExtension = extension.toLowerCase();

  const db = await dbService.readDb();
  if (!db.customTextExtensions) {
    db.customTextExtensions = [];
  }

  const existing = db.customTextExtensions.find(item => item.extension === normalizedExtension);
  if (existing) {
    throw new Error(`Extension "${normalizedExtension}" already exists.`);
  }

  // Also check against defaults (case-insensitive)
  if (DEFAULT_TEXT_EXTENSIONS.includes(normalizedExtension)) {
     throw new Error(`Extension "${normalizedExtension}" is already included by default.`);
  }


  const newExtension = {
    id: uuidv4(),
    extension: normalizedExtension,
    createdAt: new Date().toISOString()
  };

  db.customTextExtensions.push(newExtension);
  await dbService.writeDb(db);
  logger.info(`Custom text extension added: ${normalizedExtension}`);

  // Clear cache in fileExtensionUtil (if caching is implemented there)
  // This requires exporting a function like clearCache() from fileExtensionUtil
  // require('../utils/fileExtensionUtil').clearCache(); // Example

  return newExtension;
};

const deleteCustomExtension = async (id) => {
  const db = await dbService.readDb();
  const initialLength = db.customTextExtensions?.length || 0;

  db.customTextExtensions = (db.customTextExtensions || []).filter(item => item.id !== id);

  if (db.customTextExtensions.length === initialLength) {
    return false; // Not found
  }

  await dbService.writeDb(db);
  logger.info(`Custom text extension deleted: ${id}`);

   // Clear cache in fileExtensionUtil
   // require('../utils/fileExtensionUtil').clearCache(); // Example

  return true;
};

module.exports = {
  getAllCustomExtensions,
  createCustomExtension,
  deleteCustomExtension,
  getDefaultExtensions,
};