var express = require("express");
var router = express.Router();
const Book = require("../models").Book;

/**
 * Route callback function.
 *
 * @callback routeCallback
 * @param {req}
 * @param {res}
 */

/**
 * Handler function to wrap each route.
 *
 * @param {routeCallback} callback
 */
function asyncHandler(callback) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

/* GET books listing. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // TODO: Include a search file for the books listing page. Search should work for all fields. Should be case insensitive
    //  and good for partial matches

    // TODO: Include pagination for the books listing page
    const books = await Book.findAll({ order: [["title"]] });

    res.render("books/index", { title: "Books", books });
  })
);

/* GET new book form. */
router.get(
  "/new",
  asyncHandler(async (req, res) => {
    res.render("books/new", { title: "New Book" });
  })
);

/* POST new book form. */
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    try {
      await Book.create(req.body);
      res.redirect("/books");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        res.render("books/new", {
          errors: error.errors,
          title: "New Book"
        });
      } else {
        throw error;
      }
    }
  })
);

/* GET book update form. */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      res.render("books/edit", { title: "Update Book", book });
    } else {
      req.sendStatus(404);
    }
  })
);

/* POST book update form. */
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let book;

    try {
      book = await Book.findByPk(req.params.id);

      if (book) {
        await book.update(req.body);
        res.redirect("/books");
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("books/edit", {
          book,
          errors: error.errors,
          title: "Update Book"
        });
      } else {
        throw error;
      }
    }
  })
);

/* Delete book. */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

// TODO: Books/id not found should have a different error page than typical 404?
// TODO: Setup a custom error handle middleware

module.exports = router;
