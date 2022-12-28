const Product = require("../models/product");
const { productStates } = require("../constants");

exports.getProductsInfoByReceipts = async (receipts) => {
  let totalSales = 0;
  let totalRevenue = 0;
  const productsTmp = receipts.reduce((res, receipt) => {
    totalRevenue += receipt.totalPrice;
    return [...res, ...receipt.products];
  }, []);

  let products = [];
  let remainingProducts = [];
  try {
    const productsInReceipts = {};
    for (const prod of productsTmp) {
      const prodId = prod.product._id.toString();
      if (!productsInReceipts[prodId]) {
        productsInReceipts[prodId] = {
          _id: prodId,
          name: prod.name,
          category: prod.product.category.name,
          price: prod.price,
          sales: prod.quantity,
          revenue: prod.price * prod.quantity,
        };
      } else {
        productsInReceipts[prodId].sales += prod.quantity;
        productsInReceipts[prodId].revenue += prod.price * prod.quantity;
      }

      totalSales += prod.quantity;
    }
    const productIdsInReceipts = Object.keys(productsInReceipts);
    remainingProducts = await Product.find({ state: productStates.ACTIVE, _id: { $nin: productIdsInReceipts } }).populate("category", "name");
    remainingProducts = remainingProducts.map((prod) => ({
      _id: prod._id.toString(),
      name: prod.name,
      category: prod.category.name,
      price: prod.price,
      sales: 0,
      revenue: 0,
    }));
    products = Object.values(productsInReceipts);
  } catch (err) {
    throw err;
  }

  return { products , remainingProducts, totalSales, totalRevenue };
};

exports.getDailyReport = (startDate, endDate, receipts) => {
    const dailyReport = {};
    for (const currDate = startDate; currDate < endDate; currDate.setDate(currDate.getDate() + 1)) {
        dailyReport[currDate.getDate()] = { revenue: 0, sales: 0 };
    }
    for (const receipt of receipts) {
        dailyReport[receipt.updatedAt.getDate()].revenue += receipt.totalPrice;
        dailyReport[receipt.updatedAt.getDate()].sales += receipt.products.reduce((res, prod) => res + prod.quantity, 0);
    }

    return dailyReport;
}

exports.getMonthlyReport = (startMonth, endMonth, receipts) => {
    const monthlyReport = {};
    for (let month = startMonth; month <= endMonth; month++) {
        monthlyReport[month] = { revenue: 0, sales: 0 };
    }
    for (const receipt of receipts) {
        monthlyReport[receipt.updatedAt.getMonth() + 1].revenue += receipt.totalPrice;
        monthlyReport[receipt.updatedAt.getMonth() + 1].sales += receipt.products.reduce((res, prod) => res + prod.quantity, 0);
    }

    return monthlyReport;
}
