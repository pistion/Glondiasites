import express from 'express';
import WorkspaceController from '../controllers/workspace.controller.js';

const router = express.Router();

router.get('/', WorkspaceController.listWorkspaces);
router.post('/', WorkspaceController.createWorkspace);
router.get('/:workspaceId', WorkspaceController.getWorkspace);
router.patch('/:workspaceId', WorkspaceController.updateWorkspace);
router.delete('/:workspaceId', WorkspaceController.deleteWorkspace);

export default router;
