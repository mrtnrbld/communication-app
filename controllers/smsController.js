const smsModel = require('../models/SMS');

module.exports = {
    // Render the Send SMS page and Inbox page
    renderSMSPage: async (req, res) => {
        try {
            // Wait for messages to be fetched from Twilio API
            const messages = [];
            messages = await smsModel.fetchMessages(); // Fetch messages
            console.log(messages)
            res.render('sms', { 
                title: 'SMS Page', 
                messages: messages, // Pass fetched messages to the view
                success: req.query.success || null, // Success message if applicable
                error: req.query.error || null // Error message if applicable
            });
        } catch (error) {
            // Handle errors gracefully and display the error message on the page
            res.render('sms', { 
                title: 'SMS Page', 
                messages: [], // If error occurs, pass an empty array for messages
                success: null,
                error: error.message // Show the error in the view
            });
        }
    },

    // Send SMS
    sendSMS: async (req, res) => {
        const { to, message } = req.body;
        try {
            // Wait for the SMS to be sent
            await smsModel.sendSMS(to, message);
            res.redirect('/sms?success=1'); // Redirect with success query parameter
        } catch (error) {
            // Redirect with error message if something goes wrong
            res.redirect(`/sms?error=${encodeURIComponent(error.message)}`); 
        }
    },
};
