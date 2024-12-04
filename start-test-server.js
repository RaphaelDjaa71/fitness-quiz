// Définir l'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.SESSION_SECRET = 'test_session_secret';

// Importer et démarrer le serveur
require('./server');
