const crypto = require('crypto')
const fs = require('fs')

const createFileSha256 = async (filePath) => {
    const fileBuffer = await fs.promises.readFile(filePath)

    return crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex')
}

module.exports = {
    createFileSha256
}
