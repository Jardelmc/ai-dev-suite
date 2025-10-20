const express = require('express');
const codeWriterController = require('../controllers/codeWriterController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { codeWriterSchema } = require('../validators/codeWriterValidator');

const router = express.Router();

router.post('/generate', validationMiddleware(codeWriterSchema), codeWriterController.generateFiles);

module.exports = router;