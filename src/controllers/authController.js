import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { findUserByEmail, createUser } from '../models/userModel.js';
dotenv.config();

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validatePassword = (pw) => pw && pw.length >= 6;

export const register = async (req, res) => {
  const { username, phone_number, email, password } = req.body;
  if (!username || !phone_number || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ username, phone_number, email, password: hashedPassword});
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, phone_number: user.phone_number, email: user.email } });
  } catch (error) {
    console.error("Register error:", error);  // LIHAT DI SINI, bukan error.message
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) 
    return res.status(400).json({ message: 'Please provide email and password' });
  try {
    const user = await findUserByEmail(email);
    if (!user) 
      return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email} });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};