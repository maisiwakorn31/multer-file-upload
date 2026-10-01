const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const ALLOWED = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    },
});
function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ALLOWED[file.mimetype];
    if (!allowedExts || !allowedExts.includes(ext)) {
        const err = new Error(`ไม่รม่ องรับรัไฟล์ชนิด ${file.mimetype} (${ext})`);
        err.status = 415;
        return cb(err);
    }
    cb(null, true);
}
const upload = multer({
    storage,
    fileFilter, limits: {
        fileSize: MAX_SIZE, // ขนาดต่อไฟล์
        files: 5, // จำ นวนไฟล์ต่อคำ ขอ
        fields: 10, // จำ นวนฟิลฟิ ด์ข้ด์ อข้ ความ
    },
});
module.exports = { upload, UPLOAD_DIR, ALLOWED };