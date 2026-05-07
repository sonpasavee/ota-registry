require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const globalForPrisma = globalThis

const getPrisma = () => {
    if (!globalForPrisma.prisma) {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })

        globalForPrisma.prisma = new PrismaClient({ adapter })
    }

    return globalForPrisma.prisma
}

const disconnectPrisma = async () => {
    if (!globalForPrisma.prisma) {
        return
    }

    await globalForPrisma.prisma.$disconnect()
    globalForPrisma.prisma = undefined
}

module.exports = {
    getPrisma,
    disconnectPrisma
}
