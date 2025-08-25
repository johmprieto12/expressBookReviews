const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new user /// TASK 6 ///
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users[username] = { password: password };
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop /// TASK 1 ///
public_users.get('/', function (req, res) {
    // Send the books object as JSON response
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN /// TASK 2 ///
public_users.get('/isbn/:isbn', function (req, res) {
    // Get the ISBN from request parameters
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn]) {
        res.send(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author /// TASK 3 ///
public_users.get('/author/:author', function (req, res) {
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
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title /// TASK 4 ///
public_users.get('/title/:title', function (req, res) {
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
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review /// TASK 5 ///
public_users.get('/review/:isbn', function (req, res) {
    // Get the ISBN from request parameters
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn]) {
        //Return the reviews for the book
        res.send(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get all books using async callback function /// TASK 10 ///
const getAllBooks = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    });
};

public_users.get('/async', async (req, res) => {
    try {
        const allBooks = await getAllBooks();
        res.send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Alternative using callback style for Task 10
public_users.get('/callback', (req, res) => {
    const getBooksWithCallback = (callback) => {
        setTimeout(() => {
            callback(null, books);
        }, 1000);
    };

    getBooksWithCallback((error, data) => {
        if (error) {
            res.status(500).json({ message: "Error fetching books", error: error.message });
        } else {
            res.send(JSON.stringify(data, null, 4));
        }
    });
});

// Search by ISBN using promises /// TASK 11 ///
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error("Book not found"));
            }
        }, 1000);
    });
};

public_users.get('/async/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBN(isbn);
        res.send(JSON.stringify(book, null, 4));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//Alternative using Promise.then() for Task 11
public_users.get('/promise/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
    .then(book => res.send(JSON.stringify(book, null, 4)))
    .catch(error => res.status(404).json({ message: error.message }));
});

// Search by Author using Promises
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let booksByAuthor = [];
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
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject(new Error("No books found by this author"));
            }
        }, 1000);
    });
};

public_users.get('/async/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthor(author);
        res.send(JSON.stringify(booksByAuthor, null, 4));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Alternative using Promise.then() for Task 12
public_users.get('/promise/author/:author', (req, res) => {
    const author = req.params.author;
    getBooksByAuthor(author)
    .then(books => res.send(JSON.stringify(books, null, 4)))
    .catch(error => res.status(404).json({ message: error.message }));
});

// Search by Title using Promises /// TASK 13 ///
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let booksByTitle = [];
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
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject(new Error("No books found with this title"));
            }
        }, 1000);
    });
};

public_users.get('/async/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitle(title);
        res.send(JSON.stringify(booksByTitle, null, 4));
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Alternative using Promise.then() for Task 13
public_users.get('/promise/title/:title', (req, res) => {
    const title = req.params.title;
    getBooksByTitle(title)
    .then(books => res.send(JSON.stringify(books, null, 4)))
    .catch(error => res.status(404).json({ message: error.message }));
});

module.exports.general = public_users;
