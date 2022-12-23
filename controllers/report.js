const {receiptState, Receipt} = require("../models/receipt");
const {categoryName, Category} = require("../models/category");
const {productState, Product} = require("../models/product");

exports.getReportByDate = async (req, res, next) => {
  try {
    const report = {};
    const { date, month, year } = req.body;
    const reportDate = new Date(year, month - 1, date);
    reportDate.setHours(0,0,0,0);
    report.date = reportDate.toLocaleDateString('en-GB');
    const nextDate = new Date(reportDate);
    nextDate.setDate(reportDate.getDate() + 1);
    nextDate.setHours(0,0,0,0);
    const receipts = await Receipt.find({state: receiptState.PAID, updatedAt: {$gte: reportDate, $lt: nextDate}});
    report.products = [];
    report.totalPrice = 0;
    const productInReceipts = [];
    for(let receipt of receipts){
      for(let product of receipt.products){
        const existingProductIndex = report.products.findIndex(pro => pro.id == product.product);
        if(existingProductIndex != -1){
          report.products[existingProductIndex].name = product.name;
          report.products[existingProductIndex].price = product.price;
          report.products[existingProductIndex].quantity = report.products[existingProductIndex].quantity + product.quantity;
          report.products[existingProductIndex].totalPrice = report.products[existingProductIndex].totalPrice + product.price * product.quantity;
        }
        else{
          report.products.push({
            id: product.product.toString(),
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            totalPrice: product.price * product.quantity
          })
          productInReceipts.push(product.product.toString());
        }
        report.totalPrice = report.totalPrice + product.price * product.quantity;
      }
    }
    const products = await Product.find({state: productState.ACTIVE});
    const otherProducts = products.filter(product => !productInReceipts.includes(product._id.toString()));
    otherProducts.forEach(product => {
      report.products.push({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: 0,
        totalPrice: 0
      })
    })
    report.products.sort((a, b) => a.quantity - b.quantity);
    res.status(200).json({ report });
  } catch (err) {
    console.log(err)
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getReportByMonth = async (req, res, next) => {
  try {
    const report = {};
    const { month, year } = req.body;
    const startDate = new Date(year, month - 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    endDate.setHours(24,0,0,0);
    startDate.setHours(0,0,0,0);
    report.date = startDate.toLocaleDateString('en-GB');
    const receipts = await Receipt.find({state: receiptState.PAID, updatedAt: {$gte: startDate, $lt: endDate}});
    report.products = [];
    report.totalPrice = 0;
    const productInReceipts = [];
    for(let receipt of receipts){
      for(let product of receipt.products){
        const existingProductIndex = report.products.findIndex(pro => pro.id == product.product);
        if(existingProductIndex != -1){
          report.products[existingProductIndex].name = product.name;
          report.products[existingProductIndex].price = product.price;
          report.products[existingProductIndex].quantity = report.products[existingProductIndex].quantity + product.quantity;
          report.products[existingProductIndex].totalPrice = report.products[existingProductIndex].totalPrice + product.price * product.quantity;
        }
        else{
          report.products.push({
            id: product.product.toString(),
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            totalPrice: product.price * product.quantity
          })
          productInReceipts.push(product.product.toString());
        }
        report.totalPrice = report.totalPrice + product.price * product.quantity;
      }
    }
    const products = await Product.find({state: productState.ACTIVE});
    const otherProducts = products.filter(product => !productInReceipts.includes(product._id.toString()));
    otherProducts.forEach(product => {
      report.products.push({
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: 0,
        totalPrice: 0
      })
    })
    report.products.sort((a, b) => a.quantity - b.quantity);
    res.status(200).json({ report });
  } catch (err) {
    console.log(err)
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};