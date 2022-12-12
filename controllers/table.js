const { validationResult } = require("express-validator");
const Table = require("../models/table");
const Receipt = require("../models/receipt");

const { getRole } = require("../util/roles");

exports.createTable = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name } = req.body;
  try {
    const role = await getRole(req.accountId);
    if (role != "Chủ quán" && role != "Quản lý") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được thêm bàn");
      error.statusCode = 401;
      return next(error);
    }

    const _table = new Table({
      name,
    });
    await _table.save();

    res.status(201).json({ message: "Thêm bàn thành công", table: _table });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.updateTable = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name } = req.body;
  const tableId = req.params.tableId;
  try {
    const currentTable = await Table.findById(tableId);
    if (!currentTable) {
      const error = new Error("Bàn không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (name !== currentTable.name) {
      const existingTable = await Table.findOne({ name });
      if (existingTable) {
        const error = new Error("Tên bàn đã tồn tại");
        error.statusCode = 422;
        return next(error);
      }
    }

    currentTable.name = name;
    await currentTable.save();

    res.status(201).json({ message: "Cập nhật bàn thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteTable = async (req, res, next) => {
  const tableId = req.params.tableId;
  try {
    const role = await getRole(req.accountId);
    if (role != "Chủ quán" && role != "Quản lý") {
      const error = new Error("Chỉ có chủ quán hoặc quản lý mới được xóa bàn");
      error.statusCode = 401;
      return next(error);
    }
    const _table = await Table.findById(tableId);
    if (!_table) {
      const error = new Error("Bàn không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (_table.state == "Đang dùng" || _table.receipt) {
      const error = new Error("Không thể xóa bàn đang được sử dụng");
      error.statusCode = 422;
      return next(error);
    }

    await Table.findByIdAndRemove(tableId);
    res.status(200).json({ message: "Xoá bàn thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().populate("receipt");

    res.status(200).json({ tables });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getTableById = async (req, res, next) => {
  const tableId = req.params.tableId;
  try {
    const _table = await Table.findById(tableId).populate("receipt");
    if (!_table) {
      const error = new Error("Bàn không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ table: _table });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
