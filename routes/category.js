const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const categoryController = require("../controllers/category");

router.put("/categories/:categoryId", isAuth, [
  [body("name").trim().notEmpty().withMessage("Không được để trống tên sản phẩm")],
  categoryController.updateCategory,
]);

router.delete("/categories/:categoryId", isAuth, categoryController.deleteCategory);

router.post("/categories", isAuth, categoryController.createCategory);

module.exports = router;
