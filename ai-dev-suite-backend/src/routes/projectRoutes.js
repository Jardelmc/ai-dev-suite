const express = require('express');
const projectsController = require('../controllers/projectsController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { projectSchema, updateProjectSchema } = require('../validators/projectValidator');

const router = express.Router();

router.get('/', projectsController.listProjects);
router.get('/:id', projectsController.getProject);
router.get('/:id/children', projectsController.getProjectChildren);
router.post('/', validationMiddleware(projectSchema), projectsController.createProject);
router.put('/:id', validationMiddleware(updateProjectSchema), projectsController.updateProject);
router.delete('/:id', projectsController.deleteProject);

module.exports = router;