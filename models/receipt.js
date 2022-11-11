const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const receiptSchema = new Schema({
  tables: [
    {
      tableId: {
        type: Schema.Types.ObjectId,
        ref: "Table",
        required: true,
      }
    }
  ],
  products: [
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
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
  totalPrice: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    enum: [
      "Chưa thanh toán",
      "Đã thanh toán",
      "Đã Huỷ"
    ],
    default: "Chưa thanh toán",
  },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Receipt", receiptSchema);
