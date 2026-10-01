// src/middlewares/verifyFileType.js
const fs = require('fs/promises');
const FileType = require('file-type'); // v16
const { ALLOWED } = require('./upload');
module.exports = async function verifyFileType(req, res, next) {
    const files = req.file ? [req.file] : req.files || [];
    try {
        for (const f of files) {
            const detected = await FileType.fromFile(f.path);
            if (!detected || !ALLOWED[detected.mime]) {
                await Promise.all(files.map((x) => fs.unlink(x.path).catch(() => { })));
                return res.status(415).json({
                    error: `เนื้อหาไฟล์ ${f.originalname} ไม่ตม่ รง
กับชนิดที่อนุญาต` });
            }
        }
        next();
    } catch (err) {
        next(err);
    }
};
