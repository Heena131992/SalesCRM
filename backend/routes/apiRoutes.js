import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Deal from '../models/Deal.js';
import Activity from '../models/Activity.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// 0. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'salespulse_secret',
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      token,
      user: { ...userObj, id: user._id.toString() },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. GET FULL STATE
router.get('/state', async (req, res) => {
  try {
    const [users, deals, activities, expenses] = await Promise.all([
      User.find().select('-password'),
      Deal.find().sort({ createdAt: -1 }),
      Activity.find().sort({ createdAt: -1 }),
      Expense.find().sort({ createdAt: -1 }),
    ]);

    res.json({
      users: users.map((u) => ({ ...u.toObject(), id: u._id.toString() })),
      deals: deals.map((d) => ({ ...d.toObject(), id: d._id.toString() })),
      activities: activities.map((a) => ({ ...a.toObject(), id: a._id.toString() })),
      expenses: expenses.map((e) => ({ ...e.toObject(), id: e._id.toString() })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. USERS & STAFF ROUTES
router.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password || 'Welcome@123', 10);
    const email =
      req.body.email ||
      `${req.body.name.toLowerCase().replace(/\s+/g, '.')}@salespulse.in`;

    const user = await User.create({
      ...req.body,
      email,
      password: hashedPassword,
    });
    const obj = user.toObject();
    delete obj.password;
    res.status(201).json({ ...obj, id: user._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/users/:id/checkin', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/users/:id/quota', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { quota: req.body.quota },
      { new: true }
    ).select('-password');
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. DEALS ROUTES
router.post('/deals', async (req, res) => {
  try {
    const deal = await Deal.create(req.body);
    res.status(201).json({ ...deal.toObject(), id: deal._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/deals/:id', async (req, res) => {
  try {
    const updated = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/deals/:id', async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. ACTIVITIES ROUTES
router.post('/activities', async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json({ ...activity.toObject(), id: activity._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. EXPENSES ROUTES
router.post('/expenses', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ ...expense.toObject(), id: expense._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;