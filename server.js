require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');

// Importer les configurations
const config = process.env.NODE_ENV === 'test' ? require('./config/test') : require('./config/config');

require('./utils/database');
const errorHandler = require('./utils/errorHandler');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');  // Nouvelle route admin

const app = express();

// Middleware de logging détaillé
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.log('Headers:', req.headers);
        if (req.body) console.log('Body:', req.body);
    }
    next();
});

// Configuration de la sécurité
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Limite de requêtes
const limiter = rateLimit({
    windowMs: config.security.rateLimitWindow,
    max: config.security.rateLimitMax
});
app.use('/api', limiter);

// Middleware pour parser le JSON et les cookies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(config.cookie.secret));

// Middleware de gestion des erreurs de parsing JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Erreur de parsing JSON:', err);
        return res.status(400).json({
            status: 'error',
            message: 'Format JSON invalide'
        });
    }
    next(err);
});

// Protection contre les injections
app.use(mongoSanitize());
app.use(xss());

// Compression
app.use(compression());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes API avec logging
app.use('/api/auth', (req, res, next) => {
    console.log(' Requête Auth:', req.method, req.url, req.body);
    next();
}, authRoutes);

app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);  // Ajouter la route admin

// Route spécifique pour la page admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin/dashboard.html'));
});

// Redirection de l'ancienne URL vers la nouvelle
app.get('/admin.html', (req, res) => {
    res.redirect(301, '/admin/dashboard.html');
});

// Route par défaut pour le SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        body: req.body
    });

    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Une erreur est survenue sur le serveur'
    });
});

// Connexion à MongoDB avec gestion d'erreur améliorée
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness_quiz', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(' Connexion à MongoDB réussie');
        
        // Vérifier la connexion
        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const serverStatus = await admin.serverStatus();
        console.log('MongoDB Status:', {
            version: serverStatus.version,
            uptime: serverStatus.uptime,
            connections: serverStatus.connections
        });
    } catch (err) {
        console.error(' Erreur de connexion MongoDB:', {
            message: err.message,
            code: err.code,
            uri: process.env.MONGODB_URI
        });
        process.exit(1);
    }
}

// Gestion des événements MongoDB
mongoose.connection.on('error', err => {
    console.error('Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB déconnecté');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connecté');
});

// Démarrage du serveur
const port = config.server.port;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(' Serveur démarré:');
        console.log(`   - Port: ${port}`);
        console.log(`   - Mode: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   - Dossier statique: ${path.join(__dirname, 'public')}`);
        console.log(`   - MongoDB URI: ${process.env.MONGODB_URI}`);
    });
});
