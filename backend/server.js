const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for your GitHub Pages site
app.use(cors({
  origin: "https://evanohfanoh.github.io",
  methods: ["GET", "POST"],
  credentials: false
}));

app.use(bodyParser.json());

const usersFile = path.join(__dirname, "users.json");
const programsFile = path.join(__dirname, "programs.json");

// Helper to read JSON from a file
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  return content ? JSON.parse(content) : [];
}

// Helper to write JSON to a file
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// === REGISTER ===
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(usersFile);

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  users.push({ email, password });
  writeJSON(usersFile, users);
  res.json({ success: true, message: "Registration successful" });
});

// === LOGIN ===
app.post("/login", (req, res) => {
  const { identifier, password } = req.body;
  const users = readJSON(usersFile);

  const user = users.find(u => u.email === identifier && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({ success: true, message: "Login successful", email: user.email });
});

// === VIEW ALL USERS (Admin only) ===
app.get("/farmers", (req, res) => {
  const users = readJSON(usersFile);
  res.json(users);
});

// === PROGRAM REGISTRATION ===
app.post("/register-program", (req, res) => {
  const { name, email, program, notes } = req.body;
  const programs = readJSON(programsFile);

  programs.push({
    name,
    email,
    program,
    notes,
    registeredAt: new Date().toISOString()
  });

  writeJSON(programsFile, programs);
  res.json({ success: true, message: "Program registered successfully" });
});

// === GET ALL PROGRAMS ===
app.get("/all-programs", (req, res) => {
  const programs = readJSON(programsFile);
  res.json(programs);
});

// === Server Listening ===
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});