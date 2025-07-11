const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for ALL origins explicitly
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// ✅ Parse JSON bodies
app.use(bodyParser.json());

// === REGISTER ROUTE ===
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const usersPath = path.join(__dirname, "users.json");
  let users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }

  users.push({ id: uuidv4(), email, password });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json({ success: true, message: "Registration successful" });
});

// === LOGIN ROUTE ===
app.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  const usersPath = path.join(__dirname, "users.json");
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];

  const user = users.find(u => u.email === identifier && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  res.json({ success: true, message: "Login successful", email: user.email });
});

// === GET FARMERS ===
app.get("/farmers", (req, res) => {
  const usersPath = path.join(__dirname, "users.json");
  const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
  res.json(users);
});

// === PROGRAM REGISTRATION ===
app.post("/register-program", (req, res) => {
  const { name, email, program, notes } = req.body;

  if (!name || !email || !program) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const programsPath = path.join(__dirname, "programs.json");
  const programs = fs.existsSync(programsPath) ? JSON.parse(fs.readFileSync(programsPath)) : [];

  programs.push({ name, email, program, notes, registeredAt: new Date().toISOString() });
  fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2));

  res.json({ success: true, message: "Program registration submitted successfully" });
});

// === GET ALL PROGRAMS ===
app.get("/all-programs", (req, res) => {
  const programsPath = path.join(__dirname, "programs.json");
  const programs = fs.existsSync(programsPath) ? JSON.parse(fs.readFileSync(programsPath)) : [];
  res.json(programs);
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(✅ Server running at http://localhost:${PORT});
});