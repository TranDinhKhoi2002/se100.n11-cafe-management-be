const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const Account = require('../models/account');
const Table = require('../models/table');
const receiptController = require('../controllers/receipt');
const isAuth = require("../middleware/is-auth");

router.get('/receipts', isAuth, receiptController.getReceipts);

router.post(
    '/receipt',
    isAuth,
    [
        body('accountId')
            .isMongoId()
            .custom((value, { req }) => {
                return Account.findById(value).then(accountDoc => {
                    if (!accountDoc) {
                        return new Promise.reject('Account không tồn tại.');
                    }
                });
            }),
        body('products')
            .notEmpty().withMessage('Hoá đơn phải có sản phẩm!')
            .custom((value, {req}) => {
                Array.from(value).forEach(p => {
                    if (p.quantity <= 0) {
                        return new Promise.reject(`Sản phẩm có id ${p.productId} phải có số lượng lớn hơn 0!`)
                    }
                })
            }),
        body('tableIds')
            .notEmpty().withMessage('Hoá đơn phải có bàn!')
            .custom((value, {req}) => {
                Array.from(value).forEach(tableId => {
                    return Table.findById(value).then(tableDoc => {
                        if (!tableDoc) {
                            return new Promise.reject(`Bàn với id ${tableDoc._id} không tồn tại.`);
                        }
                    });
                })
            }),
    ],
    receiptController.createReceipt
);

router.get('/receipts/:receiptId', isAuth, receiptController.getReceiptById);

router.put(
    '/receipts/:receiptId/edit',
    isAuth,
    [
        body('accountId')
            .isMongoId()
            .custom((value, { req }) => {
                return Account.findById(value).then(accountDoc => {
                    if (!accountDoc) {
                        return new Promise.reject('Account không tồn tại.');
                    }
                });
            }),
        body('products')
            .notEmpty().withMessage('Hoá đơn phải có sản phẩm!')
            .custom((value, {req}) => {
                Array.from(value).forEach(p => {
                    if (p.quantity <= 0) {
                        return new Promise.reject(`Sản phẩm có id ${p.productId} phải có số lượng lớn hơn 0!`)
                    }
                })
            }),
        body('tableIds')
            .notEmpty().withMessage('Hoá đơn phải có bàn!')
            .custom((value, {req}) => {
                Array.from(value).forEach(tableId => {
                    return Table.findById(value).then(tableDoc => {
                        if (!tableDoc) {
                            return new Promise.reject(`Bàn với id ${tableDoc._id} không tồn tại.`);
                        }
                    });
                })
            }),
    ],
    receiptController.editReceipt
);

router.put('/receipts/:receiptId/pay', isAuth, receiptController.payForReceipt);

router.put('/receipts/:receiptId/remove', isAuth, receiptController.removeReceipt);

module.exports = router;