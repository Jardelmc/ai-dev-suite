const express = require('express');
const multer = require('multer');
const path = require('path');
const promptsController = require('../controllers/promptsController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { promptSchema, updatePromptSchema } = require('../validators/promptValidator');

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') }); // Store temp files in ./uploads

router.get('/', promptsController.listPrompts);
router.get('/export', promptsController.exportPrompts); // Export all route
router.get('/export/:id', promptsController.exportPromptById); // Export single route
router.post('/import', upload.single('importFile'), promptsController.importPrompts); // Import route
router.get('/:id', promptsController.getPrompt);
router.post('/', validationMiddleware(promptSchema), promptsController.createPrompt);
router.put('/:id', validationMiddleware(updatePromptSchema), promptsController.updatePrompt);
router.delete('/:id', promptsController.deletePrompt);

module.exports = router;