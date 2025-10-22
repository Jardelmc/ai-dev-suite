const express = require('express');
const gitConfigController = require('../controllers/gitConfigController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const {
  setUserConfigSchema,
  setEditorConfigSchema,
  addAliasSchema,
  removeAliasSchema,
} = require('../validators/gitConfigValidator');

const router = express.Router();

router.get('/', gitConfigController.getConfig);
router.post('/user', validationMiddleware(setUserConfigSchema), gitConfigController.setUserConfig);
router.post('/editor', validationMiddleware(setEditorConfigSchema), gitConfigController.setEditorConfig);
router.post('/alias', validationMiddleware(addAliasSchema), gitConfigController.addAlias);
router.delete('/alias/:alias', validationMiddleware(removeAliasSchema), gitConfigController.removeAlias);

module.exports = router;