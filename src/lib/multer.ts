import { Request } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeType = ['image/png', 'image/webp', 'image/jpeg'];
  if (allowedMimeType.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP files are allowed'));
  }
};

const limits = { fileSize: 5 * 1024 * 1024 }; //5MB max
const upload = multer({ storage, fileFilter, limits });

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10); // max 10 files;
