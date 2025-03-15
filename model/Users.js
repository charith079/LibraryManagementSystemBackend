const mongoose = require('mongoose');

// User schema definition
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum password length
    },
    fineAmount: {
      type: Number,
      default: 0, // Default fine amount is 0
    },
    booksInHand: [
      {
        bookId: {
          type: Number, // Matching bookId to the Number type in the Book schema
          required: true,
        },
        takenDate: {
          type: Date,
          required: true,
        },
      },
    ],
    requestedBooks: [
      {
        type: Number, // Matching bookId to the Number type in the Book schema
      },
    ],
    submittedBooks: [
      {
        bookId: {
          type: Number, // Matching bookId to the Number type in the Book schema
          required: true,
        },
        takenDate: {
          type: Date,
          required: true,
        },
        submittedDate: {
          type: Date,
          required: true,
        },
      },
    ],
    favouriteBooks: [Number], // Simplified to direct array of book IDs
  },
  { timestamps: true }
);

// Export the user schema model
const User = mongoose.model('User', userSchema);
module.exports = User;
