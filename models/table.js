const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { tableStates } = require("../constants");

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
    enum: tableStates,
    default: tableStates.READY,
  },
});

module.exports = mongoose.model("Table", tableSchema);
