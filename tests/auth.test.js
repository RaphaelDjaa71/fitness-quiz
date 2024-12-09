const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Tests d\'authentification', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234!'
    };

    let server;
    let agent;

    beforeAll(async () => {
        try {
            // Connexion à la base de données de test
            await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/fitness-quiz-test', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            await User.deleteMany({});
            server = app.listen(0);
            agent = request.agent(app);
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
        server.close();
    });

    describe('Inscription', () => {
        // Test d'inscription réussie
        test('Inscription réussie avec un mot de passe complexe', async () => {
            const testUser = {
                name: 'Raphael Djaa',
                email: 'djaaraphael5@gmail.com',
                password: 'Raphael-Test1234!'
            };

            const response = await agent
                .post('/api/auth/signup')
                .send(testUser);

            console.log('Réponse du test d\'inscription:', response.body);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.userId).toBeDefined();
            expect(response.body.data.email).toBe(testUser.email);
        }, 15000); // Augmenter le timeout

        // Test d'inscription avec un email existant
        test('Inscription échouée avec un email déjà existant', async () => {
            // Créer d'abord un utilisateur
            await agent
                .post('/api/auth/signup')
                .send(testUser);

            // Tenter de créer un utilisateur avec le même email
            const response = await agent
                .post('/api/auth/signup')
                .send(testUser);

            expect(response.statusCode).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Cet email est déjà utilisé');
        });

        // Test d'inscription avec données invalides
        test('Inscription avec données invalides - email manquant', async () => {
            const testUser = {
                name: 'Test User',
                email: '',
                password: 'Test1234!'
            };

            const response = await agent
                .post('/api/auth/signup')
                .send(testUser);

            expect(response.statusCode).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Email invalide');
        });

        test('Inscription avec mot de passe trop court', async () => {
            const testUser = {
                name: 'Test User',
                email: 'test-short@example.com',
                password: 'Test1!'
            };

            const response = await agent
                .post('/api/auth/signup')
                .send(testUser);

            expect(response.statusCode).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('Le mot de passe ne respecte pas les critères de sécurité');
        });
    });

    describe('Connexion', () => {
        beforeEach(async () => {
            // S'assurer qu'un utilisateur existe pour les tests de connexion
            await agent
                .post('/api/auth/signup')
                .send(testUser);
        });

        test('Connexion réussie', async () => {
            const response = await agent
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.user.email).toBe(testUser.email);
        });

        test('Connexion avec email inexistant', async () => {
            const response = await agent
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Test1234!'
                });

            expect(response.status).toBe(403);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Email ou mot de passe incorrect');
        });

        test('Connexion avec mot de passe incorrect', async () => {
            const response = await agent
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!'
                });

            expect(response.status).toBe(403);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Email ou mot de passe incorrect');
        });
    });

    describe('Déconnexion', () => {
        test('Déconnexion réussie', async () => {
            // D'abord se connecter
            await agent
                .post('/api/auth/signup')
                .send(testUser);

            await agent
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const response = await agent
                .post('/api/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
        });
    });

    describe('Vérification d\'authentification', () => {
        test('Vérification avec utilisateur non connecté', async () => {
            const response = await agent
                .get('/api/auth/check-auth');

            expect(response.status).toBe(200);
            expect(response.body.authenticated).toBe(false);
        });

        test('Vérification avec utilisateur connecté', async () => {
            // S'inscrire et se connecter
            await agent
                .post('/api/auth/signup')
                .send(testUser);

            await agent
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const response = await agent
                .get('/api/auth/check-auth');

            expect(response.status).toBe(200);
            expect(response.body.authenticated).toBe(true);
        });
    });
});
