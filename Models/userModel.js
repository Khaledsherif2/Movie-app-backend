const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcryptJs = require("bcryptjs");
const { connectToUsersDB } = require("./database");

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  avatar: { type: String },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movies" }],
  watchedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movies" }],
  socketId: { type: String },
});

userSchema.methods.comparePasswords = async function (password) {
  return await bcryptJs.compare(password, this.password);
};

const userModel = mongoose.model("Users", userSchema);

connectToUsersDB();
module.exports = userModel;
