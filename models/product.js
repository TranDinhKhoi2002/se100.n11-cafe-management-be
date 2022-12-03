const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productState = {
  ACTIVE: 'Đang bán',
  PAUSE: 'Nghỉ bán'
};

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
    enum: productState,
    default: productState.ACTIVE,
  }
});

module.exports = mongoose.model("Product", productSchema);
