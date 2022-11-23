const { validationResult } = require("express-validator");
const Product = require("../models/product");
const Receipt = require("../models/receipt");

const { getRole } = require("../util/roles");

exports.createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { category, name, price, image } = req.body;
  try {
    const role = await getRole(req.accountId);
    if (role != "Chủ quán" && role != "Quản lý") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được thêm sản phẩm");
      error.statusCode = 401;
      return next(error);
    }

    const _product = new Product({
      category,
      name,
      image,
      price,
    });
    await _product.save();

    res.status(201).json({ message: "Thêm sản phẩm thành công", product: _product.populate("category") });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { category, name, image, price } = req.body;
  const productId = req.params.productId;
  try {
    const role = await getRole(req.accountId);
    if (role != "Chủ quán" && role != "Quản lý") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được chỉnh sửa sản phẩm");
      error.statusCode = 401;
      return next(error);
    }
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      const error = new Error("Sản phẩm không tồn tại");
      error.statusCode = 401;
      return next(error);
    }
    currentProduct.category = category;
    currentProduct.name = name;
    currentProduct.image = image;
    currentProduct.price = price;
    await currentProduct.save();

    res.status(201).json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    if (role != "Chủ quán" && role != "Quản lý") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được xóa sản phẩm");
      error.statusCode = 401;
      return next(error);
    }
    const _product = await Product.findById(productId);
    if (!_product) {
      const error = new Error("Sản phẩm không tồn tại");
      error.statusCode = 404;
      return next(error);
    }
    const currentReceipts = await Receipt.find({ state: "Chưa thanh toán" });
    const currentProducts = await currentReceipts.filter((_receipt) =>
      _receipt.products.filter((_product) => _product.product == productId)
    );
    if (currentProducts) {
      const error = new Error("Không thể xóa sản phẩm đang phục vụ");
      error.statusCode = 422;
      return next(error);
    }
    await Product.findByIdAndRemove(productId);
    res.status(200).json({ message: "Xoá sản phẩm thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("category");

    res.status(200).json({ products });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const _product = await Product.findById(productId).populate("category");
    if (!_product) {
      const error = new Error("Bàn không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ product: _product });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
