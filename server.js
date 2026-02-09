const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const catsRouter = require('./routes/cats');
const meowsRouter = require('./routes/meows');
const purrsRouter = require('./routes/purrs');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whiskerbook';

// Middleware runs on every request before route handlers.
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/cats', catsRouter);
app.use('/meows', meowsRouter);
app.use('/purrs', purrsRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'whiskerbook-api' });
});

app.post('/debug/invalid-meow', async (_req, res, next) => {
  try {
    const Meow = require('./models/Meow');
    await Meow.create({ text: '' });
    res.status(201).json({ message: 'Unexpectedly created invalid meow.' });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    error: err.name || 'Error',
  });
});

async function applyMongoValidators(connection) {
  const db = connection.db;

  await db.command({
    collMod: 'cats',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name'],
        properties: {
          name: {
            bsonType: 'string',
            minLength: 1,
            description: 'Cat name is required and must be non-empty.',
          },
        },
      },
    },
    validationLevel: 'strict',
    validationAction: 'error',
  }).catch(async (error) => {
    if (error.codeName === 'NamespaceNotFound') {
      await db.createCollection('cats', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name'],
            properties: {
              name: { bsonType: 'string', minLength: 1 },
            },
          },
        },
      });
      return;
    }
    throw error;
  });

  await db.command({
    collMod: 'meows',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['catId', 'text'],
        properties: {
          catId: { bsonType: 'objectId' },
          text: { bsonType: 'string', minLength: 1 },
        },
      },
    },
    validationLevel: 'strict',
    validationAction: 'error',
  }).catch(async (error) => {
    if (error.codeName === 'NamespaceNotFound') {
      await db.createCollection('meows', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['catId', 'text'],
            properties: {
              catId: { bsonType: 'objectId' },
              text: { bsonType: 'string', minLength: 1 },
            },
          },
        },
      });
      return;
    }
    throw error;
  });

  await db.command({
    collMod: 'purrs',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['meowId'],
        properties: {
          meowId: { bsonType: 'objectId' },
        },
      },
    },
    validationLevel: 'strict',
    validationAction: 'error',
  }).catch(async (error) => {
    if (error.codeName === 'NamespaceNotFound') {
      await db.createCollection('purrs', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['meowId'],
            properties: {
              meowId: { bsonType: 'objectId' },
            },
          },
        },
      });
      return;
    }
    throw error;
  });
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    await applyMongoValidators(mongoose.connection);
    console.log('MongoDB validators applied');

    app.listen(PORT, () => {
      console.log(`WhiskerBook API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

start();
