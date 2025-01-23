const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = {
    sendSMS: async (to, message) => {
        try {
            return await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to,
            });
        } catch (error) {
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    },

    fetchMessages: async () => {
        try {
            const messages = await client.messages.list({ limit: 20 });
            console.log(messages)
            return messages;
        } catch (error) {
            throw new Error(`Failed to fetch SMS: ${error.message}`);
        }
    },
};
