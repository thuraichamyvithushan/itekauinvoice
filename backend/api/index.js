import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://itekauinvoice.vercel.app/', process.env.FRONTEND_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

let isConnected = false;

app.get('/', (req, res) => {
  res.status(200).send('Backend server is running');
});

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Backend server is running',
    status: 'ok',
    database: isConnected ? 'connected' : 'connecting'
  });
});

async function connectDB() {
  if (isConnected) return;
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

const requireDatabaseConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

import authRoutes from '../routes/authRoutes.js';
import invoiceRoutes from '../routes/invoiceRoutes.js';
import clientRoutes from '../routes/clientRoutes.js';

app.use('/api/auth', requireDatabaseConnection, authRoutes);
app.use('/api/invoices', requireDatabaseConnection, invoiceRoutes);
app.use('/api/clients', requireDatabaseConnection, clientRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Path not found on Express: ${req.path}`,
    suggestion: "Check your routes and method (POST/GET)"
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

export default serverless(app);
