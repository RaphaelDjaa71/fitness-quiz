const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Fonction pour envoyer un email de vérification
async function sendVerificationEmail(email, verificationUrl) {
    try {
        const mailOptions = {
            from: `"Fitness Quiz" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Vérification de votre compte Fitness Quiz',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Vérification de votre compte</h2>
                    <p>Bonjour,</p>
                    <p>Merci de vous être inscrit sur Fitness Quiz. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
                    <p style="text-align: center;">
                        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            Vérifier mon email
                        </a>
                    </p>
                    <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
                    <p>Cordialement,<br>L'équipe Fitness Quiz</p>
                </div>
            `
        };

        // Envoyer l'email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email de vérification envoyé:', info.messageId);
        return info;

    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
        throw error;
    }
}

// Fonction pour envoyer un email de réinitialisation de mot de passe
async function sendPasswordResetEmail(email, resetUrl) {
    try {
        const mailOptions = {
            from: `"Fitness Quiz" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Réinitialisation de mot de passe</h2>
                    <p>Bonjour,</p>
                    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
                    <p style="text-align: center;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            Réinitialiser le mot de passe
                        </a>
                    </p>
                    <p>Ce lien expirera dans 1 heure.</p>
                    <p>Si vous n'avez pas demandé de réinitialisation, ignorez cet email.</p>
                    <p>Cordialement,<br>L'équipe Fitness Quiz</p>
                </div>
            `
        };

        // Envoyer l'email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email de réinitialisation envoyé:', info.messageId);
        return info;

    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
        throw error;
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
