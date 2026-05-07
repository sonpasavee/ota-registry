const { getPrisma } = require('../lib/prisma')

const getLatestModel = async () => {
    const prisma = getPrisma()

    const latest = await prisma.modelRegistry.findFirst({
        orderBy: {
            createdAt: 'desc'
        }
    })

    return latest

}

const uploadModel = async (data) => {
    const prisma = getPrisma()

    return await prisma.modelRegistry.create({
        data
    })
}

const findModelByVersion = async (version) => {
    const prisma = getPrisma()

    return await prisma.modelRegistry.findUnique({
        where: {
            version
        }
    })
}

module.exports = {
    getLatestModel,
    uploadModel,
    findModelByVersion
}
