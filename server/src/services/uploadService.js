const fs = require('fs').promises;
const path = require('path');

const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const serverBaseUrl = (() => {
  const defaultLocal = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
  const raw =
    process.env.SERVER_URL ||
    process.env.API_BASE_URL ||
    process.env.API_URL ||
    defaultLocal;

  if (!raw) return '';
  return raw.replace(/\/$/, '');
})();

const getFileUrl = (filename) => {
  if (!filename) return null;
  const relative = `/uploads/profiles/${filename}`;
  return serverBaseUrl ? `${serverBaseUrl}${relative}` : relative;
};

module.exports = {
  deleteFile,
  getFileUrl,
};
