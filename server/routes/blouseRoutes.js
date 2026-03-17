const express = require('express');
const router = express.Router();
const blouseController = require('../controllers/blouseController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'server/uploads/blouse';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), blouseController.createBlouse);
router.get('/', blouseController.getAllBlouses);
router.get('/:id', blouseController.getBlouseById);
router.delete('/:id', blouseController.deleteBlouse);

module.exports = router;
