const express = require('express');
const mongoose = require('mongoose');
const Purr = require('../models/Purr');
const Meow = require('../models/Meow');

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
      Purr.find().sort(sort).skip(skip).limit(limit).populate('meowId'),
      Purr.countDocuments(),
    ]);

    res.json({ page, limit, total, items });
  } catch (error) {
    next(error);
  }
});

router.get('/by-meow/:meowId', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.meowId)) {
      return res.status(400).json({ message: 'Invalid meow id' });
    }

    const purrs = await Purr.find({ meowId: req.params.meowId }).sort({ createdAt: -1 });
    return res.json({ total: purrs.length, items: purrs });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid purr id' });
    }
    const purr = await Purr.findById(req.params.id).populate('meowId');
    if (!purr) {
      return res.status(404).json({ message: 'Purr not found' });
    }
    return res.json(purr);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.meowId)) {
      return res.status(400).json({ message: 'Valid meowId is required' });
    }
    const meowExists = await Meow.exists({ _id: req.body.meowId });
    if (!meowExists) {
      return res.status(400).json({ message: 'meowId must reference an existing Meow' });
    }
    const purr = await Purr.create(req.body);
    return res.status(201).json(purr);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid purr id' });
    }

    if (req.body.meowId) {
      if (!mongoose.Types.ObjectId.isValid(req.body.meowId)) {
        return res.status(400).json({ message: 'Valid meowId is required' });
      }
      const meowExists = await Meow.exists({ _id: req.body.meowId });
      if (!meowExists) {
        return res.status(400).json({ message: 'meowId must reference an existing Meow' });
      }
    }

    const purr = await Purr.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!purr) {
      return res.status(404).json({ message: 'Purr not found' });
    }

    return res.json(purr);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid purr id' });
    }
    const deleted = await Purr.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Purr not found' });
    }
    return res.json({ message: 'Purr removed' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
