const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');

/* ----------  REGISTER  ---------- */
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  console.log('▶️ Register attempt:', { name, email, phone, role });

  try {
    const existingUser = await User.findOne({ 
      $or: [{ email }, ...(phone ? [{ phone }] : [])]
    });
    if (existingUser) {
      console.log('⛔ User already exists:', email || phone);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Enforce only this email can be admin
    let finalRole = 'user';
    if (role === 'admin' && email === 'admin@example.com') {
      finalRole = 'admin';
    }

    console.log('✅ Final role to assign:', finalRole);

    const newUser = new User({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: finalRole
    });

    await newUser.save();

    console.log('✅ User created:', email, 'Role:', finalRole);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ----------  LOGIN  ---------- */
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone

  try {
    // ✅ Support both email and phone login
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });
    console.log('👤 User from DB:', user ? `Found ${user.email || user.phone}` : 'Not found');
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----------  GET CURRENT USER  ---------- */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        premium: user.premium,
        googleId: user.googleId,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error('❌ Error in /me endpoint:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
