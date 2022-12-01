const express = require('express');

const router = express.Router();

const receiptController = require('../controllers/receipt');
const isAuth = require("../middleware/is-auth");

router.get('/receipts', isAuth, receiptController.getReceipts);

router.post('/receipt', isAuth, receiptController.createReceipt);

module.exports = router;