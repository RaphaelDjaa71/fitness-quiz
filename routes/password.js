const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Demande de réinitialisation du mot de passe
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'Aucun compte associé à cet email' });
        }

        // Générer un token de réinitialisation
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
        await user.save();

        // Envoyer l'email
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${token}`;
        
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_FROM,
            subject: 'Réinitialisation de votre mot de passe - Quiz Fitness',
            html: `
                <h1>Réinitialisation de votre mot de passe</h1>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour procéder à la réinitialisation :</p>
                <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
                <p>Ce lien expirera dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Email de réinitialisation envoyé' });

    } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email de réinitialisation' });
    }
});

// Réinitialisation du mot de passe
router.post('/reset-password', [
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
        .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'),
    body('token').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Token invalide ou expiré' });
        }

        // Mettre à jour le mot de passe
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Envoyer un email de confirmation
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_FROM,
            subject: 'Votre mot de passe a été modifié - Quiz Fitness',
            html: `
                <h1>Modification du mot de passe</h1>
                <p>Votre mot de passe a été modifié avec succès.</p>
                <p>Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
    }
});

module.exports = router;
