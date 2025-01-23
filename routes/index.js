const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const AuthController = require('../controllers/authController');
const ChatController = require('../controllers/chatController');
const EmailController = require('../controllers/emailController');
const SmsController = require('../controllers/smsController');
const VoiceController = require('../controllers/voiceController')

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Max 5 files
    }
});


// Auth routes
router.get('/login', AuthController.login);
router.post('/login', AuthController.handleLogin);
router.get('/logout', AuthController.logout);

// Protected routes
router.get('/chat', requireAuth, ChatController.showChat);
router.get('/voice', requireAuth, ChatController.showVoice);
//router.get('/email', requireAuth, ChatController.showEmail);
router.get('/sms', requireAuth, ChatController.showSMS);

// Add these routes to your existing routes
router.get('/email', requireAuth, EmailController.showInbox);
router.post('/email/send', requireAuth, upload.array('attachments'), EmailController.sendEmail);
router.get('/email/fetch', requireAuth, EmailController.getEmails);

router.get('/email/attachment/:id', async (req, res) => {
    try {
        const attachmentId = req.params.id;

        const attachment = getAttachmentById(attachmentId); // Replace with actual logic to fetch attachment
        if (!attachment) {
            return res.status(404).send('Attachment not found');
        }

        // Decode Base64 data if stored in this format
        const attachmentData = Buffer.from(attachment.data, 'base64');

        res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
        res.setHeader('Content-Type', attachment.mimetype || 'application/octet-stream');
        res.send(attachmentData);
    } catch (error) {
        console.error('Error serving attachment:', error);
        res.status(500).send('Failed to fetch attachment');
    }
});

// SMS routes
router.get('/sms', requireAuth, SmsController.renderSMSPage);
router.post('/sms/send', requireAuth, SmsController.sendSMS);

// Voice routes
router.post('/voice/call', requireAuth, VoiceController.makeCall);
router.post('/voice/call-handler', requireAuth, VoiceController.handleCall);


module.exports = router;