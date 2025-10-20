const express = require('express');
const projectBuilderController = require('../controllers/projectBuilderController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { buildProjectSchema, generatePromptSchema } = require('../validators/projectBuilderValidator');

const router = express.Router();

router.post('/build', validationMiddleware(buildProjectSchema), projectBuilderController.buildProject);
router.post('/generate-prompt', validationMiddleware(generatePromptSchema), projectBuilderController.generatePrompt);

module.exports = router;