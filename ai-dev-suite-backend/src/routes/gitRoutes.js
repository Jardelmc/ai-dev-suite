const express = require('express');
const gitController = require('../controllers/gitController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { 
    gitCommitSchema, 
    gitRevertSchema, 
    createBranchSchema, 
    mergeBranchSchema, 
    setReferenceBranchSchema, 
    initRepoSchema,
    remoteSchema,
    removeRemoteSchema,
    pushPullSchema,
    cloneRepoSchema
} = require('../validators/gitValidator');
const router = express.Router();

router.post('/commit', validationMiddleware(gitCommitSchema), gitController.commitChanges);
router.post('/revert', validationMiddleware(gitRevertSchema), gitController.revertChanges);
router.post('/init', validationMiddleware(initRepoSchema), gitController.initRepository);
router.get('/status/:projectId', gitController.getStatus);
router.get('/remote-status/:projectId', gitController.getRemoteStatus);
router.post('/branch', validationMiddleware(createBranchSchema), gitController.createBranch);
router.post('/branch/merge', validationMiddleware(mergeBranchSchema), gitController.mergeBranch);

router.get('/reference-branch/:projectId', gitController.getProjectReferenceBranch);
router.post('/reference-branch', validationMiddleware(setReferenceBranchSchema), gitController.setProjectReferenceBranch);

router.get('/remotes/:projectId', gitController.getRemotes);
router.post('/remotes', validationMiddleware(remoteSchema), gitController.addRemote);
router.delete('/remotes', validationMiddleware(removeRemoteSchema), gitController.removeRemote);

router.post('/push', validationMiddleware(pushPullSchema), gitController.push);
router.post('/pull', validationMiddleware(pushPullSchema), gitController.pull);
router.post('/clone', validationMiddleware(cloneRepoSchema), gitController.cloneRepository);

module.exports = router;