const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { getPrisma, disconnectPrisma } = require('./lib/prisma')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: 'Backend API Running'
    })
})

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok'
    })
})

app.get('/health/db', async (req, res) => {
    try {
        const prisma = getPrisma()

        await prisma.$queryRaw`SELECT 1`

        res.status(200).json({
            status: 'ok',
            database: 'connected'
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            message: error.message
        })
    }
})

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const shutdown = async () => {
    await disconnectPrisma()
    server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
