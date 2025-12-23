// messageRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/authMiddleware');

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Apply authentication to all message routes
router.use(requireAuth);

// Text messages
router.post('/', messageController.sendMessage);

// Media messages
router.post('/upload/image', messageController.sendImageMessage);
router.post('/upload/file', messageController.sendFileMessage);
router.post('/upload/audio', audioUpload.single('audio'), messageController.sendAudioMessage);
router.post('/upload/video', messageController.sendVideoMessage);

// Get messages
router.get('/:chatId', messageController.getChatMessages);

// Message actions
router.put('/:messageId/read', messageController.markAsRead);
router.put('/chat/:chatId/read-all', messageController.markChatAsRead);
router.put('/:messageId', messageController.editMessage);
router.delete('/:messageId', messageController.deleteMessage);

// Reactions
router.put('/:messageId/react', messageController.reactToMessage);
router.delete('/:messageId/react', messageController.removeReaction);

// Forward and search
router.post('/:messageId/forward', messageController.forwardMessage);
router.get('/search/:chatId', messageController.searchMessages);

// Unread count
router.get('/unread/count', messageController.getUnreadCount);

module.exports = router;



