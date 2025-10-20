const express = require('express');
const analyzerController = require('../controllers/analyzerController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { analyzerSchema } = require('../validators/analyzerValidator');

const router = express.Router();

router.post('/analyze', validationMiddleware(analyzerSchema), analyzerController.analyzeProject);

module.exports = router;