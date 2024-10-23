const moviesModel = require("../Models/moviesModel");
const userModel = require("../Models/userModel");
const { saveToStorage } = require("../utils/firebaseStorage");
const { deleteFromStorage } = require("../utils/firebaseStorage");

class MoviesReposiotry {
  constructor(io) {
    this.io = io;
  }

  async getMovieById(id) {
    const movie = await moviesModel.findOne({
      _id: id,
      status: { $nin: ["pending", "rejected"] },
    });
    if (!movie) throw { statusCode: 404, message: "Movie not found" };
    return movie;
  }

  async getAllMovies() {
    const movies = await moviesModel.find({
      status: { $nin: ["pending", "rejected"] },
    });
    if (!movies) throw { statusCode: 404, message: "No movies found" };
    return movies;
  }

  async getMovie(userId, movieId) {
    const movie = await this.getMovieById(movieId);
    const user = await userModel.findById(userId);
    if (!user) throw { statusCode: 404, message: "User not found" };
    if (movie && !user.watchedMovies.includes(movieId)) {
      user.watchedMovies.push(movieId);
      await user.save();
    }
    return movie;
  }

  async addMovie(user, movieData, movieUploads) {
    if (!movieUploads.poster || !movieUploads.video) {
      throw {
        statusCode: 400,
        message: "Both poster and video must be provided",
      };
    }

    const poster = movieUploads.poster;
    const posterFolder = "moviesPosters";
    const returnedPoster = await saveToStorage(poster, posterFolder);
    movieData.poster = {
      src: returnedPoster.downloadURL,
      path: returnedPoster.fullPath,
    };

    const video = movieUploads.video;
    const videosFolder = "moviesVideo";
    const returnedVideo = await saveToStorage(video, videosFolder);
    movieData.video = {
      src: returnedVideo.downloadURL,
      path: returnedVideo.fullPath,
    };

    if (user.role === "ADMIN") {
      movieData.status = "approved";
    } else {
      movieData.status = "pending";
    }
    movieData.uploadedBy = user._id;
    const newMovie = new moviesModel(movieData);
    await newMovie.save();
    const adminUsers = await userModel.find({
      role: "ADMIN",
      socketId: { $exists: true },
    });
    adminUsers.forEach((admin) => {
      if (admin.socketId) {
        this.io.to(admin.socketId).emit("newMovie", {
          message: "A new movie has been added!",
          movie: newMovie,
          user: {
            avatar: user.avatar,
            name: user.name,
          },
        });
      }
    });
    return newMovie;
  }

  async updateMovie(id, movieData) {
    const updatedMovie = await moviesModel.findByIdAndUpdate(id, movieData, {
      new: true,
    });
    if (!updatedMovie) throw { statusCode: 404, message: "Movie not found" };
    return updatedMovie;
  }

  async deleteMovie(id) {
    const deletedMovie = await moviesModel.findByIdAndDelete(id);
    if (!deletedMovie) throw { statusCode: 404, message: "Movie not found" };
    await deleteFromStorage([
      deletedMovie.poster.path,
      deletedMovie.video.path,
    ]);
    if (!deletedMovie) throw { statusCode: 404, message: "Movie not found" };
    return deletedMovie;
  }

  async getPendingMovies() {
    const movies = await moviesModel.find({ status: "pending" });
    if (!movies || movies.length === 0) return [];
    return movies;
  }

  async search(movieData) {
    const { query } = movieData;
    const page = parseInt(movieData.page) || 1;
    const limit = parseInt(movieData.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: { $nin: ["pending", "rejected"] } };
    if (query) {
      filter.title = new RegExp(query, "i");
    } else {
      return [];
    }

    const movies = await moviesModel.find(filter).skip(skip).limit(limit);
    if (!movies) throw { statusCode: 404, message: "No movies found" };
    const total = await moviesModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    return { page, limit, totalPages, movies };
  }

  async popular(movieData) {
    const limit = parseInt(movieData.limit) || 10;
    const movies = await moviesModel
      .find({ status: { $nin: ["pending", "rejected"] } })
      .sort({ popularity: -1 })
      .limit(limit);
    if (!movies) throw { statusCode: 404, message: "No movies found" };
    return movies;
  }

  async topRated(movieData) {
    const limit = parseInt(movieData.limit) || 10;
    const movies = await moviesModel
      .find({ status: { $nin: ["pending", "rejected"] } })
      .sort({ rate: -1 })
      .limit(limit);
    if (!movies) throw { statusCode: 404, message: "No movies found" };
    return movies;
  }

  async pages(movieData) {
    const page = parseInt(movieData.page) || 1;
    const limit = parseInt(movieData.limit) || 10;
    const skip = (page - 1) * limit;
    let filter = { status: { $nin: ["pending", "rejected"] } };
    const { genre } = movieData;
    if (genre) {
      filter.genre = new RegExp(genre, "i");
    }
    const movies = await moviesModel.find(filter).skip(skip).limit(limit);
    if (!movies) throw { statusCode: 404, message: "No movies found" };
    const total = await moviesModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    return { page, limit, totalPages, movies };
  }

  async getRecommendations(id) {
    const user = await userModel.findById(id);
    if (!user) throw { statusCode: 404, message: "User not found" };
    const watchedMovies = await moviesModel.find({
      _id: { $in: user.watchedMovies },
      status: { $nin: ["pending", "rejected"] },
    });
    const watchedGenres = [
      ...new Set(watchedMovies.map((movie) => movie.genre).flat()),
    ];
    const recommendations = await moviesModel.aggregate([
      {
        $match: {
          genre: { $in: watchedGenres },
          _id: { $nin: user.watchedMovies },
        },
      },
      { $sample: { size: 10 } },
    ]);
    return recommendations;
  }
}

module.exports = MoviesReposiotry;
