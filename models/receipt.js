const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const receiptSchema = new Schema({
  table: {
    type: Schema.Types.ObjectId,
    ref: "Table",
    required: true,
  },
  products: [
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        productName: {
            type: String
        },
        price: {
            type: Number
        },
        quantity: {
            type: Number,
            required: true,
        }
    }
  ],
  state: {
    type: String,
    enum: [
      "Chưa thanh toán",
      "Đã thanh toán",
    ],
    default: "Chưa thanh toán",
  }
});

module.exports = mongoose.model("Receipt", receiptSchema);
