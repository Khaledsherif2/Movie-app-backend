const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { connectToMoviesDB } = require("./database");

const moviesSchema = new Schema({
  title: { type: String, unique: true },
  poster: { type: Object },
  description: { type: String },
  rate: { type: Number, min: 0, max: 10, unique: false },
  genre: { type: Array },
  popularity: { type: Number },
  video: { type: Object },
  year: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

module.exports = connectToMoviesDB.model("Movies", moviesSchema);
