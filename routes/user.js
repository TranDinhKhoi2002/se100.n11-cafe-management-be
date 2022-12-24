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
    body("username")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
      .withMessage("Tên đăng nhập phải chứa ít nhất 5 ký tự")
      .custom(
        (value, { req }) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Tên đăng nhập đã tồn tại");
          }
        });
      }),
    body("password", "Mật khẩu phải chứa ít nhất 5 ký tự")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Xác nhận mật khẩu không trùng khớp");
      }
      return true;
    }),
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

router.put(
  "/users/:userId/edit",
  isAuth,
  [
    body("role").notEmpty().isMongoId(),
    body("name", "Tên không được để trống").trim().notEmpty(),
    body("address", "Địa chỉ không được để trống").trim().notEmpty(),
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
  userController.editUser
);

router.put(
  "users/:userId/change-password", 
  isAuth,
  [
    body("newPassword", "Mật khẩu phải chứa ít nhất 5 ký tự")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
      .custom((value, { req }) => {
        if (value === req.body.oldPassword) {
          return Promise.reject("Mật khẩu mới trùng với mật khẩu cũ");
        }
        return true;
      }),
    body("confirmNewPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        return Promise.reject("Xác nhận mật khẩu không trùng khớp");
      }
      return true;
    }),
  ],
  userController.changePassword
);

module.exports = router;