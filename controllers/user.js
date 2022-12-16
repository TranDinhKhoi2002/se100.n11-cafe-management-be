const { validationResult } = require("express-validator");
const User = require("../models/user");
const Account = require("../models/account");
const Role = require("../models/role");

const { getRole } = require("../util/roles");

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }
  const {
    username,
    password,
    confirmPassword,
    role,
    name,
    address,
    email,
    phone,
    gender,
    birthday,
  } = req.body;

  try {
    const currentUserRole = await getRole(req.account);
    if (currentUserRole != "Quản lý" && currentUserRole != "Chủ quán") {
      const error = new Error(
        "Chỉ có chủ quán hoặc quản lý mới được thêm nhân viên"
      );
      error.statusCode = 401;
      return next(error);
    }

    const existingRole = await Role.findOne({ name: role });
    if (!existingRole) {
      const error = new Error("Vai trò không tồn tại");
      error.statusCode = 422;
      return next(error);
    }

    const hashedPassword = bcryptjs.hashSync(password, 12);
    const account = new Account({ username, password: hashedPassword });
    await account.save();

    const user = new User({
      role: existingRole._id.toString(),
      account: account._id.toString(),
      name,
      address,
      email,
      phone,
      gender,
      birthday,
    });
    await user.save();
    res.status(200).json({ message: "Đăng ký thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
