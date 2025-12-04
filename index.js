import pool from './src/config/db.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import statsRoutes from './src/routes/statsRoutes.js';
import badgeRoutes from './src/routes/badgeRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/badges', badgeRoutes);

// error handler
app.use(errorHandler);

app.get("/", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users ORDER BY id ASC");
    const transactions = await pool.query("SELECT * FROM transactions ORDER BY id ASC");
    const badges = await pool.query("SELECT * FROM badges ORDER BY id ASC");

    res.json({
      message: "MoneyTracker API is running...",
      users: users.rows,
      transactions: transactions.rows,
      badges: badges.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`http://localhost:${process.env.PORT}`);
  console.log("JWT_SECRET digunakan:", process.env.JWT_SECRET);
});
