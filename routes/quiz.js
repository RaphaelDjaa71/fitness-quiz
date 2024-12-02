const express = require('express');
const { auth } = require('../middleware/auth');
const QuizResult = require('../models/QuizResult');

const router = express.Router();

// Middleware pour protéger toutes les routes du quiz
router.use(auth);

// Sauvegarder les résultats du quiz
router.post('/results', async (req, res) => {
    try {
        const quizResult = new QuizResult({
            userId: req.user._id,
            answers: req.body.answers,
            recommendations: req.body.recommendations
        });

        await quizResult.save();
        res.status(201).json(quizResult);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

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
