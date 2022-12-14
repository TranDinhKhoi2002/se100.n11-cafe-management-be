const Receipt = require("../models/receipt");
const Category = require("../models/category");
const Product = require("../models/product");
const User = require("../models/user");
const { receiptStates, roleNames } = require("../constants");
const { getRole } = require("../util/roles");
const { getProductsInfoByReceipts, getDailyReport, getMonthlyReport } = require("../util/report");

// exports.getReportByDate = async (req, res, next) => {
//   try {
//     const report = {};
//     const { date, month, year } = req.body;
//     const reportDate = new Date(year, month - 1, date);
//     reportDate.setHours(0,0,0,0);
//     report.date = reportDate.toLocaleDateString('en-GB');
//     const nextDate = new Date(reportDate);
//     nextDate.setDate(reportDate.getDate() + 1);
//     nextDate.setHours(0,0,0,0);
//     const receipts = await Receipt.find({state: receiptStates.PAID, updatedAt: {$gte: reportDate, $lt: nextDate}});
//     report.products = [];
//     report.totalQuantity = 0;
//     report.totalPrice = 0;
//     const productInReceipts = [];
//     for(let receipt of receipts){
//       for(let product of receipt.products){
//         const existingProductIndex = report.products.findIndex(pro => pro.id == product.product);
//         if(existingProductIndex != -1){
//           report.products[existingProductIndex].name = product.name;
//           report.products[existingProductIndex].price = product.price;
//           report.products[existingProductIndex].quantity = report.products[existingProductIndex].quantity + product.quantity;
//           report.products[existingProductIndex].totalPrice = report.products[existingProductIndex].totalPrice + product.price * product.quantity;
//         }
//         else{
//           const existingProduct = await Product.findById(product.product).populate("category");
//           report.products.push({
//             id: product.product.toString(),
//             name: product.name,
//             categoryName: existingProduct.category.name,
//             price: product.price,
//             quantity: product.quantity,
//             totalPrice: product.price * product.quantity
//           })
//           productInReceipts.push(product.product.toString());
//         }
//         report.totalQuantity = report.totalQuantity + product.quantity;
//         report.totalPrice = report.totalPrice + product.price * product.quantity;
//       }
//     }
//     const products = await Product.find({state: productStates.ACTIVE}).populate("category");
//     const otherProducts = products.filter(product => !productInReceipts.includes(product._id.toString()));
//     for(let product of otherProducts){
//       report.products.push({
//         id: product._id.toString(),
//         name: product.name,
//         categoryName: product.category.name,
//         price: product.price,
//         quantity: 0,
//         totalPrice: 0
//       })
//     }
//     report.products.sort((a, b) => a.quantity - b.quantity);
//     res.status(200).json({ report });
//   } catch (err) {
//     console.log(err)
//     const error = new Error("C?? l???i x???y ra, vui l??ng th??? l???i sau");
//     error.statusCode = 500;
//     next(error);
//   }
// };

// exports.getReportByMonth = async (req, res, next) => {
//   try {
//     const report = {};
//     const { month, year } = req.body;
//     const startDate = new Date(year, month - 1);
//     const endDate = new Date(year, month, 0);
//     endDate.setHours(24,0,0,0);
//     startDate.setHours(0,0,0,0);
//     report.date = startDate.toLocaleDateString('en-GB');
//     report.dateRevenues = [];
//     for(let currentDate = new Date(startDate); currentDate < endDate ; currentDate.setDate(currentDate.getDate() + 1)){
//       const nextDate = new Date(currentDate);
//       currentDate.setHours(0,0,0,0);
//       nextDate.setHours(24,0,0,0);
//       const dateReceipts = await Receipt.find({state: receiptStates.PAID, updatedAt: {$gte: currentDate, $lt: nextDate}});
//       var totalPrice = 0;
//       var totalQuantity = 0;
//       for(let receipt of dateReceipts){
//         totalPrice = totalPrice + receipt.totalPrice;
//         for(let product of receipt.products){
//           totalQuantity = totalQuantity + product.quantity;
//         }
//       }
//       report.dateRevenues.push({
//         totalPrice: totalPrice,
//         totalQuantity: totalQuantity
//       })
//     }
//     const receipts = await Receipt.find({state: receiptStates.PAID, updatedAt: {$gte: startDate, $lt: endDate}});
//     report.products = [];
//     report.totalQuantity = 0;
//     report.totalPrice = 0;
//     const productInReceipts = [];
//     for(let receipt of receipts){
//       for(let product of receipt.products){
//         const existingProductIndex = report.products.findIndex(pro => pro.id == product.product);
//         if(existingProductIndex != -1){
//           report.products[existingProductIndex].name = product.name;
//           report.products[existingProductIndex].price = product.price;
//           report.products[existingProductIndex].quantity = report.products[existingProductIndex].quantity + product.quantity;
//           report.products[existingProductIndex].totalPrice = report.products[existingProductIndex].totalPrice + product.price * product.quantity;
//         }
//         else{
//           const existingProduct = await Product.findById(product.product).populate("category");
//           report.products.push({
//             id: product.product.toString(),
//             name: product.name,
//             categoryName: existingProduct.category.name,
//             price: product.price,
//             quantity: product.quantity,
//             totalPrice: product.price * product.quantity
//           })
//           productInReceipts.push(product.product.toString());
//         }
//         report.totalQuantity = report.totalQuantity + product.quantity;
//         report.totalPrice = report.totalPrice + product.price * product.quantity;
//       }
//     }
//     const products = await Product.find({state: productStates.ACTIVE}).populate("category");
//     const otherProducts = products.filter(product => !productInReceipts.includes(product._id.toString()));
//     for(let product of otherProducts){
//       report.products.push({
//         id: product._id.toString(),
//         name: product.name,
//         categoryName: product.category.name,
//         price: product.price,
//         quantity: 0,
//         totalPrice: 0
//       })
//     }
//     report.products.sort((a, b) => a.quantity - b.quantity);
//     res.status(200).json({ report });
//   } catch (err) {
//     console.log(err)
//     const error = new Error("C?? l???i x???y ra, vui l??ng th??? l???i sau");
//     error.statusCode = 500;
//     next(error);
//   }
// };

// exports.getReportByYear = async (req, res, next) => {
//     try {
//         const { year } = req.body;
//         const startDate = new Date(year, 0, 1);
//         const endDate = new Date(year, 11, 31);
//         startDate.setHours(0,0,0,0);
//         endDate.setHours(24,0,0,0);
//         const report = {};
//         report.monthRevenues = [];
//         report.totalRevenue = 0;
//         report.totalQuantity = 0;
//         for(let month = 0; month < 12 ; month++){
//             const firstDate = new Date(year, month, 1);
//             const lastDate = new Date(year, month + 1, 0);
//             firstDate.setHours(0,0,0,0);
//             lastDate.setHours(24,0,0,0);
//             const monthReceipts = await Receipt.find({state: receiptStates.PAID, updatedAt: {$gte: firstDate, $lt: lastDate}});
//             var totalPrice = 0;
//             var totalQuantity = 0;
//             for(let receipt of monthReceipts){
//                 totalPrice = totalPrice + receipt.totalPrice;
//                 for(let product of receipt.products){
//                 totalQuantity = totalQuantity + product.quantity;
//                 }
//             }
//             report.monthRevenues.push({
//                 totalPrice: totalPrice,
//                 totalQuantity: totalQuantity
//             });
//             report.totalRevenue += totalPrice;
//             report.totalQuantity += totalQuantity;
//         }
//         res.status(200).json({ report });
//     } catch(err) {
//         const error = new Error("C?? l???i x???y ra, vui l??ng th??? l???i sau");
//         error.statusCode = 500;
//         next(error);
//     }
// }

// exports.getStatistic = async (req, res, next) => {
//     try {
//         const currentDate = new Date();
//         const nextDate = new Date();
//         currentDate.setHours(0,0,0,0);
//         nextDate.setHours(24,0,0,0);
//         const report = {};
//         report.revenue = 0;
//         report.quantity = 0;
//         report.products = [];
//         report.categories = [];
//         const users = await User.find().populate("role");
//         const staffs = users.filter(user => user.role.name != roleNames.OWNER);
//         report.staff = staffs.length;
//         const dateReceipts = await Receipt.find({state: receiptStates.PAID, updatedAt: {$gte: currentDate, $lt: nextDate}});
//         dateReceipts.forEach(receipt => {
//           report.revenue += receipt.totalPrice;
//           receipt.products.forEach(product => {
//             report.quantity += product.quantity;
//           })
//         })
//         const receipts = await Receipt.find({state: receiptStates.PAID});
//         const productInReceipts = [];
//         const categoryInReceipts = [];
//         for(let receipt of receipts){
//           for(let product of receipt.products){
//             const existingProductIndex = report.products.findIndex(pro => pro.id == product.product);
//             const existingProduct = await Product.findById(product.product).populate("category");
//             const existingCategoryIndex = report.categories.findIndex(category => category.id == existingProduct.category._id);
//             if(existingCategoryIndex != -1){
//               report.categories[existingCategoryIndex].quantity = report.categories[existingCategoryIndex].quantity + product.quantity;
//               report.categories[existingCategoryIndex].totalPrice = report.categories[existingCategoryIndex].totalPrice + product.price * product.quantity;
//             }
//             else{
//               report.categories.push({
//                 id: existingProduct.category._id.toString(),
//                 name: existingProduct.category.name,
//                 quantity: product.quantity,
//                 totalPrice: product.price * product.quantity
//               });
//               categoryInReceipts.push(existingProduct.category._id.toString());
//             }
//             if(existingProductIndex != -1){
//               report.products[existingProductIndex].name = product.name;
//               report.products[existingProductIndex].price = product.price;
//               report.products[existingProductIndex].quantity = report.products[existingProductIndex].quantity + product.quantity;
//               report.products[existingProductIndex].totalPrice = report.products[existingProductIndex].totalPrice + product.price * product.quantity;
//             }
//             else{
//               report.products.push({
//                 id: product.product.toString(),
//                 name: product.name,
//                 price: product.price,
//                 quantity: product.quantity,
//                 totalPrice: product.price * product.quantity
//               })
//               productInReceipts.push(product.product.toString());
//             }
//           }
//         }
//         const products = await Product.find({state: productStates.ACTIVE});
//         const otherProducts = products.filter(product => !productInReceipts.includes(product._id.toString()));
//         for(let product of otherProducts){
//           report.products.push({
//             id: product._id.toString(),
//             name: product.name,
//             quantity: 0,
//             totalPrice: 0
//           })
//         }
//         const categories = await Category.find();
//         const otherCategories = categories.filter(category => !categoryInReceipts.includes(category._id.toString()));
//         console.log(categoryInReceipts)
//         for(let category of otherCategories){
//           report.categories.push({
//             id: category._id.toString(),
//             name: category.name,
//             quantity: 0,
//             totalPrice: 0
//           })
//         }
//         report.products.sort((a, b) => a.quantity - b.quantity);
//         report.categories.sort((a, b) => a.totalPrice - b.totalPrice);
//         res.status(200).json({ report });
//     } catch (err) {
//         const error = new Error("C?? l???i x???y ra, vui l??ng th??? l???i sau");
//         error.statusCode = 500;
//         next(error);
//     }
// }

exports.getReportByDay = async (req, res, next) => {
  // check role
  const role = await getRole(req.accountId);
  if (role !== roleNames.OWNER) {
    const error = new Error("Ch??? c?? ch??? qu??n m???i ???????c xem b??o c??o!");
    error.statusCode = 401;
    return next(error);
  }

  const { day, month, year } = req.body;
  const startDate = new Date(year, month - 1, day);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  try {
    // get receipts paid on the day
    const receipts = await Receipt.find({
      state: receiptStates.PAID,
      updatedAt: { $gte: startDate, $lt: endDate },
    }).populate({
      path: "products",
      populate: {
        path: "product",
        select: "category",
        populate: {
          path: "category",
          select: "name",
        },
      },
    });

    // get product info by receipts
    const { products, remainingProducts, totalSales, totalRevenue } = await getProductsInfoByReceipts(receipts);

    const report = {};
    report.date = `${day}/${month}/${year}`;
    report.totalSales = totalSales;
    report.totalRevenue = totalRevenue;

    // sort by descending sales
    products.sort((a, b) => b.sales - a.sales);

    report.products = [...products, ...remainingProducts];

    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
};

exports.getReportByMonth = async (req, res, next) => {
  // check role
  const role = await getRole(req.accountId);
  if (role !== roleNames.OWNER) {
    const error = new Error("Ch??? c?? ch??? qu??n m???i ???????c xem b??o c??o!");
    error.statusCode = 401;
    return next(error);
  }

  const { month, year } = req.body;

  const startDate = new Date(year, month - 1);
  const endDate = new Date(year, month, 1);
  try {
    const report = {};
    report.month = `${month}/${year}`;
    const receipts = await Receipt.find({
      state: receiptStates.PAID,
      updatedAt: { $gte: startDate, $lt: endDate },
    }).populate({
      path: "products",
      populate: {
        path: "product",
        select: "category",
        populate: {
          path: "category",
          select: "name",
        },
      },
    });

    report.dailyReport = getDailyReport(startDate, endDate, receipts);

    // get product info by receipts
    const { products, remainingProducts, totalSales, totalRevenue } = await getProductsInfoByReceipts(receipts);

    // sort by descending sales
    products.sort((a, b) => b.sales - a.sales);

    report.products = [...products, ...remainingProducts];
    report.totalSales = totalSales;
    report.totalRevenue = totalRevenue;

    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
};

exports.getReportByYear = async (req, res, next) => {
  // check role
  const role = await getRole(req.accountId);
  if (role !== roleNames.OWNER) {
    const error = new Error("Ch??? c?? ch??? qu??n m???i ???????c xem b??o c??o!");
    error.statusCode = 401;
    return next(error);
  }

  const year = req.body.year;

  const report = {};
  const firstDate = new Date(year.toString());
  const firstDateOfNextYear = new Date((year + 1).toString());

  try {
    const receipts = await Receipt.find({
      state: receiptStates.PAID,
      updatedAt: { $gte: firstDate, $lt: firstDateOfNextYear },
    });
    report.monthlyReport = getMonthlyReport(1, 12, receipts);

    report.totalRevenue = 0;
    report.totalSales = 0;
    const monthlyData = Object.values(report.monthlyReport);
    for (const data of monthlyData) {
      report.totalRevenue += data.revenue;
      report.totalSales += data.sales;
    }

    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
};

exports.getStatistic = async (req, res, next) => {
  // check role
  const role = await getRole(req.accountId);
  if (role !== roleNames.OWNER) {
    const error = new Error("Ch??? c?? ch??? qu??n m???i ???????c xem b??o c??o!");
    error.statusCode = 401;
    return next(error);
  }

  const currentDate = new Date(Date.now());
  currentDate.setHours(0, 0, 0, 0);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);

  try {
    const report = {};
    report.currentDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
    report.numberOfStaff = (await User.find().countDocuments()) - 1; // except 1 Owner

    // INFOMATION OF CURRENT DATE
    // get receipts paid on the day
    const receiptsInCurrentDate = await Receipt.find({
      state: receiptStates.PAID,
      updatedAt: { $gte: currentDate, $lt: nextDate },
    }).populate({
      path: "products",
      populate: {
        path: "product",
        select: "category",
        populate: {
          path: "category",
          select: "name",
        },
      },
    });

    // get product info by receipts paid on current day
    const { totalSales: salesInCurrentDate, totalRevenue: revenueInCurrentDate } = await getProductsInfoByReceipts(
      receiptsInCurrentDate
    );

    report.currentDateData = { salesInCurrentDate, revenueInCurrentDate };

    // INFOMATION FOR ALL PAID RECEIPTS
    // get all paid receipts
    const receipts = await Receipt.find({ state: receiptStates.PAID, updatedAt: { $lt: nextDate } }).populate({
      path: "products",
      populate: {
        path: "product",
        select: "category",
        populate: {
          path: "category",
          select: "name",
        },
      },
    });
    // get product info by receipts
    const { products, remainingProducts, totalSales, totalRevenue } = await getProductsInfoByReceipts(receipts);

    const tmpProducts = products.reduce((res, product) => {
      res[product._id] = { sales: product.sales, revenue: product.revenue };
      return res;
    }, {});
    const tmpProductIds = Object.keys(tmpProducts);

    // categories info
    let categories = await Category.find();
    categories = categories.reduce((res, category) => {
      res[category.name] = { name: category.name, revenue: 0, sales: 0 };
      category.products.forEach((prod) => {
        if (tmpProductIds.includes(prod.toString())) {
          res[category.name].revenue += tmpProducts[prod.toString()].revenue;
          res[category.name].sales += tmpProducts[prod.toString()].sales;
        }
      });

      return res;
    }, {});
    report.categories = Object.values(categories);

    // sort by descending sales
    products.sort((a, b) => b.sales - a.sales);

    report.products = [...products, ...remainingProducts];

    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
};
