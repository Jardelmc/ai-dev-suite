const express = require('express');
const explorerController = require('../controllers/explorerController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { openExplorerSchema } = require('../validators/explorerValidator');

const router = express.Router();

router.post('/open', validationMiddleware(openExplorerSchema), explorerController.openProject);

module.exports = router;