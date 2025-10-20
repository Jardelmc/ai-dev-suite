const express = require('express');
const ignoreController = require('../controllers/ignoreController');

const router = express.Router();

router.get('/', ignoreController.listIgnores);
router.get('/project/:projectId', ignoreController.getIgnoresForProject);
router.post('/', ignoreController.createIgnore);
router.delete('/:id', ignoreController.deleteIgnore);

module.exports = router;