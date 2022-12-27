const { validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");
const bcryptjs = require("bcryptjs");

const User = require("../models/user");
const Account = require("../models/account");
const Role = require("../models/role");
const { roleNames, userStatus } = require("../constants");


const { getRole } = require("../util/roles");

sgMail.setApiKey(process.env.SG_API_KEY);

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }
  const { role, name, address, email, phone, gender, birthday } = req.body;

  try {
    const currentUserRole = await getRole(req.accountId);
    if (currentUserRole != roleNames.OWNER && currentUserRole != roleNames.MANAGER) {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được thêm nhân viên");
      error.statusCode = 401;
      return next(error);
    }

    const existingRole = await Role.findOne({ name: role });
    if (!existingRole) {
      const error = new Error("Chức vụ không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(randomPassword, 12);
    const account = new Account({ username: email, password: hashedPassword });
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

    console.log(process.env.SG_SEND_PASSWORD_TEMPLATE_ID);

    sgMail.send({
      to: email,
      from: "trandinhkhoi102@gmail.com",
      templateId: process.env.SG_SEND_PASSWORD_TEMPLATE_ID,
      dynamicTemplateData: {
        randomPassword,
      },
    });

    res.status(201).json({ message: "Thêm nhân viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: userStatus.ACTIVE }).populate("role").populate("account");
    res.status(200).json({ users });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const currentUserRole = await getRole(req.accountId);
    if (currentUserRole != roleNames.OWNER && currentUserRole != roleNames.MANAGER) {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được thêm nhân viên");
      error.statusCode = 401;
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Nhân viên không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    user.status = userStatus.NONACTIVE;
    await user.save();

    res.status(200).json({ message: "Xóa nhân viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteSelectedUsers = async (req, res, next) => {
  const userIds = req.body.userIds;
  try {
    const currentUserRole = await getRole(req.accountId);
    if (currentUserRole != "Quản lý" && currentUserRole != "Chủ quán") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được thêm nhân viên");
      error.statusCode = 401;
      return next(error);
    }

    const filteredUsers = await User.find({ _id: { $in: userIds } });
    for (let index = 0; index < filteredUsers.length; index++) {
      const currentUser = filteredUsers[index];
      currentUser.status = userStatus.NONACTIVE;
      await currentUser.save();
    }

    res.status(200).json({ message: "Xóa nhân viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.editUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const userId = req.params.userId;
  const { name, role, email, phone, address, gender } = req.body;

  try {
    const user = await User.findById(userId).populate("role");
    if (!user) {
      const error = new Error("User không tồn tại.");
      error.statusCode = 404;
      return next(error);
    }

    if (email !== user.email.toString()) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        const error = new Error("Email đã tồn tại");
        error.statusCode = 409;
        return next(error);
      }
    }

    // Check if user is Owner so we can change role for this user
    if (user.role.name === roleNames.OWNER && user.role._id.toString() !== role.toString()) {
      user.role._id = role;
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.address = address;
    user.gender = gender;
    await user.save();

    res.status(200).json({
      message: "Thay đổi thông tin user thành công!"
    });
  } catch (err) {
    next(err);
  }  
}

exports.changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const userId = req.params.userId;
  const newPassword = req.body.newPassword;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User không tồn tại.");
      error.statusCode = 404;
      return next(error);
    }
    
    const account = await Account.findById(user.account);
    if (!account) {
      const error = new Error("Account không tồn tại.");
      error.statusCode = 404;
      return next(error);
    }

    const hashedPassword = bcryptjs.hashSync(newPassword);
    account.password = hashedPassword;
    await account.save();

    res.status(200).json({ message: "Thay đổi mật khẩu thành công!"});
  } catch (err) {
    next(err);
  }
}
