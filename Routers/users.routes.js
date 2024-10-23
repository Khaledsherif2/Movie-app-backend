const express = require("express");
const router = express.Router();
const authentication = require("../middleware/auth");
const upload = require("../middleware/imageUplaod");

const userRouter = (userController) => {
  router.post("/register", async (req, res, next) => {
    try {
      const user = await userController.register(req.body);
      return res
        .status(201)
        .json({ message: "user created successfully", user });
    } catch (e) {
      next(e);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const token = await userController.login(req.body);
      return res.status(200).json({
        message: "User logged in successfully",
        token,
      });
    } catch (e) {
      next(e);
    }
  });

  router.post("/changePassword", authentication, async (req, res, next) => {
    try {
      await userController.changePassword(req.body);
      return res.status(202).json({ message: "Password updated successfully" });
    } catch (e) {
      next(e);
    }
  });

  router.patch(
    "/updateUserProfile",
    authentication,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    async (req, res, next) => {
      try {
        const token = await userController.updateProfile(req.body, req.files);
        return res
          .status(202)
          .json({ message: "Profile updated successfully", token });
      } catch (e) {
        next(e);
      }
    }
  );

  router.post("/watchlist/:movieId", authentication, async (req, res, next) => {
    try {
      await userController.addToWatchlist(req.user._id, req.params.movieId);
      return res.status(200).json({ message: "Movie added to watchlist" });
    } catch (e) {
      next(e);
    }
  });

  router.delete(
    "/watchlist/:movieId",
    authentication,
    async (req, res, next) => {
      try {
        await userController.removeFromWatchlist(
          req.user._id,
          req.params.movieId
        );
        return res
          .status(200)
          .json({ message: "Movie removed from watchlist" });
      } catch (e) {
        next(e);
      }
    }
  );

  router.get("/watchlist", authentication, async (req, res, next) => {
    try {
      const movies = await userController.getWatchlist(req.user._id);
      return res.status(200).json({ message: "Watchlist", movies });
    } catch (e) {
      next(e);
    }
  });

  return router;
};
module.exports = userRouter;
