const express = require('express')
const cors = require('cors')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
require('dotenv').config()
const { getPrisma, disconnectPrisma } = require('./lib/prisma')
const routes = require('./routes')
const openApiSpec = require('./docs/openapi')
const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', routes)
app.use(
    '/uploads',
    express.static(
        path.join(__dirname, '../uploads')
    )
)

app.get('/', (req, res) => {
    res.json({
        message: 'Backend API Running'
    })
})

app.get('/docs.json', (req, res) => {
    res.json(openApiSpec)
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

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
