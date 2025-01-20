const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const ChatController = require('../controllers/chatController');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Auth routes
router.get('/login', AuthController.login);
router.post('/login', AuthController.handleLogin);
router.get('/logout', AuthController.logout);

// Protected routes
router.get('/chat', requireAuth, ChatController.showChat);
router.get('/voice', requireAuth, ChatController.showVoice);
router.get('/email', requireAuth, ChatController.showEmail);
router.get('/sms', requireAuth, ChatController.showSMS);

module.exports = router;