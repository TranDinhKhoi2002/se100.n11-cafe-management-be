const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const receiptState = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  CANCELED: 'Đã huỷ',
};

const receiptSchema = new Schema({
  tables: [
      {
        type: Schema.Types.ObjectId,
        ref: "Table",
        required: true,
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
    enum: receiptState,
    default: receiptState.UNPAID,
  },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true
  }
}, { timestamps: true });

exports.Receipt = mongoose.model("Receipt", receiptSchema);
exports.receiptState = receiptState;