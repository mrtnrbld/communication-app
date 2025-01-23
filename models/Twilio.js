const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Add your Account SID here
const authToken = process.env.TWILIO_AUTH_TOKEN; // Add your Auth Token here
const client = new twilio(accountSid, authToken);

async function sendSMS(to, message) {
    try {
        const response = await client.messages.create({
            body: message, // Message content
            from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
            to: to, // Recipient's number
        });
        console.log('Message sent:', response.sid);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

async function makeCall(number) {
    try {
        const call = await client.calls.create({
            url: 'http://demo.twilio.com/docs/voice.xml', // Replace with your webhook URL
            to: number,
            from: process.env.TWILIO_PHONE_NUMBER,
        });
        console.log('Call initiated:', call.sid);
        console.log(call.sid)
        return call; // Return the call object
    } catch (error) {
        console.error('Error initiating call:', error);
        throw new Error(`Failed to initiate call: ${error.message}`);
    }
}

module.exports = { sendSMS, makeCall };
