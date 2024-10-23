const { hashingPassword } = require("../utils/hashing");
const { generateToken } = require("../utils/Jwt");

class UserController {
  constructor(userReopsitory) {
    this.userReopsitory = userReopsitory;
  }

  async register(userData) {
    const hashedPassword = await hashingPassword(userData.password);
    userData.password = hashedPassword;
    const newUSer = await this.userReopsitory.register(userData);
    return newUSer;
  }

  async login(userData) {
    const { user, totalMovies, totalUsers } = await this.userReopsitory.login(
      userData
    );
    const token = generateToken(user, totalMovies, totalUsers);
    return token;
  }

  async changePassword(userData) {
    const hashedPassword = await hashingPassword(userData.newPassword);
    userData.newPassword = hashedPassword;
    const user = await this.userReopsitory.changePassword(userData);
    return user;
  }

  async updateProfile(userData, userAvatar) {
    const user = await this.userReopsitory.updateProfile(userData, userAvatar);
    const token = generateToken(user);
    return token;
  }

  async addToWatchlist(id, movieId) {
    const user = await this.userReopsitory.addToWatchlist(id, movieId);
    return user;
  }

  async removeFromWatchlist(id, movieId) {
    await this.userReopsitory.removeFromWatchlist(id, movieId);
    return;
  }

  async getWatchlist(id) {
    const movies = await this.userReopsitory.getWatchlist(id);
    return movies;
  }
}

module.exports = UserController;
