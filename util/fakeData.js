const { faker } = require("@faker-js/faker");
const bcryptjs = require("bcryptjs");
const { sample, sum } = require("lodash");

const Account = require("../models/account");
const Category = require("../models/category");
const product = require("../models/product");
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
      account: account0._id,
      name: faker.name.fullName(),
      address: faker.address.street() + " " + faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.number("03########"),
      gender: sample(["Nam", "Nữ"]),
      birthday: faker.date.birthdate({ min: 1975, max: 2000, mode: "year" }),
    });
    await user1.save();

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
  const products = []
  ["Cà phê đen", "Cà phê sữa", "Bạc xỉu"].forEach(async (productName) => {
    const product = new Product({
      category: categories[0]._id,
      name: productName,
      image: faker.image.food(),
      price: faker.datatype.number({min: 20, max: 35})*1000,
      _id: faker.database.mongodbObjectId()
    })
    products.push(product);
    await product.save();
  })
  ["Bánh flan", "Kem trái cây tươi"].forEach(async (productName) => {
    const product = new Product({
      category: categories[1]._id,
      name: productName,
      image: faker.image.food(),
      price: faker.datatype.number({min: 20, max: 35})*1000,
      _id: faker.database.mongodbObjectId()
    })
    products.push(product);
    await product.save();
  })
  ["Trà sữa", "Pepsi", "Cacao"].forEach(async (productName) => {
    const product = new Product({
      category: categories[2]._id,
      name: productName,
      image: faker.image.food(),
      price: faker.datatype.number({min: 20, max: 35})*1000,
      _id: faker.database.mongodbObjectId()
    })
    products.push(product);
    await product.save();
  })

  const tables = []
  for(let i=1; i<=10; i++){
    const table = new Table({
      name: `Bàn ${i}`,
      _id: faker.database.mongodbObjectId(),
    });
    tables.push(table);
    await table.save();
  }

  const receipts = []
  for(let i=0; i<2; i++){
    const productsInfo = []
    for(let j=0; j<3; j++){
      products.push({
        product: products[faker.datatype.number({min: 0, max: 7})]._id,
        productName: product.name,
        price: product.price,
        quantity: faker.datatype.number({min: 1, max: 3})
      })
    }
    const receipt = new Receipt({
      table: tables[i]._id,
      products: 
    })
  }

    const grade = grades[faker.datatype.number({ min: 0, max: 2 })];
    const schoolYear = faker.datatype.number({
      min: 2015,
      max: new Date().getFullYear(),
    });
    const _class = new Class({
      grade: grade._id,
      teacher: teacher._id,
      name: grade.name + "A" + faker.datatype.number({ min: 1, max: 8 }),
      schoolYear: schoolYear,
      semester: semesters[faker.datatype.number({ min: 0, max: 1 })],
      students: studentIds,
      _id: classId,
    });
    await _class.save();

    [...Array(20)].forEach(async (_, index) => {
      let semesterId = semesters[0]._id;
      if (index >= 10) {
        semesterId = semesters[1]._id;
      }

      const classScore = new ClassScore({
        class: _class._id,
        subject: index >= 10 ? subjects[index - 10]._id : subjects[index]._id,
        semester: semesterId,
        schoolYear: schoolYear,
        studentScores: [],
      });
      await classScore.save();

      const studentScoreIds = [];
      studentIds.forEach(async (id) => {
        const studentScore = new StudentScore({
          student: id,
          classScore: classScore._id,
          scores: {
            oral: [...Array(5)].map((_) => faker.datatype.float({ min: 0, max: 10, precision: 0.25 })),
            m15: [...Array(5)].map((_) => faker.datatype.float({ min: 0, max: 10, precision: 0.25 })),
            m45: [...Array(3)].map((_) => faker.datatype.float({ min: 0, max: 10, precision: 0.25 })),
            final: faker.datatype.float({ min: 0, max: 10, precision: 0.25 }),
          },
        });
        studentScoreIds.push(studentScore._id);
        await studentScore.save();
      });

      classScore.studentScores = studentScoreIds;
      await classScore.save();
    });
  }