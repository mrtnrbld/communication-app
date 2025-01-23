const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const AuthController = require('../controllers/authController');
const ChatController = require('../controllers/chatController');
const EmailController = require('../controllers/emailController');
const SmsController = require('../controllers/smsController');
const VoiceController = require('../controllers/voiceController')
require('dotenv').config();

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
//router.post('/voice/call-handler', requireAuth, VoiceController.handleCall);


const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

router.post('/token', (req, res) => {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid:'AP137fac9eacaaaf610a408e24fde12c34',
        incomingAllow: true
    });

    const token = new AccessToken(process.env.TWILIO_ACCOUNT_SID,"SK8beefe8f6b8b369ac5cc27f65b4383c3", "6UkoVFXk4v9IAND5Q86CBpQAj3xjrrI5",{identity: 'user'});
    token.addGrant(voiceGrant);
    token.identity = 'user';
    res.send({
        token: token.toJwt()
    });
});

router.post('/voice/incoming', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    //twiml.say('Hello, you have reached the communication app!');
    twiml.say('You have an incoming call.');
    twiml.dial().client('user');
    res.type('text/xml');
    res.send(twiml.toString());
});

router.post('/sms/messages', (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const message = req.body.Body;
    const from = req.body.From;
    console.log(req.body)

    console.log(`Received message from ${from}: ${message}`);

    twiml.message('Thank you for your message!');

    res.type('text/xml');
    res.send(twiml.toString());
});

let messages = [];

router.get('/sms/messages', (req, res) => {
    // This is just a placeholder. You can store the messages in a database and fetch them here.
    res.json({ messages });
});

module.exports = router;