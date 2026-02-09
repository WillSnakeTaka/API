const express = require('express');
const mongoose = require('mongoose');
const Cat = require('../models/Cat');

const router = express.Router();

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Cat.find().sort(sort).skip(skip).limit(limit),
      Cat.countDocuments(),
    ]);

    res.json({ page, limit, total, items });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid cat id' });
    }
    const cat = await Cat.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ message: 'Cat not found' });
    }
    return res.json(cat);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const cat = await Cat.create(req.body);
    res.status(201).json(cat);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid cat id' });
    }
    const cat = await Cat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cat) {
      return res.status(404).json({ message: 'Cat not found' });
    }
    return res.json(cat);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid cat id' });
    }
    const deleted = await Cat.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Cat not found' });
    }
    return res.json({ message: 'Cat removed' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
