require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const updates = [
  { id: 'prod-3d-4', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80' },
  { id: 'prod-3d-5', image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80' },
  { id: 'prod-3d-6', image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80' },
  { id: 'prod-3d-7', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80' },
  { id: 'prod-3d-8', image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80' }
];

async function run() {
  try {
    try {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (e) {}
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    for (const u of updates) {
      await Product.updateOne({ id: u.id }, { $set: { image: u.image } });
      console.log(`Updated ${u.id}`);
    }
    console.log('Database image update completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
}

run();
