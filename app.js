const express = require('express');
const axios = require('axios');
const session = require('express-session');
const app = express();
const port = 3000;

const DISCORD_CLIENT_ID = '1263677707099574353';
const DISCORD_CLIENT_SECRET = 'nVr5j1hXRnkW8GZ0G-eUSeqOK18iVJcB';
const DISCORD_REDIRECT_URI = 'http://lightwen.com/auth/discord/callback';

// IP and Discord User ID restrictions
const ALLOWED_IP = '75.4.106.63';
const ALLOWED_DISCORD_USER_ID = '140333465596985345';

app.use(session({
    secret: 'a53iaoff93juf0Afj909J9F09h09F09H',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    const user = req.session.user;
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Check if the login button should be shown
    const showLoginButton = clientIp === ALLOWED_IP;

    res.render('index', { user, showLoginButton });
});

app.get('/auth/discord', (req, res) => {
    const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(authorizeUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.send('No code provided');
    }

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: DISCORD_REDIRECT_URI,
            scope: 'identify'
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`
            }
        });

        const user = userResponse.data;

        // Check if the user is the allowed user
        if (user.id !== ALLOWED_DISCORD_USER_ID) {
            return res.send('You are not authorized to log in.');
        }

        req.session.user = user;
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
