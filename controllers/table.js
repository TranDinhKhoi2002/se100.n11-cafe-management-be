const { validationResult } = require("express-validator");
const { Table, tableState } = require("../models/table");
const { Receipt } = require("../models/receipt");
const { faker } = require("@faker-js/faker");

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

exports.moveTable = async (req, res, next) => {
  const tableId = req.params.tableId;
  const { targetedTableId } = req.body;
  try {
    const movedTable = await Table.findById(tableId);
    if (!movedTable) {
      const error = new Error("Bàn muốn chuyển không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    const targetedTable = await Table.findById(targetedTableId);
    if (!targetedTable) {
      const error = new Error("Bàn đã chọn không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    targetedTable.receipt = movedTable.receipt;
    targetedTable.state = tableState.USING;
    await targetedTable.save();

    const currentReceipt = await Receipt.findById(movedTable.receipt);
    if (!currentReceipt) {
      const error = new Error("Hóa đơn không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    currentReceipt.tables.pull(movedTable._id);
    currentReceipt.tables.push(targetedTable._id);
    await currentReceipt.save();

    movedTable.receipt = undefined;
    movedTable.state = tableState.READY;
    await movedTable.save();

    res.status(200).json({ message: "Chuyển bàn thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.mergeTable = async (req, res, next) => {
  const { tableIds } = req.body;
  try {
    const newReceiptId = faker.database.mongodbObjectId();

    const selectedTable = await Table.findById(tableIds[tableIds.length - 1]);
    const selectedReceipt = await Receipt.findById(selectedTable.receipt);
    const products = [...selectedReceipt.products];

    const existingTableIds = [];
    if (selectedReceipt.tables.length > 1) {
      for (let i = 0; i < selectedReceipt.tables.length; i++) {
        const tableId = selectedReceipt.tables[i];
        if (tableId.toString() !== tableIds[tableIds.length - 1]) {
          existingTableIds.push(tableId);
        }

        const currentTable = await Table.findById(tableId);
        currentTable.receipt = newReceiptId;
        await currentTable.save();
      }
    }

    for (let i = 0; i < tableIds.length; i++) {
      const currentTable = await Table.findById(tableIds[i]);
      if (!currentTable) {
        const error = new Error("Bàn đã chọn không tồn tại");
        error.statusCode = 404;
        return next(error);
      }

      const currentReceipt = await Receipt.findById(currentTable.receipt);
      if (currentReceipt !== null && currentReceipt._id.toString() !== selectedReceipt._id.toString()) {
        currentReceipt.products.forEach((product) => {
          const existingProductIndex = products.findIndex(
            (item) => item.product.toString() === product.product.toString()
          );
          if (existingProductIndex >= 0) {
            products[existingProductIndex].quantity += product.quantity;
          } else {
            products.push(product);
          }
        });
        await Receipt.findByIdAndRemove(currentTable.receipt);
      }

      currentTable.state = tableState.USING;
      currentTable.receipt = newReceiptId;
      await currentTable.save();
    }

    await Receipt.findByIdAndRemove(selectedTable.receipt);
    tableIds.push(...existingTableIds);

    const totalPrice = products.reduce((acc, cur) => {
      return acc + cur.quantity * cur.price;
    }, 0);

    const newReceipt = new Receipt({
      tables: tableIds,
      products,
      totalPrice,
      _id: newReceiptId,
    });
    await newReceipt.save();

    res.status(201).json({ message: "Gộp bàn thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().populate({ path: "receipt", populate: { path: "tables" } });

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
