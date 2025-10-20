const express = require('express');
const metricsController = require('../controllers/metricsController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { metricsSchema } = require('../validators/metricsValidator');

const router = express.Router();

router.post('/analyze', validationMiddleware(metricsSchema), metricsController.analyzeMetrics);

module.exports = router;