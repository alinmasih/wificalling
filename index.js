// Load environment variables (needed for local development)
require('dotenv').config();

const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Parse Firebase service account key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Endpoint to send a test call notification
app.post('/send-notification', async (req, res) => {
  const { token, title, body, data } = req.body;

  const message = {
    token: token,
    notification: {
      title: title || 'Incoming Call',
      body: body || 'Someone is calling you!',
    },
    data: data || {
      callType: 'voice',
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'calls',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.status(200).json({ success: true, id: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Home route
app.get('/', (req, res) => {
  res.send('Firebase Push Notification Server is Running ✅');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
