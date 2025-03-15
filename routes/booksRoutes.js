const express = require('express');
const router = express.Router();
const Book = require('../model/Books'); // Import the Book model

// GET route to fetch all books
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/books - Fetching all books');
    const books = await Book.find({}).lean();
    console.log(`Found ${books.length} books`);
    res.json(books);
  } catch (err) {
    console.error('Error in GET /api/books:', err);
    res.status(500).json({ 
      message: 'Failed to fetch books', 
      error: err.message 
    });
  }
});

// GET route to search books by name or author
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query || '';
    console.log('Search query:', query);

    const books = await Book.find({
      $or: [
        { bookName: { $regex: query, $options: 'i' } },
        { authorName: { $regex: query, $options: 'i' } }
      ]
    }).lean();

    console.log(`Found ${books.length} matching books`);
    res.json(books);
  } catch (err) {
    console.error('Error searching books:', err);
    res.status(500).json({ message: 'Failed to search books', error: err.message });
  }
});

// GET route to fetch books by IDs (for favorites)
router.get('/by-ids', async (req, res) => {
  try {
    const { bookIds } = req.query;
    const ids = JSON.parse(bookIds);
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'BookIds must be an array' });
    }

    const books = await Book.find({ bookId: { $in: ids } });
    res.status(200).json(books);
  } catch (err) {
    console.error('Error fetching books by IDs:', err);
    res.status(500).json({ message: 'Error fetching books', error: err });
  }
});

module.exports = router;

