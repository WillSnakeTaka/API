const express = require('express');
const mongoose = require('mongoose');
const Meow = require('../models/Meow');
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
    const filter = {};

    if (req.query.catId && mongoose.Types.ObjectId.isValid(req.query.catId)) {
      filter.catId = req.query.catId;
    }

    const [items, total] = await Promise.all([
      Meow.find(filter).sort(sort).skip(skip).limit(limit).populate('catId', 'name'),
      Meow.countDocuments(filter),
    ]);

    res.json({ page, limit, total, items });
  } catch (error) {
    next(error);
  }
});

router.get('/search/by-cat-name', async (req, res, next) => {
  try {
    const name = (req.query.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Query parameter "name" is required' });
    }

    const cats = await Cat.find({ name: new RegExp(name, 'i') }).select('_id');
    const catIds = cats.map((cat) => cat._id);

    const meows = await Meow.find({ catId: { $in: catIds } })
      .sort({ createdAt: -1 })
      .populate('catId', 'name');

    return res.json({ total: meows.length, items: meows });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meow id' });
    }
    const meow = await Meow.findById(req.params.id).populate('catId', 'name');
    if (!meow) {
      return res.status(404).json({ message: 'Meow not found' });
    }
    return res.json(meow);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.catId)) {
      return res.status(400).json({ message: 'Valid catId is required' });
    }
    const catExists = await Cat.exists({ _id: req.body.catId });
    if (!catExists) {
      return res.status(400).json({ message: 'catId must reference an existing Cat' });
    }

    const meow = await Meow.create(req.body);
    res.status(201).json(meow);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meow id' });
    }

    if (req.body.catId) {
      if (!mongoose.Types.ObjectId.isValid(req.body.catId)) {
        return res.status(400).json({ message: 'Valid catId is required' });
      }
      const catExists = await Cat.exists({ _id: req.body.catId });
      if (!catExists) {
        return res.status(400).json({ message: 'catId must reference an existing Cat' });
      }
    }

    const meow = await Meow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!meow) {
      return res.status(404).json({ message: 'Meow not found' });
    }
    return res.json(meow);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meow id' });
    }
    const deleted = await Meow.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Meow not found' });
    }
    return res.json({ message: 'Meow removed' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
