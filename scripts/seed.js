const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

// Configuration de la connexion MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/fitness-quiz';

// Données de test pour les utilisateurs
const users = [
    {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        password: 'Password123!',
        isActive: true,
        preferences: {
            notifications: true,
            language: 'fr'
        }
    },
    {
        name: 'Marie Martin',
        email: 'marie.martin@example.com',
        password: 'Password123!',
        isActive: true,
        preferences: {
            notifications: false,
            language: 'fr'
        }
    },
    {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'Password123!',
        isActive: true,
        preferences: {
            notifications: true,
            language: 'en'
        }
    }
];

// Données de test pour les résultats de quiz
const createQuizResults = (userId) => ({
    userId,
    answers: [
        {
            questionId: 'q1',
            answer: 'Je fais du sport 2-3 fois par semaine',
            timestamp: new Date()
        },
        {
            questionId: 'q2',
            answer: 'Course à pied',
            timestamp: new Date()
        }
    ],
    results: {
        fitnessLevel: ['débutant', 'intermédiaire', 'avancé'][Math.floor(Math.random() * 3)],
        recommendedProgram: 'Programme personnalisé de remise en forme',
        scores: {
            strength: Math.floor(Math.random() * 100),
            endurance: Math.floor(Math.random() * 100),
            flexibility: Math.floor(Math.random() * 100),
            balance: Math.floor(Math.random() * 100)
        },
        recommendations: [
            {
                category: 'Exercice',
                description: 'Augmenter progressivement l\'intensité des séances',
                priority: Math.floor(Math.random() * 5) + 1
            },
            {
                category: 'Nutrition',
                description: 'Équilibrer les apports en protéines',
                priority: Math.floor(Math.random() * 5) + 1
            }
        ]
    },
    metadata: {
        duration: Math.floor(Math.random() * 600) + 300,
        platform: 'web',
        userAgent: 'Mozilla/5.0',
        version: '1.0.0'
    }
});

// Fonction principale pour seed la base de données
async function seedDatabase() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connecté à MongoDB');

        // Nettoyer la base de données
        await User.deleteMany({});
        await QuizResult.deleteMany({});
        console.log('Base de données nettoyée');

        // Créer les utilisateurs
        const createdUsers = [];
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`Utilisateur créé: ${user.email}`);

            // Créer des résultats de quiz pour chaque utilisateur
            const numResults = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numResults; i++) {
                const quizResult = new QuizResult(createQuizResults(user._id));
                await quizResult.save();
                console.log(`Résultat de quiz créé pour: ${user.email}`);
            }
        }

        console.log('Seeding terminé avec succès');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors du seeding:', error);
        process.exit(1);
    }
}

// Exécuter le seeding
seedDatabase();
