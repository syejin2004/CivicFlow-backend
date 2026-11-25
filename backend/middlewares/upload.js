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
    categorization: 'google_tagging',
    auto_tagging: 0.6,
  },
});

const upload = multer({ storage });

// 이미지 AI 태그 분석
const analyzeImage = async (imageUrl) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      categorization: 'google_tagging',
      auto_tagging: 0.6,
    });
    return result.tags || [];
  } catch (e) {
    console.error('이미지 분석 실패:', e);
    return [];
  }
};

// 태그로 민원 분류
const classifyByTags = (tags) => {
  const tagStr = tags.join(' ').toLowerCase();
  if (tagStr.includes('road') || tagStr.includes('pothole') || tagStr.includes('asphalt') || tagStr.includes('street')) {
    return { category: '도로/교통', title: '도로 파손 보수 요청', content: '도로 파손이 발생하여 보수 조치를 요청합니다.' };
  }
  if (tagStr.includes('garbage') || tagStr.includes('trash') || tagStr.includes('waste') || tagStr.includes('litter')) {
    return { category: '환경/청소', title: '쓰레기 무단 투기 신고', content: '쓰레기 무단 투기가 발생하여 처리를 요청합니다.' };
  }
  if (tagStr.includes('parking') || tagStr.includes('car') || tagStr.includes('vehicle')) {
    return { category: '도로/교통', title: '불법 주정차 신고', content: '불법 주정차가 발생하여 단속을 요청합니다.' };
  }
  if (tagStr.includes('light') || tagStr.includes('lamp') || tagStr.includes('street light')) {
    return { category: '시설물', title: '가로등 고장 신고', content: '가로등이 고장나 수리를 요청합니다.' };
  }
  if (tagStr.includes('noise') || tagStr.includes('construction')) {
    return { category: '환경/청소', title: '소음 민원 신고', content: '소음이 발생하여 조치를 요청합니다.' };
  }
  return { category: '기타', title: '생활 불편 민원', content: '생활 불편 사항을 신고합니다.' };
};

module.exports = { upload, cloudinary, analyzeImage, classifyByTags };