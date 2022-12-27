const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  products: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }],
});

exports.Category = mongoose.model("Category", categorySchema);
exports.categoryName = categoryName;
