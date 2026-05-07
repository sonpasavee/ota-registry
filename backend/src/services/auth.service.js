const bcrypt = require('bcryptjs')

const { getPrisma } = require('../lib/prisma')
const { generateToken } = require('../utils/jwt')

const login = async (username , password) => {
    const prisma = getPrisma()

    const admin = await prisma.admin.findUnique({
        where: {
            username
        }
    })

    if(!admin) {
        throw new Error('Admin not found')
    }

    const isMatch = await bcrypt.compare(
        password,
        admin.password
    )

    if(!isMatch) {
        throw new Error('Invalid password')
    }

    const token = generateToken({
        adminId: admin.id,
    })

    return {
        token
    }

}

module.exports = {
    login
}
