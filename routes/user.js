const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const User = require("../models/user");
const isAuth = require("../middleware/is-auth");
const userController = require("../controllers/user");

router.post(
  "/users",
  isAuth,
  [
    body("name", "Tên không được để trống").trim().notEmpty(),
    body("address", "Địa chỉ không được để trống").trim().notEmpty(),
    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email đã được sử dụng");
          }
        });
      })
      .normalizeEmail(),
    body("phone", "Số điện thoại không hợp lệ")
      .isMobilePhone("vi-VN")
      .custom((value, { req }) => {
        return User.findOne({ phone: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Số điện thoại đã được sử dụng");
          }
        });
      }),
    body("gender", "Giới tính không hợp lệ").isIn(["Nam", "Nữ"]),
    body("birthday", "Ngày sinh không hợp lệ").isISO8601(),
  ],
  userController.createUser
);

router.get("/users", isAuth, userController.getUsers);

router.delete("/users/:userId", isAuth, userController.deleteUser);

router.put("/users", isAuth, userController.deleteSelectedUsers);

module.exports = router;
