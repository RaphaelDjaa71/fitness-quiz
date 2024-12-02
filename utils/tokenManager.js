const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AppError } = require('./errorHandler');

class TokenManager {
    static generateToken(userId, type = 'access') {
        const secret = config.jwt.secret;
        const expiresIn = type === 'refresh' ? config.jwt.refreshExpiresIn : config.jwt.expiresIn;

        return jwt.sign(
            {
                id: userId,
                type
            },
            secret,
            { expiresIn }
        );
    }

    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            return decoded;
        } catch (err) {
            throw new AppError('Token invalide ou expiré', 401);
        }
    }

    static setTokenCookie(res, token, type = 'access') {
        const cookieOptions = {
            expires: new Date(
                Date.now() + config.cookie.maxAge
            ),
            httpOnly: true,
            secure: config.server.env === 'production',
            sameSite: 'lax'
        };

        res.cookie(`${type}_token`, token, cookieOptions);
    }

    static clearTokenCookie(res, type = 'access') {
        res.cookie(`${type}_token`, 'logged_out', {
            expires: new Date(Date.now() + 1000),
            httpOnly: true
        });
    }

    static createSendToken(user, statusCode, res) {
        const accessToken = this.generateToken(user._id, 'access');
        const refreshToken = this.generateToken(user._id, 'refresh');

        // Sauvegarder le refresh token en base de données
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });

        this.setTokenCookie(res, accessToken, 'access');
        this.setTokenCookie(res, refreshToken, 'refresh');

        // Retirer le mot de passe de la sortie
        user.password = undefined;

        res.status(statusCode).json({
            status: 'success',
            accessToken,
            data: {
                user
            }
        });
    }
}

module.exports = TokenManager;
