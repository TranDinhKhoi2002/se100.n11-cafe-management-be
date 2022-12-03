const express = require('express');

const router = express.Router();

const receiptController = require('../controllers/receipt');
const isAuth = require("../middleware/is-auth");

router.get('/receipts', isAuth, receiptController.getReceipts);

router.post('/receipt', isAuth, receiptController.createReceipt);

router.get('/receipts/:receiptId', isAuth, receiptController.getReceiptById);

router.put('/receipts/:receiptId/edit', isAuth);

router.put('/receipts/:receiptId/pay', isAuth);

router.put('/receipts/:receiptId/remove', isAuth);

module.exports = router;