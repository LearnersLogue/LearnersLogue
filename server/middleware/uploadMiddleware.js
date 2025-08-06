import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3.js";
import path from "path";

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".png", ".jpg", ".jpeg"].includes(ext)) {
    cb(null, true);
    /* console.log(
      `${process.env.AWS_ACCESS_KEY_ID}, ${process.env.AWS_SECRET_ACCESS_KEY}, ${process.env.AWS_BUCKET_NAME}, ${process.env.AWS_REGION}`
    )*/
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: "learners-logue-profile-pictures",
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `profile-pics/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

export default upload;
