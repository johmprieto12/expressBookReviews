const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username already exists in the users array
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if username exists (invalid for registration), false if doesn't exist (valid for registration)
    return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
    // Check if username and password match the records
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if credentials are valid, false otherwise
    return validusers.length > 0;
}

// Only registered users can login /// task 7 ///
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Middleware to authenticate JWS Token
const authenticateToken = (req, res, next) => {
    const authorizationHeader = req.session.authorization;
    let jwtToken;

    if (authorizationHeader) {
        jwtToken = authorizationHeader['accessToken'];
    }

    if (jwtToken) {
        jwt.verify(jwtToken, "access", (err, user) => {
            if (!err) {
                req.user = user;
                req.session.username = authorizationHeader['username'];
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
};

// Add a book review /// TASK 8 ///
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.username;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if review is provided
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    //Add or update the review
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review for book with ISBN ${isbn} has been added/updated`,
        review: books[isbn].reviews[username]
    });
});

// Delete a book review /// TASK 9 ///
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book has reviews
    if (!books[isbn].reviews) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    // Check if the user has a review for this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: `Review for book with ISBN ${isbn} posted by user ${username} has been deleted`
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
