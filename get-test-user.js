// Get a test user ID
const mongoose = require('mongoose');
const User = require('./backend/models/User.cjs');

require('dotenv').config();

async function getTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://NewOTT:NewOTT123@climaxott.dg3tg.mongodb.net/climax?retryWrites=true&w=majority');
    
    const users = await User.find().limit(1);
    if (users.length > 0) {
      console.log('✅ Found test user:');
      console.log('ID:', users[0]._id);
      console.log('Email:', users[0].email);
      console.log('Name:', users[0].name);
    } else {
      console.log('❌ No users found in database');
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

getTestUser();
