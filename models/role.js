const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleName = {
  OWNER: 'Chủ quán',
  MANAGER: 'Quản lí',
  STAFF: 'Nhân viên'
};

const roleSchema = new Schema({
  name: {
    type: String,
    enum: roleName,
    required: true,
  },
});

exports.Role = mongoose.model("Role", roleSchema);
exports.roleName = roleName;
