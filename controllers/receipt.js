const Receipt = require('../models/receipt');
const Product = require('../models/product');

exports.getReceipts = async (req, res, next) => {
    try {
        const receipts = await Receipt.find();

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
            product = await Product.findOne({ _id: p.productId });
        } catch (err) {
            error.statusCode = error.statusCode || 500;
            next(error);
        }

        return {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: +p.quantity
        }
    });
    const price = products.reduce(
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
        error.statusCode = error.statusCode || 500;
        next(error);
    }
}