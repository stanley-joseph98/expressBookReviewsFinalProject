const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").authenticated;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    // Send JSON response with formatted books data
    res.send(JSON.stringify(books,null,4));

});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
 // Retrieve the ISBN parameter from the request URL and send the corresponding books's details
  const isbn = req.params.isbn;
  return res.send(books[isbn]);
});
  
// Get book details based on author
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;  // Correctly retrieve the author from URL params
  const bookKeys = Object.keys(books);  // Get all keys (ISBNs) from the books object
  const booksByAuthor = [];

  // Iterate through all books and find those by the specified author
  bookKeys.forEach(key => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) { // Case-insensitive match
      booksByAuthor.push(books[key]);  // Add matching books to the result array
    }
  });

  // If books by the author are found, return them, otherwise send a 404 response
  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);  // Return the books written by the author
  } else {
    return res.status(404).json({ message: "No books found for the specified author" });
  }
});


/// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.trim();  // Retrieve and trim the title parameter from the request URL
  const bookKeys = Object.keys(books);  // Get all keys (ISBNs) from the books object
  const booksByTitle = [];

  // Iterate through all books and find those matching the title
  bookKeys.forEach(key => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {  // Case-insensitive title match
      booksByTitle.push(books[key]);  // Add matching books to the result array
    }
  });

  // If books with the title are found, return them, otherwise send a 404 response
  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);  // Return the books with the specified title
  } else {
    return res.status(404).json({ message: "No books found for the specified title" });
  }
});


// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn.trim();  // Retrieve and trim the ISBN from the request parameters

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    const reviews = books[isbn].reviews;  // Get the reviews for the specified ISBN
    return res.status(200).json(reviews);  // Return the reviews in JSON format
  } else {
    return res.status(404).json({ message: "Book not found" });  // Send 404 if book is not found
  }
});




//Getting all books using promise callbacks with axios
public_users.get('/', function(req, res) {
  axios.get('books') 
    .then(response => {
      const books = response.data;
      res.send(JSON.stringify(books, null, 4));
    })
    .catch(error => {
      console.error(error);
      res.status(500).send({ message: 'Error fetching books' });
    });
});

//Getting a book based on ISBN using promise callbacks with axios
public_users.get('/isbn/:isbn', async function(req, res) {
    try {
      // Retrieve the ISBN parameter from the request URL
      const isbn = req.params.isbn;
      // Assume we have an Axios instance to make a GET request to an API endpoint
      const response = await axios.get(`/books/${isbn}`); 
      const bookDetails = response.data;
      res.send(bookDetails);
    } catch (error) {
      console.error(error);
      res.status(404).send({ message: 'Book not found' });
    }
  });

  //Using callback with axios to get books by title:
  public_users.get('/title/:title', function(req, res) {
    const title = req.params.title;  // Retrieve the title from URL params
  
    axios.get('/books')  // Assuming the API endpoint is /books
      .then(response => {
        const books = response.data;
        const bookKeys = Object.keys(books);  // Get all keys (ISBNs) from the books object
        const booksByTitle = [];
  
        // Iterate through all books and find those by the specified title
        bookKeys.forEach(key => {
          if (books[key].title.toLowerCase() === title.toLowerCase()) { // Case-insensitive match
            booksByTitle.push(books[key]);  // Add matching books to the result array
          }
        });
  
        // If books by the title are found, return them, otherwise send a 404 response
        if (booksByTitle.length > 0) {
          res.status(200).json(booksByTitle);  // Return the books with the specified title
        } else {
          res.status(404).json({ message: "No books found for the specified title" });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send({ message: 'Error fetching books' });
      });
  });

  //Using async-await With Axios to get books by title
  public_users.get('/title/:title', async function(req, res) {
    try {
      const title = req.params.title;  // Retrieve the title from URL params
  
      const response = await axios.get('/books');  // Assuming the API endpoint is /books
      const books = response.data;
      const bookKeys = Object.keys(books);  // Get all keys (ISBNs) from the books object
      const booksByTitle = [];
  
      // Iterate through all books and find those by the specified title
      bookKeys.forEach(key => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) { // Case-insensitive match
          booksByTitle.push(books[key]);  // Add matching books to the result array
        }
      });
  
      // If books by the title are found, return them, otherwise send a 404 response
      if (booksByTitle.length > 0) {
        res.status(200).json(booksByTitle);  // Return the books with the specified title
      } else {
        res.status(404).json({ message: "No books found for the specified title" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error fetching books' });
    }
  });


module.exports.general = public_users;
