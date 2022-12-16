const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tableState = {
  READY: "Còn trống",
  USING: "Đang dùng",
};

const tableSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  receipt: {
    type: Schema.Types.ObjectId,
    ref: "Receipt",
  },
  state: {
    type: String,
    enum: ["Còn trống", "Đang dùng"],
    default: "Còn trống",
  },
});

exports.Table = mongoose.model("Table", tableSchema);
exports.tableState = tableState;
