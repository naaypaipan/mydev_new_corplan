const router = require("express").Router();
const controllers = require("../../controllers/upload.controller");
const auth = require("../auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const fileFilter = function fileFilter(req, _file, cb) {
  const fileSize = parseInt(req.headers["content-length"]);

  console.log("file size", fileSize);
  if (fileSize > 1048576) {
    return cb(new Error("contents larger limit"));
  }
  cb(null, true);
};
const limits = {
  limits: {
    fieldNameSize: 300,
    fileSize: 1048576, // 10 Mb
  },
};
const upload = multer({ storage, fileFilter, limits });

router.post("/image", auth.required, controllers.onUpload);
router.post(
  "/file",
  auth.required,
  upload.single("file"),
  controllers.onUploadFile
);

module.exports = router;
