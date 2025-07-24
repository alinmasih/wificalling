const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post('/send-call', async (req, res) => {
  const { token, from } = req.body;

  if (!token || !from) {
    return res.status(400).send('Missing fields');
  }

  const message = {
    token,
    notification: {
      title: `Incoming call from ${from}`,
      body: 'Tap to answer',
    },
    data: {
      type: 'call',
      caller: from,
    },
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  };

  try {
    await admin.messaging().send(message);
    res.status(200).send('Call sent');
  } catch (e) {
    console.error(e);
    res.status(500).send('Failed to send call');
  }
});

app.listen(3000, () => {
  console.log('✅ Server running on port 3000');
});
