const authService = require('../services/auth.service')

const login = async (req, res) => {
    try {
        const username = req.body.username?.trim()
        const password = req.body.password

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            })
        }

        const result = await authService.login(
            username,
            password
        )

        res.json(result)

    } catch (error) {

        res.status(401).json({
            message: error.message
        })

    }
}

module.exports = {
    login
}
