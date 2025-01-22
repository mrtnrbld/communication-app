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
                    const searchCriteria = [['SINCE', today], 'UNSEEN']; // Combine UNSEEN and SINCE

                    imap.seq.search(searchCriteria, (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        if (results.length === 0) { // Handle case where no unread emails are found
                            imap.end();
                            return resolve([]);
                        }

                        const fetch = imap.seq.fetch(results, { // Fetch the found emails
                            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
                            struct: true
                        });

                        fetch.on('message', (msg, seqno) => {
                            console.log("getting email");
                            const email = {};

                            msg.on('body', (stream, info) => {
                                if (info.which === 'TEXT') {
                                    simpleParser(stream, (err, parsed) => {
                                        if (err) return;
                                        email.text = parsed.text;
                                    });
                                } else {
                                    stream.on('data', (chunk) => {
                                        email.headers = Imap.parseHeader(chunk.toString('utf8'));
                                    });
                                }
                            });

                            msg.once('attributes', (attrs) => {
                                email.attributes = attrs;
                            });

                            msg.once('end', () => {
                                emails.push(email);
                            });
                        });

                        fetch.once('error', (err) => {
                            reject(err);
                        });

                        fetch.once('end', () => {
                            imap.end();
                            resolve(emails);
                        });
                    });
                });
            });

            imap.once('error', (err) => {
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