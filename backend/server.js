import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const seedDefaultUsers = async () => {
  const adminWithEmail = await User.findOne({ email: 'vikram@salespulse.in' });
  if (!adminWithEmail) {
    await User.deleteMany({}); // Purane bina-email wale demo users hatayein
    const hashedPassword = await bcrypt.hash('Welcome@123', 10);
    await User.insertMany([
      {
        name: 'Vikram Singhania',
        email: 'vikram@salespulse.in',
        password: hashedPassword,
        role: 'admin',
        designation: 'VP of Sales & Revenue',
        territory: 'National HQ (Mumbai)',
        quota: 0,
        status: 'Online',
        workMode: 'Office',
      },
      {
        name: 'Aarav Sharma',
        email: 'aarav@salespulse.in',
        password: hashedPassword,
        role: 'staff',
        designation: 'Senior Enterprise AE',
        territory: 'North India (Delhi NCR)',
        quota: 650000,
      },
      {
        name: 'Priya Nair',
        email: 'priya@salespulse.in',
        password: hashedPassword,
        role: 'staff',
        designation: 'Regional Sales Lead',
        territory: 'South India (Bengaluru)',
        quota: 600000,
      },
    ]);
    console.log('Default Admin & Staff seeded with credentials');
  }
};


mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    await seedDefaultUsers();
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Backend Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error('MongoDB Connection Error:', err));