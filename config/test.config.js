// Configuration pour l'environnement de test
module.exports = {
    mongodb: {
        uri: 'mongodb://localhost:27017/fitness-quiz-test',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    jwt: {
        secret: 'test_secret_key',
        expiresIn: '7d'
    },
    session: {
        secret: 'test_session_secret',
        name: 'sessionId',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    },
    security: {
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100 // Limite de requêtes
    }
};
