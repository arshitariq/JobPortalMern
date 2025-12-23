const upload = require('../config/multer');
const ApiError = require('../utils/ApiError');

const handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err.message && err.message.includes('Invalid file type')) {
    return next(new ApiError(400, err.message));
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(new ApiError(400, 'File size too large. Maximum 5MB allowed.'));
  }

  if (err.message && err.message.includes('Unexpected field')) {
    return next(new ApiError(400, 'Unexpected file field in upload.'));
  }

  console.error('Upload error:', err);
  return next(new ApiError(400, err.message || 'File upload failed'));
};

const isMultipartRequest = (req = {}) => {
  const header = req.headers?.['content-type'] || '';
  return header.toLowerCase().startsWith('multipart/form-data');
};

const runUpload = (handler, req, res, next) => {
  handler(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    return next();
  });
};

const createUploadMiddleware = (handler, { optional = false } = {}) => {
  return (req, res, next) => {
    if (optional && !isMultipartRequest(req)) {
      return next();
    }

    return runUpload(handler, req, res, next);
  };
};

const uploadSingle = (fieldName) =>
  createUploadMiddleware(upload.single(fieldName));

const optionalUploadSingle = (fieldName) =>
  createUploadMiddleware(upload.single(fieldName), { optional: true });

const uploadMultiple = (fieldName, maxCount) =>
  createUploadMiddleware(upload.array(fieldName, maxCount));

const uploadFields = (fields) =>
  createUploadMiddleware(upload.fields(fields));

module.exports = {
  uploadSingle,
  optionalUploadSingle,
  uploadMultiple,
  uploadFields,
};
