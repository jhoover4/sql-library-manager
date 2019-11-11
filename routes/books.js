var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const Op = require("../models").Sequelize.Op;

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
    const NUM_PER_PAGE = 10;
    const currentPage = req.query.page ? req.query.page : 0;
    const existingBooks = await Book.count();
    let pageCount = Math.ceil(existingBooks / NUM_PER_PAGE);

    const search = req.query.search;

    let books;
    if (search) {
      pageCount = 0;
      const sqlSearch = `%${search}%`;

      books = await Book.findAll({
        order: [["title"]],
        where: {
          [Op.or]: {
            title: { [Op.like]: sqlSearch },
            author: { [Op.like]: sqlSearch },
            genre: { [Op.like]: sqlSearch },
            year: { [Op.like]: sqlSearch }
          }
        }
      });
    } else {
      books = await Book.findAll({
        order: [["title"]],
        limit: NUM_PER_PAGE,
        offset: (currentPage - 1) * NUM_PER_PAGE
      });
    }

    res.render("books/index", { title: "Books", books, pageCount });
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
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      res.render("books/edit", { title: "Update Book", book });
    } else {
      next();
    }
  })
);

/* POST book update form. */
router.post(
  "/:id",
  asyncHandler(async (req, res, next) => {
    let book;

    try {
      book = await Book.findByPk(req.params.id);

      if (book) {
        await book.update(req.body);
        res.redirect("/books");
      } else {
        next();
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
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      next();
    }
  })
);

module.exports = router;
