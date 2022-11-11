const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    enum: [
        "Còn trống",
        "Đang dùng",
    ],
    default: "Còn trống",
  }
});

module.exports = mongoose.model("Table", tableSchema);
