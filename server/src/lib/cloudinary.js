const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configurations for different file types

// Profile Images Storage
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto:good' }
    ],
  },
});

// Banner Images Storage
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1920, height: 400, crop: 'limit' },
      { quality: 'auto:good' }
    ],
  },
});

// Chat Images Storage
const chatImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/chat/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' }
    ],
  },
});

// Chat Files Storage (Documents)
const chatFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/chat/files',
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'],
    resource_type: 'raw',
  },
});

// Chat Audio Storage
const chatAudioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/chat/audio',
    allowed_formats: ['mp3', 'wav', 'ogg', 'webm'],
    resource_type: 'video', // Cloudinary uses 'video' for audio files
  },
});

// Chat Video Storage
const chatVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/chat/videos',
    allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
    resource_type: 'video',
    transformation: [
      { width: 1280, height: 720, crop: 'limit', quality: 'auto:good' }
    ],
  },
});

// Resume/CV Storage
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
  },
});

// Company Logo Storage
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'limit' },
      { quality: 'auto:good' }
    ],
  },
});

// Create multer upload instances
const uploadProfile = multer({ 
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadBanner = multer({ 
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadChatImage = multer({ 
  storage: chatImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadChatFile = multer({ 
  storage: chatFileStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

const uploadChatAudio = multer({ 
  storage: chatAudioStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadChatVideo = multer({ 
  storage: chatVideoStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const uploadResume = multer({ 
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadLogo = multer({ 
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Helper functions
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

const deleteMultipleFiles = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting multiple files from Cloudinary:', error);
    throw error;
  }
};

const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

// Generate optimized URL
const generateOptimizedUrl = (publicId, options = {}) => {
  const {
    width,
    height,
    crop = 'limit',
    quality = 'auto:good',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    fetch_format: 'auto'
  });
};

// Generate thumbnail for video
const generateVideoThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      { width: 400, height: 300, crop: 'fill' },
      { quality: 'auto:good' }
    ],
    format: 'jpg'
  });
};

module.exports = {
  cloudinary,
  uploadProfile,
  uploadBanner,
  uploadChatImage,
  uploadChatFile,
  uploadChatAudio,
  uploadChatVideo,
  uploadResume,
  uploadLogo,
  deleteFile,
  deleteMultipleFiles,
  getFileInfo,
  generateOptimizedUrl,
  generateVideoThumbnail
};