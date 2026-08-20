require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Configuration
const PORT = process.env.PORT || 8080;
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';

// Health check
app.get('/', (req, res) => {
    res.send('OAuth Server is running. <a href="/auth">Login with GitHub</a>');
});

// Step 1: Redirect to GitHub
app.get('/auth', (req, res) => {
    if (!CLIENT_ID) {
        return res.status(500).send('Configuration Error: OAUTH_CLIENT_ID not set.');
    }
    const redirectParams = new URLSearchParams({
        client_id: CLIENT_ID,
        scope: 'repo user', // Access to repository and user info
    });
    res.redirect(`${AUTHORIZATION_URL}?${redirectParams.toString()}`);
});

// Step 2: Callback from GitHub
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Error: No code received from GitHub.');
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        return res.status(500).send('Configuration Error: OAUTH credentials not set.');
    }

    try {
        // Exchange code for token
        const response = await axios.post(
            TOKEN_URL,
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
            },
            {
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        const { access_token, error } = response.data;

        if (error) {
            return res.status(400).send(`GitHub Error: ${JSON.stringify(response.data)}`);
        }

        // Success! Return the token to Decap CMS via postMessage
        // The CMS opens this window, so we send the message back to the opener.
        const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            // Verify origin if needed, but for now we accept connections
             // send message to main window with the app
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({
            token: access_token,
            provider: 'github'
        })}', 
              '*'
            );
          }
          receiveMessage();
          window.close(); // Close the popup
        })()
      </script>
    `;

        res.send(script);

    } catch (err) {
        console.error('Callback Error:', err.message);
        res.status(500).send('Authentication successful but failed to exchange token. Check server logs.');
    }
});

app.listen(PORT, () => {
    console.log(`OAuth Server running on port ${PORT}`);
});
