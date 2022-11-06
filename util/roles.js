const User = require("../models/user");

exports.getRole = async (accountId) => {
  const existingUser = await User.findOne({ account: accountId }).populate(
    "role"
  );
  if (existingUser) {
    return existingUser.role.name;
  }
};
