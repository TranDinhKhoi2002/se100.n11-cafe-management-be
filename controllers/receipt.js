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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        error.validationErrors = errors.array();
        return next(error);
    }
    // Create Receipt
    const accountId = req.body.accountId;
    const tableIds = [...req.body.tableIds];
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
            const error = new Error('Hoá đơn không tồn tại!');
            error.statusCode = 404;
            return next(error);
        }

        const accountId = req.body.accountId;
        const updatedTableIds = [...req.body.tableIds];
        const updatedProducts =  req.body.products.map(async (p) => {
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
                quantity: +p.quantity
            }
        });
        const updatedTotalPrice = updatedProducts.reduce(
            (result, product) => result + product.price * product.quantity,
            0
        );

        if (receipt.accountId.toString() !== accountId.toString()) {
            receipt.accountId = accountId;
        }
        receipt.tables = updatedTableIds;
        receipt.products = updatedProducts;
        receipt.totalPrice = updatedTotalPrice;

        await receipt.save();

        res.status(200).json({
            message: 'Chỉnh sửa hoá đơn thành công!',
            editedReceipt: receipt
        });
    } catch (err) {
        next(err);
    }
}

exports.removeReceipt = async (req, res, next) => {
    const receiptId = req.params.receiptId;
    const accountId = req.body.accountId;
    try {
        const updatedReceipt = await Receipt.findById(receiptId);
        if (!updatedReceipt) {
            const error = new Error('Hoá đơn không tồn tại!');
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
            message: 'Đã huỷ hoá đơn!'
        })
    } catch (err) {
        next(err);
    }
}

exports.payForReceipt = async (req, res, next) => {
    const receiptId = req.params.receiptId;

    try {
        const receipt = await Receipt.findById(receiptId);
        if (!receipt) {
            const error = new Error('Hoá đơn không tồn tại!');
            error.statusCode = 404;
            return next(error);
        }

        if (receipt.state === receiptState.CANCELED) {
            const error = new Error('Hoá đơn đã bị huỷ!');
            return next(err);
        }

        if (receipt.state !== receiptState.PAID) {
            receipt.state = receiptState.PAID;
        }

        if (receipt.accountId.toString() !== accountId.toString()) {
            receipt.accountId = accountId;
        }
        await receipt.save();
        res.status(200).json({
            message: 'Đã thanh toán hoá đơn!'
        })
    } catch (err) {
        next(err);
    }
}