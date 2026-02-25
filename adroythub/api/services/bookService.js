const { getBookCollection } = require("../models/bookModel");

// Function to Add a Book
async function addBook(bookData) {
  if (!bookData.username || !bookData.author || !bookData.title || bookData.rating == null) {
    return { success: 2, message: "Missing required fields." };
  }

  const booksCollection = await getBookCollection();
  bookData.timestamp = new Date();

  await booksCollection.insertOne(bookData);
  return { success: 1, message: "Book added successfully." };
}

// Function to Fetch Books
async function fetchBooks(limit = 4, offset = 0) {
  const booksCollection = await getBookCollection();

  const books = await booksCollection
    .find()
    .skip(offset)
    .limit(limit)
    .toArray();

  return { success: 1, books };
}

module.exports = { addBook, fetchBooks };
