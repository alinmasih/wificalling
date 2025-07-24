const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Parse the JSON from environment variable (FIREBASE_CONFIG must be stringified JSON)
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Health check route
app.get('/', (req, res) => {
  res.send('🔥 Firebase Admin SDK is working securely on Render');
});

// ✅ Route to trigger call push notification
app.post('/send-call', async (req, res) => {
  const { token, from } = req.body;

  if (!token || !from) {
    return res.status(400).json({ success: false, error: 'Missing "token" or "from"' });
  }

  const message = {
    token,
    data: {
      type: 'call',
      from,
    },
    notification: {
      title: '📞 Incoming Call',
      body: `Call from ${from}`,
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Push sent:', response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('❌ Failed to send FCM:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
