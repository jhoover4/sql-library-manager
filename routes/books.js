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
    const books = await Book.findAll();
    // TODO: Return these sorted by title
    
    res.render("books/index", { title: "Books" , books});
  })
);

module.exports = router;
