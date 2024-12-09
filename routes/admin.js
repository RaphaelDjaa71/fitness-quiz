const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

// Route pour lister les utilisateurs (accessible sans authentification)
router.get('/users', optionalAuth, async (req, res) => {
    try {
        // Récupérer tous les utilisateurs (limiter les informations sensibles)
        const users = await User.find({}).select('name email createdAt lastLogin');
        
        res.json({
            status: 'success',
            users: users,
            isAuthenticated: !!req.isAuthenticated
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
});

module.exports = router;
