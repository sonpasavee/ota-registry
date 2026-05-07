const express = require('express')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')

const modelController = require('../controllers/model.controller')
const uploadDirectory = path.join(process.cwd(), 'uploads')

fs.mkdirSync(uploadDirectory, {
    recursive: true
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory)
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + '-' + file.originalname
        )
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 1024
    }
})

router.get(
    '/latest',
    modelController.getLatestModel
)

router.post(
    '/upload',
    authMiddleware,
    upload.single('model'),
    modelController.uploadModel
)

module.exports = router
