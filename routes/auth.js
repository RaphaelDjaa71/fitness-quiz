const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, authLimiter } = require('../middleware/auth');
const path = require('path');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const router = express.Router();

// Validation des champs
const signupValidation = [
    body('name')
        .notEmpty().withMessage('Nom requis')
        .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('email')
        .notEmpty().withMessage('Email requis')
        .isEmail().withMessage('Email invalide'),
    body('password')
        .notEmpty().withMessage('Mot de passe requis')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
];

const loginValidation = [
    body('email')
        .notEmpty().withMessage('Email requis')
        .isEmail().withMessage('Email invalide'),
    body('password')
        .notEmpty().withMessage('Mot de passe requis')
];

// Inscription
router.post('/signup', signupValidation, async (req, res) => {
    console.log(' Tentative d\'inscription');
    console.log(' Données reçues:', JSON.stringify(req.body, null, 2));

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                status: 'error', 
                message: errors.array()[0].msg,
                errors: errors.array() 
            });
        }

        const { name, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Cet email est déjà utilisé'
            });
        }

        // Créer un nouvel utilisateur
        const user = new User({ name, email, password });

        // Générer un token de vérification d'email
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        console.log(' Utilisateur créé avec succès');
        console.log(' Token de vérification:', verificationToken);

        // Envoyer un email de vérification
        const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
        
        try {
            await sendVerificationEmail(email, verificationUrl);
            console.log(' Email de vérification envoyé');
        } catch (emailError) {
            console.error(' Erreur lors de l\'envoi de l\'email:', emailError);
        }

        res.status(201).json({
            status: 'success',
            message: 'Compte créé avec succès. Veuillez vérifier votre email.',
            data: {
                userId: user._id,
                email: user.email
            }
        });

    } catch (error) {
        console.error(' ERREUR COMPLETE LORS DE L\'INSCRIPTION:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la création du compte'
        });
    }
});

// Vérification d'email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    console.log(' Tentative de vérification d\'email');
    console.log(' Token reçu:', token);

    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({ 
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpires: { $gt: Date.now() }
        });

        console.log(' Résultat de recherche de l\'utilisateur:', {
            userFound: !!user,
            token: token
        });

        if (!user) {
            console.log(' Utilisateur non trouvé ou token expiré');
            return res.status(400).json({
                status: 'error',
                message: 'Le lien de vérification est invalide ou a expiré.'
            });
        }

        user.verifyEmail();
        await user.save();

        console.log(' Email vérifié avec succès pour:', user.email);

        res.status(200).json({
            status: 'success',
            message: 'Email vérifié avec succès'
        });

    } catch (error) {
        console.error(' Erreur lors de la vérification d\'email:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la vérification de l\'email'
        });
    }
});

// Connexion
router.post('/login', loginValidation, async (req, res) => {
    console.log(' Tentative de connexion');
    console.log(' Email reçu:', req.body.email);

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                status: 'error', 
                message: errors.array()[0].msg 
            });
        }

        const { email, password } = req.body;

        // Rechercher l'utilisateur avec son email
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(403).json({
                status: 'error',
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier si le compte est vérifié
        if (!user.isVerified) {
            return res.status(403).json({
                status: 'error',
                message: 'Veuillez vérifier votre email avant de vous connecter'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(403).json({
                status: 'error',
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Mettre à jour la date de dernière connexion
        user.lastLoginAt = Date.now();
        await user.save();

        // Générer un token JWT
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Stocker le token dans un cookie sécurisé
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 heure
        });

        // Réponse de connexion réussie
        res.status(200).json({
            status: 'success',
            message: 'Connexion réussie',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.error(' ERREUR DE CONNEXION:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la connexion'
        });
    }
});

// Déconnexion
router.post('/logout', async (req, res) => {
    try {
        // Effacer le cookie de token
        res.clearCookie('token');

        res.status(200).json({
            status: 'success',
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error(' ERREUR LORS DE LA DÉCONNEXION:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la déconnexion'
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

// Vérification de l'authentification
router.get('/check-auth', async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté via la session ou le token
        const token = req.cookies.token || 
                      req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(200).json({
                authenticated: false
            });
        }

        // Vérifier la validité du token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'test_secret_key'
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(200).json({
                authenticated: false
            });
        }

        // Vérifier si l'utilisateur a été supprimé ou désactivé
        if (user.deletedAt || !user.isActive) {
            return res.status(200).json({
                authenticated: false
            });
        }

        res.status(200).json({
            authenticated: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(' ERREUR DE VÉRIFICATION D\'AUTHENTIFICATION:', error);
        res.status(200).json({
            authenticated: false
        });
    }
});

// Route de vérification du token
router.get('/verify', auth, (req, res) => {
    console.log(' Token vérifié pour l\'utilisateur:', req.user.email);
    
    res.json({
        status: 'success',
        user: req.user
    });
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

// Demande de réinitialisation de mot de passe
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucun compte associé à cet email'
            });
        }

        // Générer un token de réinitialisation
        const resetToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET || 'test_secret_key',
            { expiresIn: '1h' }
        );

        // Sauvegarder le token de réinitialisation
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
        await user.save();

        // Construire le lien de réinitialisation
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
        
        // Envoyer l'email
        const emailSent = await sendPasswordResetEmail(email, resetLink);

        // En mode développement, renvoyer le lien
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            return res.json({
                status: 'success',
                message: 'Instructions envoyées par email',
                devMessage: `En mode développement, utilisez ce lien : ${resetLink}`,
                emailPreview: emailSent
            });
        }

        // En production
        res.json({
            status: 'success',
            message: 'Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.'
        });

    } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la demande de réinitialisation'
        });
    }
});

// Réinitialisation du mot de passe
router.post('/reset-password', [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
], async (req, res) => {
    try {
        const { token, password } = req.body;

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key');
        
        // Trouver l'utilisateur
        const user = await User.findOne({
            _id: decoded._id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Le lien de réinitialisation est invalide ou a expiré'
            });
        }

        // Mettre à jour le mot de passe
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            status: 'success',
            message: 'Mot de passe réinitialisé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la réinitialisation du mot de passe'
        });
    }
});

module.exports = router;
