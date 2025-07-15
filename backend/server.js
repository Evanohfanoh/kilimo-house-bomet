const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allow both GitHub Pages and Live Server
const allowedOrigins = [
  "https://evanohfanoh.github.io",
  "http://127.0.0.1:5500"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ Handle OPTIONS preflight requests
app.options("*", cors());

app.use(bodyParser.json());

// ✅ Register route
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const usersPath = path.join(__dirname, "users.json");
  let users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  if (users.find(user => user.email === email)) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }

  users.push({ id: uuidv4(), email, password });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json({ success: true, message: "Registration successful" });
});

// ✅ Login route
app.post("/login", (req, res) => {
  const { identifier, password } = req.body;
  const usersPath = path.join(__dirname, "users.json");

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

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

// ✅ Start the server
app.listen(PORT, () => {
  console.log(✅ Server running on port ${PORT});
});