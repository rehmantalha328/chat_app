const multer = require("multer");
var fs = require("fs")
const {
    v4
} = require("uuid");

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // let path = "public/images";
        // if (!fs.existsSync(path)) {
        //     fs.mkdirSync(path);
        //     console.log("created");
        //     cb(null, "public/images");
        // }
        // console.log("exixts");
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        // console.log("areeb 2");
        const ext = file.mimetype.split("/")[1];
        cb(null, `${v4()}-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image") && (file.mimetype.endsWith("jpg") || file.mimetype.endsWith("png") || file.mimetype.endsWith("jpeg"))) {
        cb(null, true)
    } else {
        req.file_error = "Not a Valid file ! please upload only jpg, jpeg, png files.";
        return cb(null, false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    // limits: {
    //     fileSize: 5242880,
    // }
});

module.exports = async function(req, res, next) {
    const _upload = upload.fields([{
        name: "profile",
        maxCount: 1
    }, {
        name: "gallery",
        maxCount: 10
    }]);
    _upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            req.files_error = err.message;
        } else if (err) {
            req.file_error = err;
        }
        next();
    });
};