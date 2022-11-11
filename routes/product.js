const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const productController = require("../controllers/product");
const isAuth = require("../middleware/is-auth");
const Product = require("../models/product");
const Category = require("../models/category");

const productValidation = [
  body("category")
    .isMongoId()
    .withMessage("Mã danh mục không hợp lệ")
    .custom((value, { req }) => {
      return Category.findById(value).then((categoryDoc) => {
        if (!categoryDoc) {
          return Promise.reject("Danh mục không tồn tại");
        }
      });
    }),
  body("name").trim().notEmpty().withMessage("Không được để trống tên sản phẩm").custom((value, { req }) => {
      return Product.findOne({name: value}).then((productDoc) => {
        if(productDoc){
          return Promise.reject("Tên sản phẩm đã tồn tại");
        }
      });
    }),
  body("price", "Giá sản phẩm không hợp lệ").isFloat({min: 0}),
];

router.get("/products", isAuth, productController.getProducts);

router.get("/products/:productId", isAuth, productController.getProductById);

router.post(
  "/products",
  isAuth,
  productValidation,
  productController.createProduct
);

router.put(
  "/products/:productId",
  isAuth,
  productValidation,
  productController.updateProduct
);

router.delete("/products/:productId", isAuth, productController.deleteProduct);

module.exports = router;
