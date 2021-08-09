const Book = require("../models/book");
const BookInstance = require("../models/bookinstance");
const Author = require("../models/author");
const Genre = require("../models/genre");
const { body, validationResult } = require("express-validator");

const async = require("async");

exports.index = function (req, res) {
  async.parallel(
    {
      // Passing empty object as match condition to find all documents in the collection
      book_count: (callback) => Book.countDocuments({}, callback),

      book_instance_count: (callback) =>
        BookInstance.countDocuments({}, callback),

      book_instance_available_count: (callback) =>
        BookInstance.countDocuments({ status: "Available" }, callback),

      author_count: (callback) => Author.countDocuments({}, callback),

      genre_count: (callback) => Genre.countDocuments({}, callback),
    },
    (err, results) => {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all books
exports.book_list = function (req, res, next) {
  Book.find({}, "title author")
    .populate("author")
    .exec((err, list_books) => {
      if (err) return next(err);

      res.render("book_list", { title: "Book List", book_list: list_books });
    });
};

// Display page for a specific book
exports.book_detail = function (req, res, next) {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback),
      book_instance: (callback) =>
        BookInstance.find({ book: req.params.id }).exec(callback),
    },
    function (err, results) {
      if (err) return next(err);

      if (results.book == null) {
        const error = new Error("Book not found");
        error.status = 404;
        return next(error);
      }

      res.render("book_detail", {
        title: "Book Detail",
        book: results.book,
        book_instances: results.book_instance,
      });
    }
  );
};

// Display create book form on get
exports.book_create_get = function (req, res, next) {
  async.parallel(
    {
      authors: (callback) => Author.find(callback),
      genres: (callback) => Genre.find(callback),
    },
    (err, results) => {
      if (err) return next(err);
      res.render("book_form", {
        title: "Create Book",
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

// Handle create book on post
exports.book_create_post = [
  // Convert genres to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.bdoy.genre);
    }
    next();
  },

  // Validate & sanitize
  body("title", "Title cannot be empty.").trim().isLength({ min: 1 }).escape(),
  body("author", "Author cannot be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary cannot be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "isbn cannot be empty.").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request
  (req, res, next) => {
    // Extract errors
    const errors = validationResult(req.body);

    // Create book object
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // Render form again with errors
      async.parallel(
        {
          authors: (callback) => Author.find(callback),
          genres: (callback) => Genre.find(callback),
        },
        (err, results) => {
          if (err) return next(err);

          // Mark selected genres as checked
          for (let i = 0; i < results.genre.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }

          res.render("book_form", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      book.save((err) => {
        if (err) return next(err);
        res.redirect(book.url);
      });
    }
  },
];

// Display delete book form on get
exports.book_delete_get = function (req, res, next) {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback),
      book_instances: (callback) =>
        BookInstance.find({ book: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.book === null) res.redirect("/catalog/books");

      res.render("book_delete", {
        title: "Delete Book",
        book: results.book,
        book_instances: results.book_instances,
      });
    }
  );
};

// Handle delete book on post
exports.book_delete_post = function (req, res, next) {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.body.bookid)
          .populate("author")
          .populate("genre")
          .exec(callback),
      book_instances: (callback) =>
        BookInstance.find({ book: req.body.bookid }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.book_instances.length > 0) {
        res.render("book_delete", {
          title: "Delete Book",
          book: results.book,
          book_instances: results.book_instances,
        });
        return;
      } else {
        Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
          if (err) return next(err);

          res.redirect("/catalog/books");
        });
      }
    }
  );
};

// Display update book form on get
exports.book_update_get = function (req, res, next) {
  async.parallel(
    {
      book: (callback) =>
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback),

      authors: (callback) => Author.find(callback),
      genres: (callback) => Genre.find(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.book == null) {
        const error = new Error("Book not found");
        error.status = 404;
        return next(error);
      }

      // Mark our selected genres as checked.
      for (let i = 0; i < results.genres.length; i++) {
        for (let j = 0; j < results.book.genre.length; j++) {
          if (
            results.genres[i]._id.toString() ===
            results.book.genre[j]._id.toString()
          ) {
            results.genres[i].checked = "true";
          }
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: results.authors,
        genres: results.genres,
        book: results.book,
      });
    }
  );
};

// Handle update book on post
exports.book_update_post = [
  // Convert genre to array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate & sanitize
  body("title", "Title cannot be empty").trim().isLength({ min: 1 }).escape(),
  body("author", "Author cannot be empty").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN cannot be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request
  (req, res, next) => {
    const errors = validationResult(req.body);

    // Create book object
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          book: (callback) =>
            Book.findById(req.params.id)
              .populate("author")
              .populate("genre")
              .exec(callback),

          authors: (callback) => Author.find(callback),
          genres: (callback) => Genre.find(callback),
        },
        (err, results) => {
          if (err) return next(err);

          if (results.book == null) {
            const error = new Error("Book not found");
            error.status = 404;
            return next(error);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Update Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(thebook.url);
      });
    }
  },
];
