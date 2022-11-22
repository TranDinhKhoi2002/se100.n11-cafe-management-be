const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    enum: ["Cà phê", "Trà", "Đồ ăn vặt", "Khác"],
    required: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);
