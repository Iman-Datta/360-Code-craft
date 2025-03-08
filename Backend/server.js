const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "your_secret_key";

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/expenseTracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Expense Schema
const expenseSchema = new mongoose.Schema({
  userId: String,
  title: String,
  amount: Number,
});
const Expense = mongoose.model("Expense", expenseSchema);

// User Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.json({ message: "User registered successfully" });
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// Add Expense
app.post("/expense", async (req, res) => {
  const { userId, title, amount } = req.body;
  const expense = new Expense({ userId, title, amount });
  await expense.save();
  res.json({ message: "Expense added" });
});

// Get Total Expenses
app.get("/expenses/:userId", async (req, res) => {
  const { userId } = req.params;
  const expenses = await Expense.find({ userId });
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  res.json({ expenses, total });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));