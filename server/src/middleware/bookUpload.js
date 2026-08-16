import multer from 'multer';
import AppError from '../utils/appError.js';

const allowedCoverMimeTypes = [
  'application/octet-stream',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const allowedCoverExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const allowedPdfMimeTypes = ['application/pdf', 'application/octet-stream'];

const getFileExtension = (filename = '') =>
  filename.split('.').pop()?.toLowerCase();

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const extension = getFileExtension(file.originalname);

  if (
    file.fieldname === 'coverImage' &&
    allowedCoverMimeTypes.includes(file.mimetype) &&
    allowedCoverExtensions.includes(extension)
  )
  {
    return cb(null, true);
  }

  if (
    file.fieldname === 'pdf' &&
    allowedPdfMimeTypes.includes(file.mimetype) &&
    extension === 'pdf'
  )
  {
    return cb(null, true);
  }

  return cb(new AppError('Only image cover files and PDF book files are allowed', 400));
};

export const uploadBookFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);
