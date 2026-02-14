import express from 'express';
import {
    getTeams,
    getTeamById,
    createTeam,
    joinRequest,
    cancelJoinRequest,
    acceptJoinRequest,
    refuseJoinRequest,
    leaveTeam,
    kickMember,
    validateTeam,
    updateTeam,
    deleteTeam
} from '../controllers/teamController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public (with optional auth for filtering)
router.get('/', verifyToken, getTeams);
router.get('/:teamId', verifyToken, getTeamById);

// Protected routes
router.post('/', verifyToken, createTeam);
router.post('/:teamId/join-request', verifyToken, joinRequest);
router.post('/:teamId/cancel-request', verifyToken, cancelJoinRequest);
router.post('/:teamId/accept', verifyToken, acceptJoinRequest);
router.post('/:teamId/refuse', verifyToken, refuseJoinRequest);
router.post('/:teamId/leave', verifyToken, leaveTeam);
router.post('/:teamId/kick', verifyToken, kickMember);
router.post('/:teamId/validate', verifyToken, validateTeam);
router.put('/:teamId', verifyToken, updateTeam);
router.delete('/:teamId', verifyToken, deleteTeam);

export default router;
