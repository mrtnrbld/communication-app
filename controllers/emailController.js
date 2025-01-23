const Email = require('../models/Email');

class EmailController {
    static async showInbox(req, res) {
        try {
            const emails = await Email.getEmails(req.session.user);
            res.render('email', { 
                username: req.session.user,
                emails: emails,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            res.render('email', { 
                username: req.session.user,
                emails: [],
                error: 'Failed to fetch emails'
            });
        }
    }

    static async sendEmail(req, res) {
        const { to, subject, text } = req.body;
        const from = process.env.EMAIL_USER;
        
        const attachments = req.files ? req.files.map(file => ({
            filename: file.originalname,
            path: file.path
        })) : [];

        try {
            await Email.sendEmail(from, to, subject, text, attachments);
            res.json({ success: true, message: 'Email sent successfully!' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getEmails(req, res) {
        try {
            const emails = await Email.getEmails(req.session.user);
            //res.json(emails);
            const formattedEmails = emails.map(email => ({
                id: email.id,
                headers: email.headers,
                text: email.text,  // Plain text content
                html: email.html,  // HTML content
                attachments: email.attachments?.map(attachment => ({
                    id: attachment.id,
                    filename: attachment.filename,
                    size: attachment.size,
                    mimetype: attachment.mimetype
                })) || []
                
            }));
            // emails.map(email =>{
            //     console.log(email.attachments)
            // })
            res.json(emails);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = EmailController;