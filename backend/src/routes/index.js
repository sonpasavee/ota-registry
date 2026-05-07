const express = require('express')

const router = express.Router()

const authRoutes = require('./auth.routes')
const modelRoutes = require('./model.routes')

router.use('/auth', authRoutes)
router.use('/models', modelRoutes)

module.exports = router