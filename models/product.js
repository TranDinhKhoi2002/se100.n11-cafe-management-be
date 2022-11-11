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
    required: true,
    enum: [
      "Đang bán",
      "Đã nghỉ"
    ]
  }
});

module.exports = mongoose.model("Product", productSchema);
