const twilioModel = require('../models/Twilio');


module.exports = {
    makeCall: async (req, res) => {
        console.log('Request Body:', req.body); // Log the request body to check its content
        const { number } = req.body;

        console.log(number)
        if (!number) {
          console.log('Number is missing');
          return res.status(400).json({ error: 'Phone number is required.' });
        }
    
        try {
          await twilioModel.makeCall(number);
          res.status(200).json({ message: 'Call initiated successfully.' });
        } catch (error) {
          console.error('Error in makeCall:', error);
          res.status(500).json({ error: 'Failed to initiate call.' });
        }
      },
    handleCall: async(req,res) => {
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say('Hello! This is a demo test call for the assessment.', { voice: 'alice' });
        res.type('text/xml');
        res.send(twiml.toString());
    }
}