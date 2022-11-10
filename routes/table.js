const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const tableController = require("../controllers/table");
const isAuth = require("../middleware/is-auth");
const Table = require("../models/table");

router.get("/tables", isAuth, tableController.getTables);

router.get("/tables/:tableId", isAuth, tableController.getTableById);

router.post(
  "/tables",
  isAuth,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Tên bàn không được để trống")
      .custom((value, { req }) => {
        return Table.findOne({ name: value }).then((tableDoc) => {
          if (tableDoc) {
            return Promise.reject("Tên bàn đã tồn tại");
          }
        });
      }),
  ],
  tableController.createTable
);

router.put(
  "/tables/:tableId",
  isAuth,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Tên bàn không được để trống")
      .custom((value, { req }) => {
        return Table.findOne({ name: value }).then((tableDoc) => {
          if (tableDoc) {
            return Promise.reject("Tên bàn đã tồn tại");
          }
        });
      }),
    body("state", "Trạng thái không hợp lệ").isIn(["Còn trống", "Đang dùng"]),
  ],
  tableController.updateTable
);

router.delete("/tables/:tableId", isAuth, tableController.deleteTable);

module.exports = router;
