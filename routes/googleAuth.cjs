const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');
const crypto = require('crypto');

const router = express.Router();

router.post('/google/signin', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // ✅ Validate required env vars
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('[Google Auth] ❌ Missing GOOGLE_CLIENT_ID');
      return res.status(500).json({ error: 'Missing GOOGLE_CLIENT_ID env var' });
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      console.error('[Google Auth] ❌ Missing GOOGLE_CLIENT_SECRET');
      return res.status(500).json({ error: 'Missing GOOGLE_CLIENT_SECRET env var' });
    }
    if (!process.env.GOOGLE_REDIRECT_URI) {
      console.error('[Google Auth] ❌ Missing GOOGLE_REDIRECT_URI');
      return res.status(500).json({ error: 'Missing GOOGLE_REDIRECT_URI env var' });
    }
    if (!process.env.JWT_SECRET) {
      console.error('[Google Auth] ❌ Missing JWT_SECRET');
      return res.status(500).json({ error: 'Missing JWT_SECRET env var' });
    }
    if (!process.env.MONGO_URI) {
      console.error('[Google Auth] ❌ Missing MONGO_URI');
      return res.status(500).json({ error: 'Missing MONGO_URI env var' });
    }

    console.log('[Google Auth] ✅ All env vars present');

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googleUser = ticket.getPayload();
    const { email, name, picture, sub: googleId } = googleUser;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: crypto.randomBytes(32).toString('hex'),
        profileImage: picture || '',
        googleId,
        role: 'user',
      });
      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.profileImage = picture || user.profileImage;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('[Google Auth Error]', error.message);
    console.error('[Google Auth Error - Full Stack]', error.stack);
    
    // Return specific error message
    const errorMessage = error.message || 'Google authentication failed';
    return res.status(500).json({
      error: 'Google authentication failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

module.exports = router;
