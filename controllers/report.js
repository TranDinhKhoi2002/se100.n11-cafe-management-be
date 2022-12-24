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
    report.totalQuantity = 0;
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
          const existingProduct = await Product.findById(product.product).populate("category");
          report.products.push({
            id: product.product.toString(),
            name: product.name,
            categoryName: existingProduct.category.name,
            price: product.price,
            quantity: product.quantity,
            totalPrice: product.price * product.quantity
          })
          productInReceipts.push(product.product.toString());
        }
        report.totalQuantity = report.totalQuantity + product.quantity;
        report.totalPrice = report.totalPrice + product.price * product.quantity;
      }
    }
    const products = await Product.find({state: productState.ACTIVE}).populate("category");
    const otherProducts = products.filter(product => !productInReceipts.includes(product._id.toString()));
    for(let product of otherProducts){
      report.products.push({
        id: product._id.toString(),
        name: product.name,
        categoryName: product.category.name,
        price: product.price,
        quantity: 0,
        totalPrice: 0
      })
    }
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
    const endDate = new Date(year, month, 0);
    endDate.setHours(24,0,0,0);
    startDate.setHours(0,0,0,0);
    report.date = startDate.toLocaleDateString('en-GB');
    report.dateRevenues = [];
    for(let currentDate = new Date(startDate); currentDate < endDate ; currentDate.setDate(currentDate.getDate() + 1)){
      const nextDate = new Date(currentDate);
      currentDate.setHours(0,0,0,0);
      nextDate.setHours(24,0,0,0);
      const dateReceipts = await Receipt.find({state: receiptState.PAID, updatedAt: {$gte: currentDate, $lt: nextDate}});
      var totalPrice = 0;
      var totalQuantity = 0;
      for(let receipt of dateReceipts){
        totalPrice = totalPrice + receipt.totalPrice;
        for(let product of receipt.products){
          totalQuantity = totalQuantity + product.quantity;
        }
      }
      report.dateRevenues.push({
        totalPrice: totalPrice,
        totalQuantity: totalQuantity
      })
    }
    const receipts = await Receipt.find({state: receiptState.PAID, updatedAt: {$gte: startDate, $lt: endDate}});
    report.products = [];
    report.totalQuantity = 0;
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
          const existingProduct = await Product.findById(product.product).populate("category");
          report.products.push({
            id: product.product.toString(),
            name: product.name,
            categoryName: existingProduct.category.name,
            price: product.price,
            quantity: product.quantity,
            totalPrice: product.price * product.quantity
          })
          productInReceipts.push(product.product.toString());
        }
        report.totalQuantity = report.totalQuantity + product.quantity;
        report.totalPrice = report.totalPrice + product.price * product.quantity;
      }
    }
    const products = await Product.find({state: productState.ACTIVE}).populate("category");
    const otherProducts = products.filter(product => !productInReceipts.includes(product._id.toString()));
    for(let product of otherProducts){
      report.products.push({
        id: product._id.toString(),
        name: product.name,
        categoryName: product.category.name,
        price: product.price,
        quantity: 0,
        totalPrice: 0
      })
    }
    report.products.sort((a, b) => a.quantity - b.quantity);
    res.status(200).json({ report });
  } catch (err) {
    console.log(err)
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};