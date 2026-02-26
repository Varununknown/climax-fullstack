// Check content prices
const mongoose = require('mongoose');
const Content = require('./backend/models/Content.cjs');

require('dotenv').config();

async function checkContent() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://NewOTT:NewOTT123@climaxott.dg3tg.mongodb.net/climax?retryWrites=true&w=majority';
    await mongoose.connect(uri);
    
    const contents = await Content.find({}, 'title premiumPrice');
    console.log('\n📺 Content Prices:\n');
    contents.forEach((c, i) => {
      console.log(`[${i + 1}] ${c.title}`);
      console.log(`    Premium Price: ₹${c.premiumPrice}\n`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkContent();
