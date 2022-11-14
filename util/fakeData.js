const { faker } = require("@faker-js/faker");
const bcryptjs = require("bcryptjs");
const { sample, sum } = require("lodash");

const Account = require("../models/account");
const Category = require("../models/category");
const Product = require("../models/product");
const Receipt = require("../models/receipt");
const Role = require("../models/role");
const Table = require("../models/table");
const User = require("../models/user");

exports.generateFakeData = async () => {
  const roles = [];
  ["Chủ quán", "Quản lý", "Nhân viên"].forEach(async (roleName) => { 
    const role = new Role({
      name: roleName,
      _id: faker.database.mongodbObjectId(),
    });
    roles.push(role);
    await role.save();
  });

    const account0 = new Account({
      username: faker.internet.userName(),
      password: bcryptjs.hashSync("111111", 12),
    });
    await account0.save();
 
    const user0 = new User({
      role: roles[0]._id,
      account: account0._id,
      name: faker.name.fullName(),
      address: faker.address.street() + " " + faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.number("03########"),
      gender: sample(["Nam", "Nữ"]),
      birthday: faker.date.birthdate({ min: 1970, max: 1997, mode: "year" }),
    });
    await user0.save();

    const account1 = new Account({
      username: faker.internet.userName(),
      password: bcryptjs.hashSync("111111", 12),
    });
    await account1.save();

    const user1 = new User({
      role: roles[1]._id,
      account: account1._id,
      name: faker.name.fullName(),
      address: faker.address.street() + " " + faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.number("03########"),
      gender: sample(["Nam", "Nữ"]),
      birthday: faker.date.birthdate({ min: 1975, max: 2000, mode: "year" }),
    });
    await user1.save();
  const staffs = []
  for (let i = 0; i < 5; i++) {
    const account = new Account({
      username: faker.internet.userName(),
      password: bcryptjs.hashSync("111111", 12),
    });
    await account.save();

    const user = new User({
      role: roles[2]._id,
      account: account._id,
      name: faker.name.fullName(),
      address: faker.address.street() + " " + faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.number("03########"),
      gender: sample(["Nam", "Nữ"]),
      birthday: faker.date.birthdate({ min: 1985, max: 2004, mode: "year" }),
    });
    staffs.push(user);
    await user.save();
}
const categories = [];
  ["Cà phê", "Đồ ăn vặt", "Khác"].forEach(async (categoryName) => {
    const category = new Category({
      name: categoryName,
      _id: faker.database.mongodbObjectId(),
    });
    categories.push(category);
    await category.save();
  });
  const products = [];
  ["Cà phê đen", "Cà phê sữa", "Bạc xỉu"].forEach(async (productName) => {
    const product = new Product({
      category: categories[0]._id,
      name: productName,
      image: faker.image.food(),
      price: faker.datatype.number({min: 20, max: 35})*1000,
      _id: faker.database.mongodbObjectId()
    });
    products.push(product);
    await product.save();
  });
  ["Bánh flan", "Kem trái cây tươi"].forEach(async (productName) => {
    const product = new Product({
      category: categories[1]._id,
      name: productName,
      image: faker.image.food(),
      price: faker.datatype.number({min: 20, max: 35})*1000,
      _id: faker.database.mongodbObjectId()
    });
    products.push(product);
    await product.save();
  });
  ["Trà sữa", "Pepsi", "Cacao"].forEach(async (productName) => {
    const product = new Product({
      category: categories[2]._id,
      name: productName,
      image: faker.image.food(),
      price: faker.datatype.number({min: 20, max: 35})*1000,
      _id: faker.database.mongodbObjectId()
    });
    products.push(product);
    await product.save();
  })

  const tables = []
  for(let i=1; i<=10; i++){
    var state1;
    if(i<3) state1 = "Đang dùng"
    else state1 = "Còn trống"
    const table = new Table({
      name: `Bàn ${i}`,
      state: state1,
      _id: faker.database.mongodbObjectId(),
    });
    tables.push(table);
    await table.save();
  }

  for(let i=0; i<2; i++){
    var total = 0;
    const _tables = [tables[i]._id];
    tables[i].state = "Đang dùng";
    const productsInReceipt = [];
    for(let j=0; j<3; j++){
      var _product = {};
      _product.product = products[i+j]._id;
      _product.name = products[i+j].name;
      _product.price = products[i+j].price;
      _product.quantity = faker.datatype.number({min: 1, max: 3});
      total = total + _product.price * _product.quantity;
      productsInReceipt.push(_product);
    }
    const receipt = new Receipt({
      tables: _tables,
      products: productsInReceipt,
      totalPrice: total,
      accountId: staffs[faker.datatype.number({min: 0, max: 4})].account,
      _id: faker.database.mongodbObjectId()
    })
    await receipt.save();
  }
};

exports.removeAllData = async () => {
  await Receipt.deleteMany();
  await Table.deleteMany();
  await Product.deleteMany();
  await Category.deleteMany();
  await User.deleteMany();
  await Account.deleteMany();
  await Role.deleteMany();
};