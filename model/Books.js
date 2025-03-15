const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookId:{
    type:Number,
    required:true,
    unique:true
  },
  bookName: { type: String, required: true },
  authorName: { type: String, required: true },
  bookImageLink: { type: String, required: true },
  rating: { type: Number, required: true },
});

const Books = mongoose.model('Books', bookSchema, 'Books'); // Use the specific collection name
module.exports = Books;
