// home.js — untuk deploy ke Vercel (TANPA app.listen)

import pool from '../src/config/db.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes.js';
import userRoutes from '../src/routes/userRoutes.js';
import transactionRoutes from '../src/routes/transactionRoutes.js';
import dashboardRoutes from '../src/routes/dashboardRoutes.js';
import statsRoutes from '../src/routes/statsRoutes.js';
import badgeRoutes from '../src/routes/badgeRoutes.js';
import mainRoutes from '../src/routes/mainRoutes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

dotenv.config();

const app = express();

// middleware
app.use((req, res, next) => {
  const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    red: "\x1b[31m",
  };
  let color;
  switch (req.method) {
    case "GET": color = colors.green; break;
    case "POST": color = colors.yellow; break;
    case "PUT":
    case "PATCH": color = colors.magenta; break;
    case "DELETE": color = colors.red; break;
    default: color = colors.cyan;
  }
  console.log(`${color}📢 [${new Date().toLocaleString()}] ${req.method} → ${req.originalUrl}${colors.reset}`);
  next();
});

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/main", mainRoutes);

// testing route
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

// error handler
app.use(errorHandler);


export default app;
