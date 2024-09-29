const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

// Login endpoint
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

// Add a book review
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;           // Get the book ISBN from the route parameter
  const review = req.body.review;         // Get the review from the request body
  const username = req.session.authorization?.username; // Get the logged-in username from the session

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if the review is provided in the request body
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or modify the review for the given ISBN and username
  if (books[isbn].reviews[username]) {
    // If the user already has a review for this book, update it
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  } else {
    // If the user hasn't reviewed this book yet, add a new review
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added successfully" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Check if the book exists
  if (books[isbn]) {
    let reviews = books[isbn].reviews;
    
    // Check if the review exists for the user
    if (reviews[username]) {
      delete reviews[username];  // Delete the user's review
      return res.status(200).json({ message: "Review deleted successfully." });
    } else {
      return res.status(404).json({ message: "No review found for this user." });
    }
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
