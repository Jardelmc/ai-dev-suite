const metricsService = require('../services/metricsService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const analyzeMetrics = async (req, res, next) => {
    try {
        const { projectId } = req.body;

        if (!projectId) {
            return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project ID is required.');
        }

        const result = await metricsService.analyzeProjectMetrics(projectId);
        logger.info(`Project metrics analysis completed for project ID: ${projectId}`);
        
        return responseFormatter.success(res, 'Project metrics analyzed successfully', result);
    } catch (error) {
        logger.error(`Error in project metrics analysis: ${error.message}`);
        next(error);
    }
};

module.exports = {
    analyzeMetrics
};