const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    enum: [
      "Cà phê",
      "Đồ ăn vặt",
      "Khác"
    ],
    required: true,
  }
});

module.exports = mongoose.model("Category", categorySchema);
