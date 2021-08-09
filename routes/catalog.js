const express = require("express");
const router = express.Router();

// controller modules
const book_controller = require("../controllers/bookController");
const author_controller = require("../controllers/authorController");
const genre_controller = require("../controllers/genreController");
const bookinstance_controller = require("../controllers/bookinstanceController");

// BOOK ROUTES //

// GET catalog home page
router.get("/", book_controller.index);

// GET request for creating a genre.
router.get("/book/create", book_controller.book_create_get);

// POST for creating a genre
router.post("/book/create", book_controller.book_create_post);

// GET request for deleting a genre.
router.get("/book/:id/delete", book_controller.book_delete_get);

// POST for deleting a book
router.post("/book/:id/delete", book_controller.book_delete_post);

// GET request for updating a Book.
router.get("/book/:id/update", book_controller.book_update_get);

// POST for updating a book
router.post("/book/:id/update", book_controller.book_update_post);

// GET for one book
router.get("/book/:id", book_controller.book_detail);

// GET for list of all books
router.get("/books", book_controller.book_list);

// AUTHOR ROUTES //

// GET request for creating an author.
router.get("/author/create", author_controller.author_create_get);

// POST for creating an author
router.post("/author/create", author_controller.author_create_post);

// GET request for deleting an author.
router.get("/author/:id/delete", author_controller.author_delete_get);

// POST for deleting an author
router.post("/author/:id/delete", author_controller.author_delete_post);

// GET request for updating an author.
router.get("/author/:id/update", author_controller.author_update_get);

// POST for updating an author
router.post("/author/:id/update", author_controller.author_update_post);

// GET for one author
router.get("/author/:id", author_controller.author_detail);

// GET for list of all authors
router.get("/authors", author_controller.author_list);

// GENRE ROUTES //

// GET request for creating a genre.
router.get("/genre/create", genre_controller.genre_create_get);

// POST for creating a genre
router.post("/genre/create", genre_controller.genre_create_post);

// GET request for deleting a genre.
router.get("/genre/:id/delete", genre_controller.genre_delete_get);

// POST for deleting a genre
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// GET request for updating a genre.
router.get("/genre/:id/update", genre_controller.genre_update_get);

// POST for updating a genre
router.post("/genre/:id/update", genre_controller.genre_update_post);

// GET for one genre
router.get("/genre/:id", genre_controller.genre_detail);

// GET for list of all genres
router.get("/genres", genre_controller.genre_list);

// BOOKINSTANCE ROUTES //

// GET request for creating a bookinstance.
router.get(
  "/bookinstance/create",
  bookinstance_controller.bookinstance_create_get
);

// POST for creating a bookinstance
router.post(
  "/bookinstance/create",
  bookinstance_controller.bookinstance_create_post
);

// GET request for deleting a bookinstance.
router.get(
  "/bookinstance/:id/delete",
  bookinstance_controller.bookinstance_delete_get
);

// POST for deleting a bookinstance
router.post(
  "/bookinstance/:id/delete",
  bookinstance_controller.bookinstance_delete_post
);

// GET request for updating a bookinstance.
router.get(
  "/bookinstance/:id/update",
  bookinstance_controller.bookinstance_update_get
);

// POST for updating a bookinstance
router.post(
  "/bookinstance/:id/update",
  bookinstance_controller.bookinstance_update_post
);

// GET for one bookinstance
router.get("/bookinstance/:id", bookinstance_controller.bookinstance_detail);

// GET for list of all bookinstances
router.get("/bookinstances", bookinstance_controller.bookinstance_list);

module.exports = router;
