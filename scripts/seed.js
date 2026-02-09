const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Cat = require('../models/Cat');
const Meow = require('../models/Meow');
const Purr = require('../models/Purr');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whiskerbook';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected for seeding');

  await Promise.all([Cat.deleteMany({}), Meow.deleteMany({}), Purr.deleteMany({})]);

  const catsPath = path.join(__dirname, '..', 'data', 'cats.seed.json');
  const cats = JSON.parse(fs.readFileSync(catsPath, 'utf8'));
  const insertedCats = await Cat.insertMany(cats);

  const meowDocs = [];
  for (let i = 0; i < insertedCats.length; i += 1) {
    meowDocs.push({
      catId: insertedCats[i]._id,
      text: `Meow post #${i + 1} from ${insertedCats[i].name}`,
      mood: ['happy', 'sleepy', 'playful', 'hungry', 'grumpy'][i % 5],
    });
  }

  const insertedMeows = await Meow.insertMany(meowDocs);

  const purrDocs = insertedMeows.slice(0, 8).map((meow, index) => ({
    meowId: meow._id,
    intensity: (index % 10) + 1,
    durationSeconds: 5 + index,
  }));

  await Purr.insertMany(purrDocs);

  console.log(`Seed complete: ${insertedCats.length} cats, ${insertedMeows.length} meows, ${purrDocs.length} purrs`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
