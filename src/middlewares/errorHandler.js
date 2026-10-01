const multer = require('multer');
const MESSAGES = {
LIMIT_FILE_SIZE: 'ไฟล์มีขมีนาดเกิน 5 MB',
LIMIT_FILE_COUNT: 'อัปโหลดได้สูด้ งสู สุดสุ 5 ไฟล์ต่อครั้งรั้',
LIMIT_UNEXPECTED_FILE: 'ชื่อชื่ฟิลฟิ ด์ได์ฟล์ไม่ถูม่ กถู ต้อง หรือรืจำ นวนไฟล์เกินกำ หนด',
};
module.exports = (err, req, res, next) => {
if (err instanceof multer.MulterError) {
const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
return res.status(status).json({ error: MESSAGES[err.code] ||
err.message, code: err.code });
}
const status = err.status || 500;
if (status === 500) console.error(err);
res.status(status).json({ error: status === 500 ? 'Internal server error' :
err.message });
};
