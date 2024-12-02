require('dotenv').config();

module.exports = {
    // Configuration de la base de données
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://[your-mongodb-atlas-uri]',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // Configuration du serveur
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // Configuration JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
        expiresIn: '7d',
        refreshExpiresIn: '30d'
    },

    // Configuration des cookies
    cookie: {
        secret: process.env.COOKIE_SECRET || 'votre_secret_cookie_super_securise',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    },

    // Configuration de la sécurité
    security: {
        bcryptSaltRounds: 10,
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100 // 100 requêtes par fenêtre
    },

    // Configuration des emails
    email: {
        from: process.env.EMAIL_FROM || 'noreply@fitnessquiz.com',
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    },

    // Configuration CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
    }
};
