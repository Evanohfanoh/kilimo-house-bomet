const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Manual CORS Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://evanohfanoh.github.io'); // Allow your GitHub Pages frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Respond to preflight requests
  }
  next();
});

app.use(bodyParser.json());

// ✅ Register route
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const usersPath = path.join(__dirname, "users.json");
  let users = [];

  if (fs.existsSync(usersPath)) {
    users = JSON.parse(fs.readFileSync(usersPath));
  }

  const alreadyExists = users.find(user => user.email === email);
  if (alreadyExists) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }

  users.push({ id: uuidv4(), email, password });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({ success: true, message: "Registration successful" });
});

// ✅ Login route
app.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const usersPath = path.join(__dirname, "users.json");
  if (!fs.existsSync(usersPath)) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users.find(u => u.email === identifier && u.password === password);

  if (user) {
    res.json({ success: true, message: "Login successful", email: user.email });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Get all farmers (admin only)
app.get("/farmers", (req, res) => {
  const usersPath = path.join(__dirname, "users.json");
  if (!fs.existsSync(usersPath)) {
    return res.json([]);
  }

  const users = JSON.parse(fs.readFileSync(usersPath));
  res.json(users);
});

// ✅ Register program
app.post("/register-program", (req, res) => {
  const { name, email, program, notes } = req.body;

  if (!name || !email || !program) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const programsPath = path.join(__dirname, "programs.json");
  let programs = [];

  if (fs.existsSync(programsPath)) {
    programs = JSON.parse(fs.readFileSync(programsPath));
  }

  programs.push({ name, email, program, notes, registeredAt: new Date().toISOString() });
  fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2));

  res.json({ success: true, message: "Program registration submitted successfully" });
});

// ✅ Get all program registrations (admin only)
app.get("/all-programs", (req, res) => {
  const programsPath = path.join(__dirname, "programs.json");
  if (!fs.existsSync(programsPath)) {
    return res.json([]);
  }

  const programs = JSON.parse(fs.readFileSync(programsPath));
  res.json(programs);
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(✅ Server running on http://localhost:${PORT});
});