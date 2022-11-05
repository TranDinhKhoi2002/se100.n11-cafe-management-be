const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: {
    type: String,
    enum: [
      "Nhân viên",
      "Quản lý",
      "Chủ quán",
    ],
    required: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);
