const Category = require("../models/category");
const Product = require("../models/product");
const Role = require("../models/role");
const Receipt = require("../models/receipt");
const User = require("../models/user");
const Table = require("../models/table");

exports.getDataForSelectBox = async(req, res, next) => {
    try{
        const data = {};
        data.categories = Category.schema.paths.name.enumValues;
        data.genders = User.schema.paths.gender.enumValues;
        data.productStates = Product.schema.paths.state.enumValues;
        data.receiptStates = Receipt.schema.paths.state.enumValues;
        data.roles = Role.schema.paths.name.enumValues;
        data.tableStates = Table.schema.paths.state.enumValues;
        res.status(200).json({data});
    }
    catch (err){
        const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
        error.statusCode = 500;
        next(error);
    }
}