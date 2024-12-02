const mongoose = require('mongoose');
const config = require('../config/config');

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect(config.mongodb.uri, config.mongodb.options)
            .then(() => {
                console.log('✅ Connexion à MongoDB réussie');
            })
            .catch(err => {
                console.error('❌ Erreur de connexion MongoDB:', err.message);
                process.exit(1);
            });

        // Gestion des événements de connexion
        mongoose.connection.on('disconnected', () => {
            console.log('❌ MongoDB déconnecté');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnecté');
        });

        // Gestion propre de la fermeture
        process.on('SIGINT', this.closeConnection);
        process.on('SIGTERM', this.closeConnection);
    }

    closeConnection() {
        mongoose.connection.close(() => {
            console.log('MongoDB connexion fermée via app termination');
            process.exit(0);
        });
    }
}

module.exports = new Database();
