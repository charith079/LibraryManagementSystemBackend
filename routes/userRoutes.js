const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../model/Users'); // Import the User model
const jwt = require('jsonwebtoken');

const router = express.Router();

// POST route to register a new user
router.post('/register', async (req, res) => {   // Added forward slash
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Check if the user already exists by username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fineAmount: 0, // Initialize fineAmount to 0
      booksInHand: [],
      requestedBooks: [],
      submittedBooks: [],
      favouriteBooks: [], // Initialize empty favorites array
    });

    // Save the user to the database
    await newUser.save();

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {      // Added forward slash
  const { email, password } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token (expires in 1 hour)
    const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' });

    // Send back the token and user details
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Updated toggle-favorite route
router.post('/toggle-favorite', async (req, res) => {
  try {
    const { bookId, action } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'yourSecretKey');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favouriteBooks) {
      user.favouriteBooks = [];
    }

    const bookIdNumber = Number(bookId);

    if (action === 'add') {
      if (!user.favouriteBooks.includes(bookIdNumber)) {
        user.favouriteBooks.push(bookIdNumber);
      }
    } else if (action === 'remove') {
      user.favouriteBooks = user.favouriteBooks.filter(id => id !== bookIdNumber);
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Error updating favorites', error: error.message });
  }
});

// Request book route
router.post('/request-book', async (req, res) => {
  try {
    const { bookId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'yourSecretKey');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if book is already requested
    if (user.requestedBooks.includes(bookId)) {
      return res.status(400).json({ message: 'Book already requested' });
    }

    user.requestedBooks.push(bookId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Request book error:', error);
    res.status(500).json({ message: 'Error requesting book', error: error.message });
  }
});

// Cancel book request route
router.post('/cancel-request', async (req, res) => {
  try {
    const { bookId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'yourSecretKey');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the book from requestedBooks array
    user.requestedBooks = user.requestedBooks.filter(id => id !== bookId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Error canceling request', error: error.message });
  }
});

module.exports = router;
