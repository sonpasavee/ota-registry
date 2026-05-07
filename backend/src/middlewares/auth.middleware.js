const jwt = require('jsonwebtoken')

const authMiddleware = (req , res , next) => {
    
    try {
        const authHeader = req.headers.authorization

    if(!authHeader) {
        throw new Error('Authorization header missing')
    }

    const token = authHeader.split(' ')[1]

    if(!token) {
        throw new Error('Token missing')
    }

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    )

    req.admin = decoded

    next()

    } catch (error) {
        res.status(401).json({
            message: error.message
        })

    }
}

module.exports = authMiddleware
