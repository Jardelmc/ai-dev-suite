const express = require('express');
const faviconController = require('../controllers/faviconController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { faviconGenerationSchema } = require('../validators/faviconValidator');

const router = express.Router();

router.post('/generate', validationMiddleware(faviconGenerationSchema), faviconController.generate);

module.exports = router;