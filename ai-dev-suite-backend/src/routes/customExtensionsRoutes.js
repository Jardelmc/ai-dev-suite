const express = require('express');
const customExtensionsController = require('../controllers/customExtensionsController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { addExtensionSchema } = require('../validators/customExtensionsValidator');

const router = express.Router();

router.get('/', customExtensionsController.listCustomExtensions);
router.get('/defaults', customExtensionsController.listDefaultExtensions);
router.post('/', validationMiddleware(addExtensionSchema), customExtensionsController.addCustomExtension);
router.delete('/:id', customExtensionsController.removeCustomExtension);

module.exports = router;