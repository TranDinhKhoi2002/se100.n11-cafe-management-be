const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoryName = {
  COFFEE: 'Cà phê',
  TEA: 'Trà',
  SNACK: 'Đồ ăn vặt',
  OTHER: 'Khác'
};

const categorySchema = new Schema({
  name: {
    type: String,
    enum: categoryName,
    required: true,
  },
});

exports.Category = mongoose.model("Category", categorySchema);
exports.categoryName = categoryName;
