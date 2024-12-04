const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Configuration pour les tests
process.env.NODE_ENV = 'test';
const TEST_MONGODB_URI = 'mongodb://localhost:27017/fitness_quiz_test';

describe('Authentication Tests', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234!'
    };

    let server;

    beforeAll(async () => {
        try {
            await mongoose.disconnect();
            await mongoose.connect(TEST_MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            await User.deleteMany({});
            server = app.listen(0);
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    });

    afterAll(async () => {
        try {
            await User.deleteMany({});
            await new Promise((resolve) => server.close(resolve));
            await mongoose.connection.close();
        } catch (error) {
            console.error('Cleanup error:', error);
            throw error;
        }
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('Inscription', () => {
        test('Inscription réussie', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.user.email).toBe(testUser.email);
            expect(response.body.data.token).toBeDefined();
        });

        test('Inscription avec email existant', async () => {
            await User.create(testUser);
            const response = await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Cet email est déjà utilisé');
        });

        test('Inscription avec données invalides - email manquant', async () => {
            const invalidUser = { ...testUser, email: '' };
            const response = await request(app)
                .post('/api/auth/signup')
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
        });

        test('Inscription avec mot de passe trop court', async () => {
            const invalidUser = { ...testUser, password: 'Test1!' };
            const response = await request(app)
                .post('/api/auth/signup')
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
        });
    });

    describe('Connexion', () => {
        test('Connexion réussie', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.user.email).toBe(testUser.email);
            expect(response.body.data.token).toBeDefined();
        });

        test('Connexion avec email inexistant', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe('error');
        });

        test('Connexion avec mot de passe incorrect', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPass123!'
                });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe('error');
        });
    });

    describe('Déconnexion', () => {
        test('Déconnexion réussie', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
        });
    });

    describe('Vérification d\'authentification', () => {
        test('Vérification avec utilisateur non connecté', async () => {
            const response = await request(app)
                .get('/api/auth/check-auth');

            expect(response.status).toBe(200);
            expect(response.body.isAuthenticated).toBe(false);
        });

        test('Vérification avec utilisateur connecté', async () => {
            const signupResponse = await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            const agent = request.agent(app);
            await agent
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const response = await agent.get('/api/auth/check-auth');
            expect(response.status).toBe(200);
            expect(response.body.isAuthenticated).toBe(true);
        });
    });
});
