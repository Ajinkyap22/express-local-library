const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all genre
exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_genres) {
      if (err) return next(err);

      res.render("genre_list", {
        title: "Genre List",
        genre_list: list_genres,
      });
    });
};

// Display page for a specific genre
exports.genre_detail = function (req, res, next) {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    function (err, results) {
      if (err) return next(err);

      if (results.genre == null) {
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }

      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display create genre form on get
exports.genre_create_get = function (req, res) {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle create genre on post
exports.genre_create_post = [
  // Validate & Sazitize name field
  body("name", "Genre name must be at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request
  (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Check if genre already exists
      Genre.findOne({ name: req.body.name }).exec(function (err, results) {
        if (err) return next(err);

        if (results) {
          // If genre exists, redirect to its page
          res.redirect(results.url);
        } else {
          genre.save((err) => {
            if (err) return next(err);
            // Redirect to genre detail page
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display delete genre form on get
exports.genre_delete_get = function (req, res, next) {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.genre === null) res.redirect("/catalog/genres");

      res.render("genre_delete", {
        title: "Delete Genre",
        genre_books: results.genre_books,
        genre: results.genre,
      });
    }
  );
};

// Handle delete genre on post
exports.genre_delete_post = function (req, res, next) {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.body.genreid).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.body.genreid }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.genre_books.length > 0) {
        res.render("genre_delete", {
          title: "Delete Genre",
          genre_books: results.genre_books,
          genre: results.genre,
        });
        return;
      } else {
        Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
          if (err) return next(err);

          res.redirect("/catalog/genres");
        });
      }
    }
  );
};

// Display update genre form on get
exports.genre_update_get = function (req, res, next) {
  Genre.findById(req.params.id).exec((err, genre) => {
    if (err) return next(err);

    if (genre === null) {
      const error = new Error("Genre not found");
      error.status = 404;
      return next(error);
    }

    res.render("genre_form", { title: "Update Genre", genre: genre });
  });
};

// Handle update genre on post
exports.genre_update_post = [
  // Validate & sanitize
  body("name", "Genre name must be at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // process request
  (req, res, next) => {
    // Extract errors
    const errors = validationResult(req.body);

    // create genre object
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Genre.findById(req.params.id).exec((err, genre) => {
        if (err) return next(err);

        if (genre === null) {
          const error = new Error("Genre not found");
          error.status = 404;
          return next(error);
        }

        res.render("genre_form", {
          title: "Update Genre",
          genre: genre,
          errors: errors.array(),
        });
      });
      return;
    } else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, thegenre) => {
        if (err) return next(err);

        res.redirect(thegenre.url);
      });
    }
  },
];
