const databaseService = require('../services/databaseService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

const exportDatabase = async (req, res, next) => {
    try {
        const { zipFilePath, zipFileName } = await databaseService.exportDatabaseFiles();
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        res.setHeader('Content-Type', 'application/zip');
        res.sendFile(zipFilePath, async (err) => {
            if (err) {
                logger.error(`Error sending export file: ${err.message}`);
                next(err);
            } else {
                logger.info(`Database export file sent: ${zipFileName}`);
                try {
                    await fs.unlink(zipFilePath); // Clean up the temporary zip file
                    logger.info(`Temporary export file deleted: ${zipFilePath}`);
                } catch (unlinkErr) {
                    logger.error(`Error deleting temporary export file: ${unlinkErr.message}`);
                }
            }
        });
    } catch (error) {
        logger.error(`Error exporting database: ${error.message}`);
        next(error);
    }
};

const importDatabase = async (req, res, next) => {
    if (!req.file) {
        return responseFormatter.error(res, 400, 'BAD_REQUEST', 'Nenhum arquivo .zip enviado.');
    }

    const tempZipPath = req.file.path;

    try {
        const result = await databaseService.importDatabaseFiles(tempZipPath);
        logger.info('Database imported successfully.');
        return responseFormatter.success(res, 'Banco de dados importado com sucesso. A aplicação será reiniciada.', result);
    } catch (error) {
        logger.error(`Error importing database: ${error.message}`);
        return responseFormatter.error(res, 400, 'IMPORT_ERROR', `Erro na importação: ${error.message}`);
    } finally {
        // Clean up the uploaded temp zip file regardless of success or failure
        try {
            await fs.unlink(tempZipPath);
            logger.info(`Temporary import file deleted: ${tempZipPath}`);
        } catch (unlinkErr) {
            logger.error(`Error deleting temporary import file: ${unlinkErr.message}`);
        }
    }
};

module.exports = {
    exportDatabase,
    importDatabase,
};