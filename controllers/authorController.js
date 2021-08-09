const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all authors
exports.author_list = function (req, res, next) {
  Author.find()
    .sort([["family_name", "ascending"]])
    .exec((err, list_authors) => {
      if (err) return next(err);

      res.render("author_list", {
        title: "Author List",
        author_list: list_authors,
      });
    });
};

// Display page for a specific author
exports.author_detail = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => Author.findById(req.params.id).exec(callback),
      authors_books: (callback) =>
        Book.find({ author: req.params.id }, "title summary").exec(callback),
    },
    function (err, results) {
      if (err) return next(err);

      if (results.author == null) {
        const error = new Error("Author not found");
        error.status = 404;
        return next(error);
      }

      res.render("author_detail", {
        title: "Author Detail",
        author: results.author,
        author_books: results.authors_books,
      });
    }
  );
};

// Display create author form on get
exports.author_create_get = function (req, res, next) {
  res.render("author_form", { title: "Create Author" });
};

// Handle create author on post
exports.author_create_post = [
  // Sanitize & Validate
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),

  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),

  body("date_of_birth").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("date_of_death").optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Render the form again with error messages
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Create author object
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });

      author.save((err) => {
        if (err) return next(err);

        res.redirect(author.url);
      });
    }
  },
];

// Display delete author form on get
exports.author_delete_get = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => Author.findById(req.params.id).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.author == null) res.redirect("/catalog/authors");

      res.render("author_delete", {
        title: "Delete Author",
        author: results.author,
        author_books: results.author_books,
      });
    }
  );
};

// Handle delete author on post
exports.author_delete_post = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => Author.findById(req.body.authorid).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.body.authorid }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.author_books.length > 0) {
        res.render("author_delete", {
          title: "Delete Author",
          author: results.author,
          author_books: results.author_books,
        });
        return;
      } else {
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if (err) return next(err);

          res.redirect("/catalog/authors");
        });
      }
    }
  );
};

// Display update author form on get
exports.author_update_get = function (req, res, next) {
  Author.findById(req.params.id).exec((err, author) => {
    if (err) return next(err);

    if (author === null) {
      const error = new Error("Author not found");
      error.status = 404;
      return next(error);
    }

    res.render("author_form", { title: "Update Author", author: author });
  });
};

// Handle update author on post
exports.author_update_post = [
  // Validate & sanitize
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),

  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),

  body("date_of_birth").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("date_of_death").optional({ checkFalsy: true }).isISO8601().toDate(),

  // process request
  (req, res, next) => {
    // Extract errors
    const errors = validationResult(req.body);

    // create author object
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Author.findById(req.params.id).exec((err, author) => {
        if (err) return next(err);

        if (author === null) {
          const error = new Error("Author not found");
          error.status = 404;
          return next(error);
        }

        res.render("author_form", {
          title: "Update Author",
          author: author,
          errors: errors.array(),
        });
      });
      return;
    } else {
      Author.findByIdAndUpdate(req.params.id, author, {}, (err, theauthor) => {
        if (err) return next(err);

        res.redirect(theauthor.url);
      });
    }
  },
];
