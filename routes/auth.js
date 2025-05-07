const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.post('/signup', async (req, res) => {
  try {
      const { name, email, password, role, branch } = req.body;

      if (!name || !email || !password || !role || !branch) {
          return res.status(400).json({ message: "All fields are required." });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(409).json({ message: "Email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10); 

      const newUser = new User({ name, email, password: hashedPassword, role, branch });
      await newUser.save();

      res.status(201).json({ message: "Signup successful", user: { id: newUser._id, email: newUser.email, role: newUser.role } }); // Consider not sending the password back
  } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error during signup" });
  }
});

router.post('/signin', async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required." });
      }

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ message: "Invalid credentials." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid credentials." });
      }

      return res.status(200).json({
          message: 'Login successful',
          user: {
              id: user._id,
              email: user.email,
              role: user.role,
          },
      });

  } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Server error during signin" });
  }
});

router.post('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Error logging out on server.' });
    }
    res.status(200).json({ message: 'Successfully logged out on server.' });
  });
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;