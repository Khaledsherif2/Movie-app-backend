const express = require("express");
const router = express.Router();
const authentication = require("../middleware/auth");
const videoUpload = require("../middleware/videoUpload");

const moviesRouter = (moviesController, io) => {
  router.get("/getAllMovies", authentication, async (req, res, next) => {
    try {
      const movies = await moviesController.getAllMovies();
      return res
        .status(200)
        .json({ message: "Movies fetched successfully", movies });
    } catch (e) {
      next(e);
    }
  });

  router.get("/movie/:movieId", authentication, async (req, res, next) => {
    try {
      const movie = await moviesController.getMovie(
        req.user._id,
        req.params.movieId
      );
      return res.status(200).json({ message: "Movie", movie });
    } catch (e) {
      next(e);
    }
  });

  router.post(
    "/movie",
    authentication,
    videoUpload.fields([
      { name: "poster", maxCount: 1 },
      { name: "video", maxCount: 1 },
    ]),
    async (req, res, next) => {
      try {
        const movie = await moviesController.addMovie(
          req.user,
          req.body,
          req.files
        );
        if (req.user.role === "ADMIN") {
          return res
            .status(201)
            .json({ message: "Movie added successfully", movie });
        } else {
          return res
            .status(201)
            .json({ message: "Waiting for Admin approval", movie });
        }
      } catch (e) {
        next(e);
      }
    }
  );

  router.put("/:id", authentication, async (req, res, next) => {
    try {
      const movie = await moviesController.updateMovie(req.params.id, req.body);
      return res.json({ message: "Movie updated successfully", movie });
    } catch (e) {
      next(e);
    }
  });

  router.patch("/:id/moderate", authentication, async (req, res, next) => {
    try {
      if (req.user.role === "ADMIN") {
        const { status } = req.body;
        if (status === "approved") {
          const movie = await moviesController.updateMovie(req.params.id, {
            status,
          });
          io.emit("newMovieReleased", {
            message: "A new movie has been released!",
            movie,
          });
          return res.status(200).json({ message: "Movie Relesed", movie });
        }
        if (status === "rejected") {
          await moviesController.deleteMovie(req.params.id, { status });
          return res.status(200).json({ message: "Movie Rejected", movie: [] });
        }
      } else {
        return res.status(403).json({ message: "You dont have permission" });
      }
    } catch (e) {
      next(e);
    }
  });

  router.delete("/:id", authentication, async (req, res, next) => {
    try {
      await moviesController.deleteMovie(req.params.id);
      return res.json({ message: "Movie deleted successfully", movie: [] });
    } catch (e) {
      next(e);
    }
  });

  router.get("/pending", authentication, async (req, res, next) => {
    try {
      const movies = await moviesController.getPendingMovies();
      res.status(200).json({ message: "Pending Movies", movies });
    } catch (e) {
      next(e);
    }
  });

  router.get("/search", authentication, async (req, res, next) => {
    try {
      const movies = await moviesController.search(req.query);
      return res.status(200).json({ message: "Search result", movies });
    } catch (e) {
      next(e);
    }
  });

  router.get("/popular", authentication, async (req, res, next) => {
    try {
      const movies = await moviesController.popular(req.query);
      return res.status(200).json({ message: "Popular movies", movies });
    } catch (e) {
      next(e);
    }
  });

  router.get("/top-rated", authentication, async (req, res, next) => {
    try {
      const movies = await moviesController.topRated(req.query);
      return res.status(200).json({ message: "Top-rated movies", movies });
    } catch (e) {
      next(e);
    }
  });

  router.get("/pages", authentication, async (req, res, next) => {
    try {
      const movies = await moviesController.pages(req.query);
      return res.status(200).json({ message: "pages", movies });
    } catch (e) {
      next(e);
    }
  });

  router.get("/recommendations", authentication, async (req, res, next) => {
    try {
      const movies = await moviesController.getRecommendations(req.user._id);
      return res.status(200).json({ message: "Recommendations", movies });
    } catch (e) {
      next(e);
    }
  });

  return router;
};
module.exports = moviesRouter;
