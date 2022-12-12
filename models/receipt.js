const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const receiptState = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  CANCELED: "Đã huỷ",
};

const receiptSchema = new Schema(
  {
    tables: [
      {
        type: Schema.Types.ObjectId,
        ref: "Table",
        required: true,
      },
    ],
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      enum: ["Chưa thanh toán", "Đã thanh toán", "Đã huỷ"],
      default: "Chưa thanh toán",
    },
  },
  { timestamps: true }
);

exports.receiptState = receiptState;
exports.Receipt = mongoose.model("Receipt", receiptSchema);
