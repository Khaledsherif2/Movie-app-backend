const bcryptJs = require("bcryptjs");

const hashingPassword = async (userPassword) => {
  return await bcryptJs.hash(userPassword, 10);
};

module.exports = { hashingPassword };
