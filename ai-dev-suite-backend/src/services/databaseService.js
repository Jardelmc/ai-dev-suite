const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const os = require('os');
const logger = require('../utils/logger');

const DB_PATH = path.join(process.cwd(), 'db.json');
const DB_TEMPLATES_PATH = path.join(process.cwd(), 'db_templates.json');
const requiredFiles = ['db.json', 'db_templates.json'];

const exportDatabaseFiles = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFileName = `ai-dev-suite-database-${timestamp}.zip`;
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-dev-suite-export-'));
    const zipFilePath = path.join(tempDir, zipFileName);

    try {
        const zip = new AdmZip();
        await zip.addLocalFile(DB_PATH);
        await zip.addLocalFile(DB_TEMPLATES_PATH);
        await zip.writeZipPromise(zipFilePath);

        logger.info(`Database files zipped successfully to ${zipFilePath}`);
        return { zipFilePath, zipFileName };
    } catch (error) {
        logger.error(`Error creating database export zip: ${error.message}`);
        throw new Error('Falha ao criar o arquivo de exportação.');
    }
    // Note: Temporary directory cleanup happens in the controller after file sending
};

const importDatabaseFiles = async (zipFilePath) => {
    const tempExtractDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-dev-suite-import-'));

    try {
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(tempExtractDir, true); // Overwrite if exists

        logger.info(`Zip file extracted to temporary directory: ${tempExtractDir}`);

        // Verify required files exist
        for (const file of requiredFiles) {
            const extractedFilePath = path.join(tempExtractDir, file);
            try {
                await fs.access(extractedFilePath);
                logger.info(`Required file found: ${file}`);
            } catch (err) {
                throw new Error(`Arquivo .zip inválido. Arquivo obrigatório não encontrado: ${file}`);
            }

            // Optional: Basic JSON validation
            try {
                const content = await fs.readFile(extractedFilePath, 'utf8');
                JSON.parse(content);
                logger.info(`File ${file} is valid JSON.`);
            } catch (jsonErr) {
                throw new Error(`Arquivo .zip inválido. O arquivo ${file} não é um JSON válido: ${jsonErr.message}`);
            }
        }

        // If validation passes, replace original files
        await fs.copyFile(path.join(tempExtractDir, 'db.json'), DB_PATH);
        logger.info(`Replaced ${DB_PATH}`);
        await fs.copyFile(path.join(tempExtractDir, 'db_templates.json'), DB_TEMPLATES_PATH);
        logger.info(`Replaced ${DB_TEMPLATES_PATH}`);

        return { success: true };

    } catch (error) {
        logger.error(`Error during database import process: ${error.message}`);
        throw error; // Re-throw the specific error message
    } finally {
        // Clean up the temporary extraction directory
        try {
            await fs.rm(tempExtractDir, { recursive: true, force: true });
            logger.info(`Temporary extraction directory deleted: ${tempExtractDir}`);
        } catch (rmErr) {
            logger.error(`Error deleting temporary extraction directory: ${rmErr.message}`);
        }
    }
};


module.exports = {
    exportDatabaseFiles,
    importDatabaseFiles,
};