const { sendVerificationEmail } = require('../services/emailService');
const crypto = require('crypto');

async function testEmailSending() {
    try {
        // Générer un token de vérification factice
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const result = await sendVerificationEmail('test@example.com', verificationToken);
        console.log('Test d\'envoi d\'email :', result);
    } catch (error) {
        console.error('Erreur lors du test d\'email :', error);
    }
}

testEmailSending();
