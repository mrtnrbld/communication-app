class ChatController {
    static showChat(req, res) {
        res.render('chat', { username: req.session.user });
    }

    static showVoice(req, res) {
        res.render('voice', { username: req.session.user });
    }

    static showEmail(req, res) {
        res.render('email', { username: req.session.user });
    }

    static showSMS(req, res) {
        res.render('sms', { username: req.session.user });
    }
}

module.exports = ChatController;