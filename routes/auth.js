const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, authLimiter } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// Validation des champs
const signupValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Le nom doit contenir au moins 2 caractères'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
        .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre')
];

const loginValidation = [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').notEmpty()
];

// Inscription
router.post('/signup', signupValidation, async (req, res) => {
    console.log('Début de la route /signup');
    try {
        // Vérification des erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Erreurs de validation:', errors.array());
            return res.status(400).json({ 
                status: 'error',
                message: errors.array()[0].msg 
            });
        }

        const { name, email, password } = req.body;
        console.log('Données reçues:', { name, email, passwordLength: password?.length });

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Email déjà utilisé:', email);
            return res.status(400).json({ 
                status: 'error',
                message: 'Cet email est déjà utilisé' 
            });
        }

        // Créer le nouvel utilisateur
        const user = new User({ name, email, password });
        console.log('Nouvel utilisateur créé:', user._id);

        // Générer le token
        const token = jwt.sign(
            { _id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Sauvegarder le token
        user.tokens = [token];
        await user.save();
        console.log('Utilisateur sauvegardé avec succès');

        // Configurer le cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        // Envoyer la réponse
        res.status(201).json({
            status: 'success',
            message: 'Inscription réussie',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        });
        console.log('Réponse envoyée avec succès');

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de l\'inscription',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Connexion avec Passport
router.post('/login', authLimiter, loginValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: errors.array()[0].msg
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: info.message || 'Email ou mot de passe incorrect'
            });
        }

        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }

            try {
                // Générer le token JWT
                const token = jwt.sign(
                    { _id: user._id.toString() },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                // Sauvegarder le token
                user.tokens = user.tokens || [];
                user.tokens.push(token);
                await user.save();

                // Configurer la session
                req.session.userId = user._id;
                req.session.email = user.email;

                res.json({
                    status: 'success',
                    message: 'Connexion réussie',
                    data: {
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email
                        },
                        token
                    }
                });
            } catch (error) {
                next(error);
            }
        });
    })(req, res, next);
});

// Route de déconnexion
router.post('/logout', (req, res) => {
    try {
        // Détruire la session
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Erreur lors de la destruction de la session:', err);
                }
            });
        }

        // Déconnexion de Passport
        req.logout((err) => {
            if (err) {
                console.error('Erreur lors de la déconnexion Passport:', err);
            }
        });

        // Supprimer le token JWT
        res.clearCookie('token');

        res.json({
            status: 'success',
            message: 'Déconnexion réussie',
            resetRequired: true
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la déconnexion'
        });
    }
});

// Déconnexion de toutes les sessions
router.post('/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.clearCookie('token');
        res.json({
            status: 'success',
            message: 'Déconnecté de toutes les sessions'
        });
    } catch (error) {
        console.error('Erreur de déconnexion de toutes les sessions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la déconnexion de toutes les sessions'
        });
    }
});

// Obtenir le profil
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'quizResults',
                options: { sort: { completedAt: -1 }, limit: 5 }
            });
        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération du profil'
        });
    }
});

// Mettre à jour le profil
router.put('/profile', auth, [
    body('name').optional().trim().isLength({ min: 2 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('currentPassword').optional().notEmpty(),
    body('newPassword')
        .optional()
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.email) updates.email = req.body.email;

        // Si changement de mot de passe
        if (req.body.currentPassword && req.body.newPassword) {
            const isMatch = await req.user.comparePassword(req.body.currentPassword);
            if (!isMatch) {
                return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
            }
            updates.password = req.body.newPassword;
        }

        // Mettre à jour l'utilisateur
        Object.assign(req.user, updates);
        await req.user.save();

        res.json({ message: 'Profil mis à jour avec succès', user: req.user });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la mise à jour du profil'
        });
    }
});

// Route pour vérifier l'utilisateur actuel
router.get('/me', auth, async (req, res) => {
    try {
        console.log('Vérification de l\'utilisateur actuel');
        
        // L'utilisateur est déjà attaché à req par le middleware auth
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Non authentifié'
            });
        }

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la vérification de l\'utilisateur'
        });
    }
});

// Route de vérification d'authentification
router.get('/check-auth', (req, res) => {
    try {
        res.json({
            isAuthenticated: req.isAuthenticated(),
            user: req.user ? { 
                id: req.user._id,
                email: req.user.email 
            } : null
        });
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la vérification de l\'authentification'
        });
    }
});

// Middleware de vérification d'authentification
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html?redirect=' + encodeURIComponent(req.originalUrl));
};

// Route protégée pour le quiz
router.get('/quiz.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/quiz.html'));
});

module.exports = router;
