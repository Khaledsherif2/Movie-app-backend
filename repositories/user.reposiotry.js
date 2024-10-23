const userModel = require("../Models/userModel");
const moviesModel = require("../Models/moviesModel");
const { saveToStorage } = require("../utils/firebaseStorage");
class UserRepository {
  constructor() {}

  async register(userData) {
    const checkExisting = await this.getUserByEmail(userData.email);
    if (checkExisting)
      throw {
        statusCode: 400,
        message: "This email is assigned to another user",
      };
    const newUSer = new userModel(userData);
    await newUSer.save();
    return newUSer;
  }

  async login(userData) {
    const user = await this.getUserByEmail(userData.email);
    if (!user) throw { statusCode: 401, message: "Invalid Email or Password" };
    let totalMovies = null;
    let totalUsers = null;
    if (user.role === "ADMIN") {
      totalMovies = await this.countMovies();
      totalUsers = await this.countUsers();
    }
    const isMatched = await user.comparePasswords(userData.password);
    if (!isMatched)
      throw { statusCode: 401, message: "Invalid Email or Password" };
    return { user, totalMovies, totalUsers };
  }

  async changePassword(userData) {
    const user = await this.getUserById(userData.id);
    const isMatched = await user.comparePasswords(userData.currentPassword);
    if (!isMatched)
      throw { statusCode: 400, message: "Current password is incorrect" };
    user.password = userData.newPassword;
    await user.save();
    return user;
  }

  async updateProfile(userData, userAvatar) {
    const user = await this.getUserById(userData.id);

    user.firstName = userData.firstName ? userData.firstName : user.firstName;
    user.lastName = userData.lastName ? userData.lastName : user.lastName;
    user.phone = userData.phone ? userData.phone : user.phone;

    if (userAvatar) {
      const avatar = userAvatar.avatar;
      const avatarFolder = "userImages";
      const avatarUrl = await saveToStorage(avatar, avatarFolder);
      user.avatar = avatarUrl.downloadURL;
    }

    await user.save();
    return user;
  }

  async getUserByEmail(email) {
    const user = await userModel.findOne({ email }, { __v: false });
    return user;
  }

  async getUserById(id) {
    const user = await userModel.findById(id);
    if (!user) throw { statusCode: 404, message: "User not found" };
    return user;
  }

  async addToWatchlist(id, movieId) {
    const user = await this.getUserById(id);
    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
      await user.save();
      return;
    } else {
      throw { statusCode: 409, message: "Movie already in watchlist" };
    }
  }

  async removeFromWatchlist(id, movieId) {
    const user = await this.getUserById(id);
    user.watchlist = user.watchlist.filter((id) => id.toString() !== movieId);
    await user.save();
    return;
  }

  async getWatchlist(id) {
    const user = await this.getUserById(id);
    const movies = await moviesModel.find({ _id: { $in: user.watchlist } });
    if (!movies) throw { statusCode: 404, message: "Movies not found" };
    return movies;
  }

  async updateSocketId(userId, socketId) {
    const user = await this.getUserById(userId);
    if (!user) throw { statusCode: 404, message: "User not found" };
    user.socketId = socketId;
    await user.save();
    return;
  }

  async deleteSocketId(socketId) {
    await userModel.findOneAndUpdate(
      { socketId: socketId },
      { $unset: { socketId: "" } }
    );
    return;
  }

  async countMovies() {
    return await moviesModel.countDocuments();
  }

  async countUsers() {
    return await userModel.countDocuments();
  }
}

module.exports = UserRepository;
