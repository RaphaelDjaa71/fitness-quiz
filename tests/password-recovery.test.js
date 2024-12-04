const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Importer bcryptjs

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true)
    })
}));

describe('Password Recovery', () => {
    let testUser;

    beforeAll(async () => {
        // Connexion à la base de données de test
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness_quiz_test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    beforeEach(async () => {
        // Nettoyer la base de données avant chaque test
        await User.deleteMany({});

        // Créer un utilisateur de test
        testUser = new User({
            name: 'Test User',
            email: 'test.recovery@example.com',
            password: 'OldPassword123!'
        });
        await testUser.save();
    });

    afterAll(async () => {
        // Fermer la connexion à la base de données
        await mongoose.connection.close();
    });

    describe('Forgot Password', () => {
        it('should generate a reset token for an existing email', async () => {
            // Requête de réinitialisation de mot de passe
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test.recovery@example.com' });

            // Vérifications
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Email de réinitialisation envoyé');

            // Récupérer l'utilisateur mis à jour
            const updatedUser = await User.findOne({ email: 'test.recovery@example.com' });
            expect(updatedUser.resetPasswordToken).toBeDefined();
            expect(updatedUser.resetPasswordExpires).toBeDefined();
        });

        it('should return 404 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Aucun compte associé à cet email');
        });
    });

    describe('Reset Password', () => {
        it('should reset password with a valid token', async () => {
            // Générer un token de réinitialisation
            const resetToken = 'test-reset-token';
            testUser.resetPasswordToken = resetToken;
            testUser.resetPasswordExpires = Date.now() + 3600000; // 1 heure dans le futur
            await testUser.save();

            // Requête de réinitialisation de mot de passe
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({ 
                    token: resetToken,
                    password: 'NewPassword456!'
                });

            // Vérifications
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Mot de passe réinitialisé avec succès');

            // Récupérer l'utilisateur mis à jour avec le mot de passe
            const updatedUser = await User.findById(testUser._id).select('+password');

            // Afficher des informations de débogage
            console.log('Ancien mot de passe:', testUser.password);
            console.log('Nouveau mot de passe:', updatedUser.password);

            // Vérifier que le mot de passe a été mis à jour
            const isPasswordChanged = await bcrypt.compare('NewPassword456!', updatedUser.password);
            console.log('Résultat de la comparaison:', isPasswordChanged);

            expect(isPasswordChanged).toBe(true);

            // Vérifier que le token a été supprimé
            expect(updatedUser.resetPasswordToken).toBeUndefined();
            expect(updatedUser.resetPasswordExpires).toBeUndefined();
        });

        it('should reject reset with an invalid or expired token', async () => {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({ 
                    token: 'invalid-token',
                    password: 'NewPassword456!'
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Token invalide ou expiré');
        });

        it('should reject weak password during reset', async () => {
            // Générer un token de réinitialisation
            const resetToken = 'test-reset-token';
            testUser.resetPasswordToken = resetToken;
            testUser.resetPasswordExpires = Date.now() + 3600000;
            await testUser.save();

            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({ 
                    token: resetToken,
                    password: 'weak' // Mot de passe trop court
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });
});
