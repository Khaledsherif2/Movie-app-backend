const multer = require("multer");

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image", "video"];
  const fileType = file.mimetype.split("/")[0];
  if (allowedTypes.includes(fileType)) {
    return cb(null, true);
  } else {
    return cb({ status: 400, message: "File must be a Video" }, false);
  }
};

const videoUpload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = videoUpload;
