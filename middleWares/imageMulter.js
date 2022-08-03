const multer = require("multer");
var fs = require("fs");
const { v4 } = require("uuid");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store file in destination path cose goes here
  },
  filename: (req, file, cb) => {
    // Code goes here to add filenames
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image") &&
    (file.mimetype.endsWith("jpg") ||
      file.mimetype.endsWith("png") ||
      file.mimetype.endsWith("jpeg"))
  ) {
    cb(null, true);
  } else {
    req.file_error =
      "Not a Valid file ! please upload only jpg, jpeg, png files.";
    return cb(null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  // limits: {
  //     fileSize: 5242880,
  // }
});

module.exports = async function (req, res, next) {
  const _upload = upload.single("profile");
  _upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      req.files_error = err.message;
    } else if (err) {
      req.file_error = err;
    }
    next();
  });
};
