const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { upload, UPLOAD_DIR } = require('../middlewares/upload');
const verifyFileType = require('../middlewares/verifyFileType');
const router = express.Router();

const toDto = (req, f) => ({
    filename: f.filename,
    originalName: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
    url: `${req.protocol}://${req.get('host')}/api/files/${f.filename}`,
});

const safePath = (name) => path.join(UPLOAD_DIR, path.basename(name));

// 1. อัปโหลดไฟล์เดียว (POST /api/files)
router.post('/', upload.single('file'), verifyFileType, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'กรุณาแนบไฟล์ในฟิลด์ file' });
    }
    res.status(201).json(toDto(req, req.file));
});

// 2. อัปโหลดหลายไฟล์ (POST /api/files/multiple)
router.post('/multiple', upload.array('files', 5), verifyFileType, (req, res) => {
    if (!req.files?.length) {
        return res.status(400).json({ error: 'กรุณาแนบไฟล์ในฟิลด์ files' });
    }
    res.status(201).json({
        count: req.files.length,
        files: req.files.map((f) => toDto(req, f))
    });
});

// 3. ดึงรายชื่อไฟล์รูปภาพทั้งหมด (GET /api/files/multiple)
// ⚠️ ต้องวางไว้ก่อน GET /:filename เสมอ
router.get('/multiple', async (req, res, next) => {
    try {
        const names = await fs.readdir(UPLOAD_DIR);
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        
        // กรองเอาเฉพาะไฟล์รูปภาพตามโจทย์กำหนด
        const imageNames = names.filter((name) =>
            imageExtensions.includes(path.extname(name).toLowerCase())
        );

        const files = await Promise.all(
            imageNames.map(async (name) => {
                const stat = await fs.stat(safePath(name));
                return {
                    filename: name,
                    size: stat.size,
                    uploadedAt: stat.birthtime
                };
            })
        );
        res.json(files);
    } catch (err) {
        next(err);
    }
});

// 4. ดาวน์โหลด (GET /api/files/:filename)
router.get('/:filename', (req, res, next) => {
    res.download(safePath(req.params.filename), (err) => {
        if (err && !res.headersSent) {
            err.code === 'ENOENT'
                ? res.status(404).json({ error: 'ไม่พบไฟล์' })
                : next(err);
        }
    });
});

// 5. ลบไฟล์ (DELETE /api/files/:filename)
router.delete('/:filename', async (req, res, next) => {
    try {
        await fs.unlink(safePath(req.params.filename));
        res.status(204).end();
    } catch (err) {
        err.code === 'ENOENT'
            ? res.status(404).json({ error: 'ไม่พบไฟล์' })
            : next(err);
    }
});

module.exports = router;