import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import invoiceRoutes from '../routes/invoiceRoutes.js';

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
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://itekauinvoice.vercel.app', process.env.FRONTEND_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

let isConnected = false;
let connectionPromise = null;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 20000,
    maxPoolSize: 10,
    family: 4,
    bufferCommands: false
  }).then(() => {
    isConnected = true;
    console.log('MongoDB connected successfully for invoices');
  }).catch((error) => {
    connectionPromise = null;
    isConnected = false;
    throw error;
  });

  await Promise.race([
    connectionPromise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('MongoDB connection timed out')), 7000);
    })
  ]);
}

app.use(async (req, res, next) => {
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
});

app.use('/api/invoices', invoiceRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Path not found on Express: ${req.path}`,
    suggestion: 'Check your invoice route and method (POST/GET/PUT/DELETE)'
  });
});

export default serverless(app);
