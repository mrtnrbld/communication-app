const User = require('../models/User');

class AuthController {
    static login(req, res) {
        res.render('login', { error: null });
    }

    static handleLogin(req, res) {
        const { username, password } = req.body;
        const user = User.findByCredentials(username, password);
        
        if (user) {
            req.session.user = username;
            res.cookie('username', req.session.user, { httpOnly: false, sameSite: 'strict' }); // httpOnly prevents client-side JS access
            res.redirect('/chat');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    }

    static logout(req, res) {
        req.session.destroy();
        res.redirect('/login');
    }
}

module.exports = AuthController;