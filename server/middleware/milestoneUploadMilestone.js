// middleware/milestoneUploadMiddleware.js
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3.js";

const milestoneUpload = multer({
  storage: multerS3({
    s3,
    bucket: "learners-logue-profile-pictures", // ✅ reuse same bucket or create a new one
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, `milestones/${Date.now().toString()}_${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
    }
  },
});

export default milestoneUpload;
