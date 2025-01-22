const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

class Email {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASS
            }
        });

        this.imapConfig = {
            user: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        };
    }

    async getEmails(user) {
        return new Promise((resolve, reject) => {
            const imap = new Imap(this.imapConfig);
            const emails = [];
    
            imap.once('ready', () => {
                imap.openBox('INBOX', false, (err, box) => {
                    if (err) reject(err);
                    
                    const today = new Date();
                    const searchCriteria = [['SINCE', today]]; // Modify criteria if needed (e.g., ['UNSEEN'])
                    const fetchOptions = {
                        bodies: '', // Fetch the entire email
                        struct: true, // Fetch email structure for attachments
                    };
    
                    imap.search(searchCriteria, (err, results) => {
                        if (err) return reject(err);
    
                        if (!results || results.length === 0) {
                            imap.end();
                            return resolve([]); // No emails found
                        }
    
                        const fetch = imap.fetch(results, fetchOptions);
    
                        fetch.on('message', (msg, seqno) => {
                            const email = {};
    
                            msg.on('body', (stream, info) => {
                                simpleParser(stream, (err, parsed) => {
                                    if (err) {
                                        console.error('Error parsing email:', err);
                                        return;
                                    }
    
                                    email.headers = {
                                        from: parsed.from ? parsed.from.text : 'Unknown Sender',
                                        to: parsed.to ? parsed.to.text : 'Unknown Recipient',
                                        subject: parsed.subject || 'No Subject',
                                        date: parsed.date ? parsed.date.toISOString() : 'Unknown Date',
                                    };
    
                                    email.text = parsed.text || null;
                                    email.html = parsed.html || null;
    
                                    // Process attachments
                                    email.attachments = (parsed.attachments || []).map((attachment) => ({
                                        filename: attachment.filename || 'Unnamed Attachment',
                                        contentType: attachment.contentType || 'application/octet-stream',
                                        size: attachment.size || 0,
                                        content: attachment.content.toString('base64'), // Convert to Base64 for storage
                                    }));

                                    // Push email only after parsing is done
                                    emails.push(email);
                                });
                            });
    
                            msg.once('end', () => {
                                // No need to do anything here as the email is already added
                            });
                        });
    
                        fetch.once('error', (err) => {
                            console.error('Fetch error:', err);
                            reject(err);
                        });
    
                        fetch.once('end', () => {
                            imap.end();
                            resolve(emails); // Resolve the emails array when done fetching
                        });
                    });
                });
            });
    
            imap.once('error', (err) => {
                console.error('IMAP connection error:', err);
                reject(err);
            });
    
            imap.connect();
        });
    }
    
    

    async sendEmail(from, to, subject, text, attachments = []) {
        try {
            const mailOptions = {
                from,
                to,
                subject,
                text,
                attachments
            };

            const result = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = new Email();