const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
    console.error('Usage: npm.cmd run admin:hash -- <plain-password>')
    process.exit(1)
}

bcrypt
    .hash(password, 10)
    .then((hash) => {
        console.log(hash)
    })
    .catch((error) => {
        console.error(error.message)
        process.exit(1)
    })
