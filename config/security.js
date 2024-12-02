const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const setupSecurity = (app) => {
    // Protection contre les attaques XSS
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));

    // Configuration CORS
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
            ? 'https://votre-domaine.com' 
            : 'http://localhost:3000',
        credentials: true
    }));

    // Protection contre les injections NoSQL
    app.use(mongoSanitize());

    // Protection contre les attaques XSS
    app.use(xss());

    // Limitation du taux de requêtes
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limite chaque IP à 100 requêtes par fenêtre
    });
    app.use('/api/', limiter);

    // Protection CSRF
    app.use((req, res, next) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });

    // En-têtes de sécurité supplémentaires
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
};

module.exports = setupSecurity;
