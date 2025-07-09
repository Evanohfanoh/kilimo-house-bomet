const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// ✅ Use correct MongoDB connection string
const uri = "mongodb+srv://levislevoohlevis:Evanoh%40249@cluster0.3ufrvis.mongodb.net/kilimodb?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// MongoDB setup
let usersCollection;
let programsCollection;

async function connectToMongo() {
  try {
    await client.connect();
    const db = client.db("kilimodb");
    usersCollection = db.collection("users");
    programsCollection = db.collection("programs"); // ✅ New programs collection
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit if DB fails
  }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    await usersCollection.insertOne({ email, phone, password });
    res.json({ success: true, message: "Registration successful" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ✅ Login with email or phone
app.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await usersCollection.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ],
      password
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, message: "Login successful", email: user.email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Reset password endpoint
app.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const result = await usersCollection.updateOne(
      { email },
      { $set: { password: newPassword } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get all farmers (admin use)
app.get('/farmers', async (req, res) => {
  try {
    const allUsers = await usersCollection.find().toArray();
    res.json(allUsers);
  } catch (err) {
    console.error("Fetching users failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Register for a program
app.post('/register-program', async (req, res) => {
  try {
    const { name, email, program, notes } = req.body;

    await programsCollection.insertOne({
      name,
      email,
      program,
      notes,
      registeredAt: new Date()
    });

    res.json({ success: true, message: "Program registration successful" });
  } catch (err) {
    console.error("❌ Program registration error:", err);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// ✅ Start server after DB connection
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
});
