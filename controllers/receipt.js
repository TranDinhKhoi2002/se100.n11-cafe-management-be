const { Receipt, receiptState } = require('../models/receipt');
const Product = require('../models/product');

exports.getReceipts = async (req, res, next) => {
    try {
        const receipts = await Receipt.find().populate('tables');

        res.status(200).json({
            receipts: receipts
        });
    }
    catch (err) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
}

exports.createReceipt = async (req, res, next) => {
    // Check errors

    // Create Receipt
    const tableIds = [...req.body.tableIds];
    const accountId = req.accountId;
    const products =  req.body.products.map(async (p) => {
        let product;
        try {
            product = await Product.findById(p.productId);
        } catch (err) {
            err.statusCode = err.statusCode || 500;
            next(err);
        }

        return {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: +p.quantity
        }
    });
    const totalPrice = products.reduce(
        (result, product) => result + product.price * product.quantity,
        0
    );
    const newReceipt = Receipt.create({
        tables: tableIds,
        products: products,
        totalPrice: totalPrice,
        accountId: accountId
    });
    try {
        const savedReceipt = await newReceipt.save();
        res.status(201).json({
            message: 'Lưu hoá đơn thành công!',
            receipt: savedReceipt
        });
    } catch (err) {
        err.statusCode = err.statusCode || 500;
        next(err);
    }
}

exports.getReceiptById = async (req, res, next) => {
    const receiptId = req.params.receiptId;
    try {
        const receipt = await Receipt.findById(receiptId).populate('tables');
        if (!receipt) {
            const error = new Error('Hoá đơn không tồn tại hoặc đã bị huỷ');
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({
            message: 'Lấy thông tin hoá đơn thành công!',
            receipt: receipt
        });
    } catch (err) {
        err.statusCode = err.statusCode || 500;
        next(err);
    }
}

exports.changeReceiptState = async (req, res, next) => {
    const receiptId = req.params.receiptId;
    const state = +req.query.state;
    try {
        const updatedReceipt = await Receipt.findById(receiptId);
        if (!updatedReceipt) {
            const error = new Error('Hoá đơn không tồn tại hoặc đã bị huỷ');
            error.statusCode = 404;
            return next(error);
        }
        // update state -> 1: 'Đã thanh toán' || 2: 'Đã Huỷ'
        if (state === 1) {
            updatedReceipt.state = receiptState.UNPAID;
        } else if (state === 2) {
            updatedReceipt.state = receiptState.CANCELED;
        } else {
            const error = new Error('Tình trạng của hoá đơn không hợp lệ!');
            error.statusCode = 404;
            return next(error);
        }
        await updatedReceipt.save();
        res.json({
            message: ''
        })
    } catch (err) {
        err.statusCode = err.statusCode || 500;
        next(err);
    }
}