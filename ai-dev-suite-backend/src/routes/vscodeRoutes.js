const express = require('express');
const vscodeController = require('../controllers/vscodeController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { openVSCodeSchema } = require('../validators/vscodeValidator');

const router = express.Router();

router.post('/open', validationMiddleware(openVSCodeSchema), vscodeController.openProject);

module.exports = router;