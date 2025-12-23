// server/src/routes/index.js
const express = require('express');
const router = express.Router();

// Route modules
const authRoutes = require('./authRoutes');
const applicantRoutes = require('./applicantRoutes');
const employerRoutes = require('./employerRoutes');
const jobRoutes = require('./jobRoutes');
const messageRoutes = require('./messageRoutes');
const chatRoutes = require('./chatRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/applicants', applicantRoutes);
router.use('/employers', employerRoutes);
router.use('/jobs', jobRoutes);
router.use('/messages', messageRoutes);
router.use('/chats', chatRoutes);

module.exports = router;
