const fs = require('fs')
const path = require('path')

const modelService = require('../services/model.service')
const { createFileSha256 } = require('../utils/hash')

const removeUploadedFile = async (file) => {
    if (!file) {
        return
    }

    const filePath = path.join(process.cwd(), 'uploads', file.filename)

    if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
    }
}

const getLatestModel = async (req, res) => {

    try {
        const model = await modelService.getLatestModel()

        if (!model) {
            return res.status(404).json({
                message: 'No model has been uploaded yet'
            })
        }

        res.json(model)

    }catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
    
}

const uploadModel = async (req , res) => {

    try {
        const file = req.file
        const version = req.body.version?.trim()
        const releaseNote = req.body.releaseNote?.trim() || null

        if (!file) {
            return res.status(400).json({
                message: 'Model file is required'
            })
        }

        if (!version) {
            await removeUploadedFile(file)

            return res.status(400).json({
                message: 'Version is required'
            })
        }

        const existingModel = await modelService.findModelByVersion(version)

        if (existingModel) {
            await removeUploadedFile(file)

            return res.status(409).json({
                message: 'Model version already exists'
            })
        }

        const filePath = path.join(process.cwd(), 'uploads', file.filename)
        const sha256 = await createFileSha256(filePath)

        const model = await modelService.uploadModel({
            version,
            releaseNote,
            fileName: file.filename,
            fileUrl: `/uploads/${file.filename}`,
            sha256
        })

        res.status(201).json(model)

    }catch(error) {
        await removeUploadedFile(req.file)

        res.status(500).json({
            message: error.message
        })
    }


}

module.exports = {
    getLatestModel,
    uploadModel
}
