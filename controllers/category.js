const { validationResult } = require("express-validator");
const Category = require("../models/category");
const { getRole } = require("../util/roles");

exports.updateCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name } = req.body;
  const categoryId = req.params.categoryId;
  try {
    const role = await getRole(req.accountId);
    if (role != "Chủ quán" && role != "Quản lý") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được chỉnh sửa danh mục");
      error.statusCode = 401;
      return next(error);
    }

    const currentCategory = await Category.findById(categoryId);
    if (!currentCategory) {
      const error = new Error("Danh mục không tồn tại");
      error.statusCode = 401;
      return next(error);
    }

    if (name !== currentCategory.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        const error = new Error("Tên danh mục đã tồn tại");
        error.statusCode = 422;
        return next(error);
      }
    }

    currentCategory.name = name;
    await currentCategory.save();

    res.status(201).json({ message: "Cập nhật danh mục thành công" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    const role = await getRole(req.accountId);
    if (role != "Chủ quán" && role != "Quản lý") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được xóa sản phẩm");
      error.statusCode = 401;
      return next(error);
    }

    const currentCategory = await Category.findById(categoryId);
    if (!currentCategory) {
      const error = new Error("Danh mục không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (currentCategory.products.length > 0) {
      const error = new Error("Không thể xóa danh mục có chứa sản phẩm");
      error.statusCode = 422;
      return next(error);
    }

    await Category.findByIdAndRemove(categoryId);

    res.status(200).json({ message: "Xóa danh mục thành công" });
  } catch (err) {}
};
