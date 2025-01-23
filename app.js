require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const engine = require('ejs-mate');

// Import routes
const routes = require('./routes');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Root route redirect to login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Use routes
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});