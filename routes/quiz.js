const express = require('express');
const { auth } = require('../middleware/auth');
const QuizResult = require('../models/QuizResult');

const router = express.Router();

// Middleware pour protéger toutes les routes du quiz
router.use(auth);

// Sauvegarder les résultats du quiz
router.post('/save-results', async (req, res) => {
    try {
        const { userId, answers, completedAt } = req.body;

        // Créer un nouveau résultat de quiz
        const quizResult = new QuizResult({
            user: userId,
            answers: answers,
            completedAt: completedAt
        });

        await quizResult.save();

        res.status(201).json(quizResult);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des résultats:', error);
        res.status(500).json({ message: 'Erreur lors de la sauvegarde des résultats' });
    }
});

// Générer un programme personnalisé
router.post('/generate-program', async (req, res) => {
    try {
        const answers = req.body;

        // Logique de génération de programme personnalisé
        const program = generatePersonalizedProgram(answers);

        res.status(200).json(program);
    } catch (error) {
        console.error('Erreur lors de la génération du programme:', error);
        res.status(500).json({ message: 'Erreur lors de la génération du programme' });
    }
});

// Fonction de génération de programme personnalisé
function generatePersonalizedProgram(answers) {
    // Logique complexe basée sur les réponses du quiz
    const program = {
        goal: getGoalProgram(answers.goal),
        workouts: getWorkoutPlan(answers),
        nutrition: getNutritionPlan(answers),
        duration: '12 semaines'
    };

    return program;
}

function getGoalProgram(goal) {
    switch (goal) {
        case 'weight-loss':
            return 'Programme de perte de poids';
        case 'muscle-gain':
            return 'Programme de prise de muscle';
        case 'fitness':
            return 'Programme de remise en forme générale';
        default:
            return 'Programme personnalisé';
    }
}

function getWorkoutPlan(answers) {
    // Générer un plan d'entraînement basé sur l'expérience, l'objectif et la fréquence
    return [
        { day: 1, type: 'Cardio', duration: 45 },
        { day: 2, type: 'Force', duration: 60 },
        { day: 3, type: 'Repos actif' }
    ];
}

function getNutritionPlan(answers) {
    // Générer un plan nutritionnel basé sur l'objectif et le régime
    return {
        calories: calculateCalories(answers),
        macronutrients: {
            protein: '30%',
            carbs: '40%',
            fat: '30%'
        }
    };
}

function calculateCalories(answers) {
    // Calcul complexe basé sur l'âge, le sexe, le poids, l'activité
    return 2000; // Exemple simplifié
}

// Récupérer tous les résultats de quiz d'un utilisateur
router.get('/results', async (req, res) => {
    try {
        const results = await QuizResult.find({ userId: req.user._id })
            .sort({ completedAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer un résultat spécifique
router.get('/results/:id', async (req, res) => {
    try {
        const result = await QuizResult.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!result) {
            return res.status(404).json({ error: 'Résultat non trouvé' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
