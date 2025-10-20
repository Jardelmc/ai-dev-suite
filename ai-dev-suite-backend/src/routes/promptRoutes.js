const express = require('express');
const promptsController = require('../controllers/promptsController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { promptSchema, updatePromptSchema } = require('../validators/promptValidator');

const router = express.Router();

router.get('/', promptsController.listPrompts);
router.get('/:id', promptsController.getPrompt);
router.post('/', validationMiddleware(promptSchema), promptsController.createPrompt);
router.put('/:id', validationMiddleware(updatePromptSchema), promptsController.updatePrompt);
router.delete('/:id', promptsController.deletePrompt);

module.exports = router;