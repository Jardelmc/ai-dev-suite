const express = require('express');
const templatesController = require('../controllers/templatesController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { createTemplateSchema, updateTemplateSchema } = require('../validators/templateValidator');

const router = express.Router();

router.get('/', templatesController.listTemplates);
router.get('/:id', templatesController.getTemplate);
router.post('/', validationMiddleware(createTemplateSchema), templatesController.createTemplate);
router.put('/:id', validationMiddleware(updateTemplateSchema), templatesController.updateTemplate);
router.delete('/:id', templatesController.deleteTemplate);

module.exports = router;