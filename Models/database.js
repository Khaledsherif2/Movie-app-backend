require("dotenv").config();
const mongoose = require("mongoose");

const UsersUri = process.env.MONGO_USERS_URL;
const connectToUsersDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(UsersUri);
    console.log("🚀 ~ connected to Users Database");
  } catch (e) {
    console.error("🚀 ~ connected to Users Database ~ error:", e);
    process.exit();
  }
};

const MoviesUri = process.env.MONGO_Movies_URL;
const connectToMoviesDB = mongoose.createConnection(MoviesUri);

connectToMoviesDB.on("connected", () => {
  console.log("🚀 ~ connected to Movies Database");
});

connectToMoviesDB.on("error", (e) => {
  console.error("🚀 ~ connected to Movies Database ~ error:", e);
});

module.exports = {
  connectToUsersDB,
  connectToMoviesDB,
};
