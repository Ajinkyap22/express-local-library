const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const async = require("async");

// Display list of all book instances
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate("book")
    .exec((err, list_bookinstances) => {
      if (err) return next(err);

      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display page for a specific bookinstance
exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, bookinstance) {
      if (err) return next(err);

      if (bookinstance == null) {
        const error = new Error("Book Instance not found");
        error.status = 404;
        return next(error);
      }

      res.render("bookinstance_detail", {
        title: `Copy: ${bookinstance.book.title}`,
        bookinstance: bookinstance,
      });
    });
};

// Display create bookinstance form on get
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, "title").exec((err, books) => {
    if (err) return next(err);

    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
    });
  });
};

// Handle create bookinstance on post
exports.bookinstance_create_post = [
  // Validate & sanitize
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request
  (req, res, next) => {
    // extract errors
    const errors = validationResult(req.body);

    // Create bookinstance object
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      isbn: req.body.isbn,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // Render the form again with errors messages
      Book.find({}, "title").exec((err, books) => {
        if (err) return next(err);

        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          selected_book: bookinstance.book_id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      bookinstance.save((err) => {
        if (err) return next(err);

        res.redirect(bookinstance.url);
      });
    }
  },
];
// Display delete bookinstance form on get
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id).exec((err, book_instance) => {
    if (err) return next(err);

    if (book_instance === null) res.redirect("/catalog/bookinstances");

    res.render("bookinstance_delete", {
      title: "Delete Book Instance",
      book_instance: book_instance,
    });
  });
};

// Handle delete bookinstance on post
exports.bookinstance_delete_post = function (req, res, next) {
  BookInstance.findById(req.body.binstanceid).exec((err) => {
    if (err) return next(err);

    BookInstance.findByIdAndRemove(
      req.body.binstanceid,
      function deleteInstance(err) {
        if (err) return next(err);

        res.redirect("/catalog/bookinstances");
      }
    );
  });
};

// Display update bookinstance form on get
exports.bookinstance_update_get = function (req, res, next) {
  async.parallel(
    {
      bookinstance: (callback) =>
        BookInstance.findById(req.params.id).populate("book").exec(callback),
      books: (callback) => Book.find(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.bookinstance === null) {
        const error = new Error("Book copy not found");
        error.status = 404;
        return next(error);
      }

      res.render("bookinstance_form", {
        title: "Update Book Instance",
        bookinstance: results.bookinstance,
        book_list: results.books,
        selected_book: results.bookinstance.book._id,
      });
    }
  );
};

// Handle update bookinstance on post
exports.bookinstance_update_post = [
  // Validate & sanitize
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // process request
  (req, res, next) => {
    // Extract errors
    const errors = validationResult(req.body);

    // create author object
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      isbn: req.body.isbn,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, books) => {
        if (err) return next(err);

        res.render("bookinstance_form", {
          title: "Update Book Instance",
          book_list: books,
          selected_book: bookinstance.book._id,
          bookinstance: bookinstance,
          errors: errors.array(),
        });
      });
      return;
    } else {
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        (err, binstance) => {
          if (err) return next(err);

          res.redirect(binstance.url);
        }
      );
    }
  },
];
