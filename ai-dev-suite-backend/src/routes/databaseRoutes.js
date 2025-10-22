const express = require('express');
const multer = require('multer');
const path = require('path');
const databaseController = require('../controllers/databaseController');

const router = express.Router();

// Configure Multer for zip file uploads
const upload = multer({
    dest: path.join(__dirname, '..', '..', 'uploads'), // Temporary storage for uploads
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos .zip são permitidos!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    }
});

router.get('/export', databaseController.exportDatabase);
router.post('/import', upload.single('databaseZip'), databaseController.importDatabase);

module.exports = router;