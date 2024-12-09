const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenService {
    // Générer un token JWT
    static generateAccessToken(user) {
        return jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                role: user.role || 'user'
            }, 
            process.env.JWT_SECRET || 'test_secret_key', 
            { expiresIn: '1h' }
        );
    }

    // Générer un token de refresh
    static generateRefreshToken(user) {
        return jwt.sign(
            { 
                userId: user._id, 
                tokenVersion: user.tokenVersion || 0 
            }, 
            process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret', 
            { expiresIn: '7d' }
        );
    }

    // Générer un token de réinitialisation de mot de passe
    static generatePasswordResetToken(user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        return {
            resetToken,
            hashedToken,
            expires: Date.now() + 3600000 // 1 heure
        };
    }

    // Vérifier et décoder un token
    static verifyToken(token, secret = process.env.JWT_SECRET) {
        try {
            return jwt.verify(token, secret || 'test_secret_key');
        } catch (error) {
            console.error('Erreur de vérification de token:', error);
            return null;
        }
    }

    // Invalider un token
    static invalidateToken(token) {
        // TODO: Implémenter un mécanisme de liste noire de tokens
        // Peut utiliser Redis ou une base de données pour stocker les tokens invalides
        return true;
    }
}

module.exports = TokenService;
