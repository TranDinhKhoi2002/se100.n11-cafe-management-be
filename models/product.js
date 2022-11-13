const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    enum: [
      "Đang bán",
      "Đã nghỉ"
    ],
    default: "Đang bán",
  }
});

module.exports = mongoose.model("Product", productSchema);
