// ==========================================
// chatRoutes.js
// ==========================================

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware');

// Apply authentication to all chat routes
router.use(requireAuth);

// Get user's chats
router.get('/', chatController.getUserChats);
router.get('/search', chatController.searchChats);

// Create chats
router.post('/private', chatController.getOrCreatePrivateChat);
router.post('/group', chatController.createGroupChat);

// Single chat operations
router.get('/:chatId', chatController.getChat);
router.put('/:chatId', chatController.updateGroupChat);
router.delete('/:chatId', chatController.deleteChat);

// Group avatar
router.put('/:chatId/avatar', chatController.uploadGroupAvatar);

// Participant management
router.post('/:chatId/participants', chatController.addParticipants);
router.delete('/:chatId/participants/:participantId', chatController.removeParticipant);

// Admin management
router.put('/:chatId/admins/:participantId', chatController.makeAdmin);
router.delete('/:chatId/admins/:participantId', chatController.removeAdmin);

// Chat settings
router.put('/:chatId/mute', chatController.toggleMute);
router.put('/:chatId/archive', chatController.toggleArchive);
router.put('/:chatId/pin', chatController.togglePin);

// Clear history
router.post('/:chatId/clear', chatController.clearChatHistory);

module.exports = router;
