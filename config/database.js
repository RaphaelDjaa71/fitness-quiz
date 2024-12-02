const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
        });

        console.log(`MongoDB connecté: ${conn.connection.host}`);

        // Gestion des index
        await Promise.all([
            // Index pour la recherche rapide des utilisateurs par email
            mongoose.model('User').collection.createIndex({ email: 1 }, { unique: true }),
            
            // Index pour la recherche rapide des résultats de quiz par utilisateur
            mongoose.model('QuizResult').collection.createIndex({ userId: 1 }),
            
            // Index pour la recherche rapide des tokens de réinitialisation de mot de passe
            mongoose.model('User').collection.createIndex(
                { 'resetPasswordToken': 1, 'resetPasswordExpires': 1 }
            )
        ]);

    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
};

// Gestion des événements de connexion
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB déconnecté');
});

mongoose.connection.on('error', (err) => {
    console.error('Erreur MongoDB:', err);
});

// Gestion propre de la fermeture
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la fermeture de la connexion MongoDB:', err);
        process.exit(1);
    }
});

module.exports = connectDB;
