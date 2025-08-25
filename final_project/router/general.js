const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new user /// TASK 6 ///
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.passworkd;
});

// Get the book list available in the shop /// TASK 1 ///
public_users.get('/',function (req, res) {
    // Send the books object as JSON response
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN /// TASK 2 ///
public_users.get('/isbn/:isbn',function (req, res) {
    // Get the ISBN from request parameters
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn]) {
        res.send (books[isbn]);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
 });
  
// Get book details based on author /// TASK 3 ///
public_users.get('/author/:author',function (req, res) {
  // Get the author from request parameterse
  const author = req.params.author;
  let booksByAuthor = [];

  // Loop through all books to find books by the specified author
  for (let isbn in books) {
    if (books[isbn].author === author) {
        booksByAuthor.push({
            isbn: isbn,
            title: books[isbn].title,
            author: books[isbn].author,
            reviews: books[isbn].reviews
        });
    }
  }

  // Check if any book were found
  if (booksByAuthor.length > 0) {
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res. status(404).jason({message: "no books found by this author"});
  }
});

// Get all books based on title /// TASK 4 ///
public_users.get('/title/:title',function (req, res) {
    // Get the title from request parameters
    const title = req.params.title;
    let booksByTitle = [];

    // Loop through all books to find books with the specified title
    for (let isbn in books) {
        if (books[isbn].title === title) {
            booksByTitle.push({
                isbn: isbn,
                title: books[isbn].title,
                author: books[isbn].author,
                reviews: books[isbn].reviews
            });
        }
    }

    // Check if any books were found
    if (booksByTitle.length > 0) {
        res.send(JSON.stringify(booksByTitle, null, 4));
    } else {
        return res.status(404).json({message: "No books found with this title"});
    }
});

//  Get book review /// TASK 5 ///
public_users.get('/review/:isbn',function (req, res) {
    // Get the ISBN from request parameters
    const isbn = req.params.isbn;

    // Check if the book exists
    if (book[isbn]) {
        //Return the reviews for the book
        res.send(books[isbn].reviews);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;
