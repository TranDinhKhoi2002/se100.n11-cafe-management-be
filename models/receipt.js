const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { receiptStates } = require("../constants");

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
      enum: receiptStates,
      default: receiptStates.UNPAID,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
