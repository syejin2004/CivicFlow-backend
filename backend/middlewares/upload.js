const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'civicflow',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

const upload = multer({ storage });

const analyzeImage = async (imageUrl) => {
  return [];
};

const classifyByTags = (tags) => {
  return { category: '기타', title: '생활 불편 민원', content: '생활 불편 사항을 신고합니다.' };
};

module.exports = { upload, cloudinary, analyzeImage, classifyByTags };