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
  soldInDay: {
    type: Number,
    required: true,
  },
  soldInMonth: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Product", productSchema);
