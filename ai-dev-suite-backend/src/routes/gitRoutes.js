const express = require('express');
const gitController = require('../controllers/gitController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { gitCommitSchema, gitRevertSchema } = require('../validators/gitValidator');
const router = express.Router();

router.post('/commit', validationMiddleware(gitCommitSchema), gitController.commitChanges);
router.post('/revert', validationMiddleware(gitRevertSchema), gitController.revertChanges);
router.get('/status/:projectId', gitController.getStatus);

module.exports = router;