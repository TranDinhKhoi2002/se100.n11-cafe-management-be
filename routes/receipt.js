const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const receiptController = require("../controllers/receipt");
const isAuth = require("../middleware/is-auth");

router.get("/receipts", isAuth, receiptController.getReceipts);

router.post(
  "/receipts",
  isAuth,
  [body("totalPrice").isNumeric().withMessage("Tổng tiền phải là số")],
  receiptController.createReceipt
);

router.get("/receipts/:receiptId", isAuth, receiptController.getReceiptById);

router.put(
  "/receipts/edit/:receiptId",
  isAuth,
  [
    body("products")
      .notEmpty()
      .withMessage("Hoá đơn phải có sản phẩm")
      .custom((value, { req }) => {
        value.forEach((item) => {
          if (item.quantity < 1) {
            return false;
          }
        });
        return true;
      }),
  ],
  receiptController.editReceipt
);

router.put("/receipts/pay/:receiptId", isAuth, receiptController.payForReceipt);

router.put("/receipts/remove/:receiptId", isAuth, receiptController.removeReceipt);

module.exports = router;

module.exports = router;
