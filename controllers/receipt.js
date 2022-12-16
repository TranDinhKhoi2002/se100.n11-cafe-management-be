const { validationResult } = require("express-validator");
const { faker } = require("@faker-js/faker");

const { Receipt, receiptState } = require("../models/receipt");
const { Product } = require("../models/product");
const { Table } = require("../models/table");
const { getRole } = require("../util/roles");

exports.getReceipts = async (req, res, next) => {
  try {
    const role = await getRole(req.accountId);
    if (role !== "Chủ quán" && role !== "Quản lý" && role !== "Nhân viên") {
      const error = new Error("Chỉ có nội bộ quán mới được xem danh sách hóa đơn");
      error.statusCode = 401;
      return next(error);
    }

    const receipts = await Receipt.find()
      .populate("tables")
      .populate({ path: "products", populate: { path: "product" } });
    res.status(200).json({ receipts: receipts });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.createReceipt = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { tables, products, totalPrice } = req.body;
  const receiptId = faker.database.mongodbObjectId();
  try {
    tables.forEach(async (table) => {
      const currentTable = await Table.findById(table);
      if (!currentTable) {
        const error = new Error("Bàn không tồn tại");
        error.statusCode = 404;
        return next(error);
      }

      currentTable.receipt = receiptId;
      currentTable.state = "Đang dùng";
      await currentTable.save();
    });

    products.forEach(async (product) => {
      if (product.quantity <= 0) {
        const error = new Error("Mọi sản phẩm đều phải có số lượng lớn hơn 0");
        error.statusCode = 422;
        return next(error);
      }

      const currentProduct = await Product.findById(product.product);
      if (!currentProduct) {
        const error = new Error("Sản phẩm không tồn tại");
        error.statusCode = 404;
        return next(error);
      }
    });
    const receipt = new Receipt({ tables, products, totalPrice, _id: receiptId });
    await receipt.save();

    res.status(201).json({
      message: "Lưu hoá đơn thành công",
      receipt,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.getReceiptById = async (req, res, next) => {
  const receiptId = req.params.receiptId;
  try {
    const receipt = await Receipt.findById(receiptId)
      .populate("tables")
      .populate({ path: "products", populate: { path: "product" } });
    if (!receipt) {
      const error = new Error("Hoá đơn không tồn tại hoặc đã bị huỷ");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Lấy thông tin hoá đơn thành công!",
      receipt: receipt,
    });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.editReceipt = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const receiptId = req.params.receiptId;
  try {
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) {
      const error = new Error("Hoá đơn không tồn tại!");
      error.statusCode = 404;
      return next(error);
    }

    const accountId = req.body.accountId;
    const updatedTableIds = [...req.body.tableIds];
    const updatedProducts = req.body.products.map(async (p) => {
      let product;
      try {
        product = await Product.findById(p.productId);
      } catch (err) {
        return next(err);
      }

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: +p.quantity,
      };
    });
    const updatedTotalPrice = updatedProducts.reduce((result, product) => result + product.price * product.quantity, 0);

    if (receipt.accountId.toString() !== accountId.toString()) {
      receipt.accountId = accountId;
    }
    receipt.tables = updatedTableIds;
    receipt.products = updatedProducts;
    receipt.totalPrice = updatedTotalPrice;

    await receipt.save();

    res.status(200).json({
      message: "Chỉnh sửa hoá đơn thành công!",
      editedReceipt: receipt,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.removeReceipt = async (req, res, next) => {
  const receiptId = req.params.receiptId;
  const accountId = req.body.accountId;
  try {
    const updatedReceipt = await Receipt.findById(receiptId);
    if (!updatedReceipt) {
      const error = new Error("Hoá đơn không tồn tại!");
      error.statusCode = 404;
      return next(error);
    }
    // update state
    if (updatedReceipt.state !== receiptState.CANCELED) {
      updatedReceipt.state = receiptState.CANCELED;
    }

    // update account id who removed receipt
    if (updatedReceipt.accountId.toString() !== accountId.toString()) {
      updatedReceipt.accountId = accountId;
    }
    await updatedReceipt.save();
    res.status(200).json({
      message: "Đã huỷ hoá đơn!",
    });
  } catch (err) {
    next(err);
  }
};

exports.payForReceipt = async (req, res, next) => {
  const receiptId = req.params.receiptId;

  try {
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) {
      const error = new Error("Hoá đơn không tồn tại!");
      error.statusCode = 404;
      return next(error);
    }

    if (receipt.state === receiptState.CANCELED) {
      const error = new Error("Hoá đơn đã bị huỷ!");
      error.statusCode = 422;
      return next(error);
    }

    if (receipt.state !== receiptState.PAID) {
      receipt.state = receiptState.PAID;

      receipt.tables.forEach(async (table) => {
        const currentTable = await Table.findById(table);
        currentTable.state = "Còn trống";
        currentTable.receipt = undefined;
        await currentTable.save();
      });
    }
    await receipt.save();

    res.status(200).json({ message: "Thanh toán thành công" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};
