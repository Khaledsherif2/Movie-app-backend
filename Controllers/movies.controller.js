class MoviesController {
  constructor(moviesRepository) {
    this.moviesRepository = moviesRepository;
  }

  async getAllMovies() {
    const movies = await this.moviesRepository.getAllMovies();
    return movies;
  }

  async getMovie(userId, movieId) {
    const movie = await this.moviesRepository.getMovie(userId, movieId);
    return movie;
  }

  async addMovie(user, movieData, movieUploads) {
    const newMovie = await this.moviesRepository.addMovie(
      user,
      movieData,
      movieUploads
    );
    return newMovie;
  }

  async updateMovie(id, movieData) {
    const updatedMovie = await this.moviesRepository.updateMovie(id, movieData);
    return updatedMovie;
  }

  async deleteMovie(id) {
    const deletedMovie = await this.moviesRepository.deleteMovie(id);
    return deletedMovie;
  }

  async getPendingMovies() {
    const movies = await this.moviesRepository.getPendingMovies();
    return movies;
  }

  async search(movieData) {
    const movies = await this.moviesRepository.search(movieData);
    return movies;
  }

  async popular(movieData) {
    const movies = await this.moviesRepository.popular(movieData);
    return movies;
  }

  async topRated(movieData) {
    const movies = await this.moviesRepository.topRated(movieData);
    return movies;
  }

  async pages(movieData) {
    const page = await this.moviesRepository.pages(movieData);
    return page;
  }

  async getRecommendations(id) {
    const movies = await this.moviesRepository.getRecommendations(id);
    return movies;
  }
}

module.exports = MoviesController;
