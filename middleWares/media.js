const multer = require("multer");
var fs = require("fs");
const { v4 } = require("uuid");
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let path = "media/";
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path);
          cb(null, "media/");
        }
        cb(null, "media/");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${v4()}-${Date.now()}.${ext}`);
    },
});
    
const multerFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith("image") &&
        (file.mimetype.endsWith("jpg") ||
            file.mimetype.endsWith("jpeg") ||
            file.mimetype.endsWith("png"))
    ) {

        cb(null, true);
    } else if (
        file.mimetype.startsWith("video") &&
        (file.mimetype.endsWith("mp4") || file.mimetype.endsWith("matroska") ||
            file.mimetype.endsWith("mpeg")
        )
    ) {
        cb(null, true);
    } else if (
        file.mimetype.startsWith("audio") &&
        (file.mimetype.endsWith("mp3") || file.mimetype.endsWith("ogg"))
    ) {
        cb(null, true);
    } else if (
        file.mimetype.startsWith("application") &&
        (file.mimetype.endsWith("msword") || file.mimetype.endsWith("pdf") ||
            file.mimetype.endsWith("document") || file.mimetype.endsWith("presentation")
        )
    ) {
        cb(null, true);
    }
    else {
        req.file_error = "File Format Does Not Supported!";
        return cb(null, false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    // limits: {
    //     fileSize: 1048576,
    // },
});

module.exports = async function(req, res, next) {
    const upload_ = upload.array("media",10);
    upload_(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            req.file_error = err.message;
        } else if (err) {
            req.file_error = err;
        }
        next();
    });
};