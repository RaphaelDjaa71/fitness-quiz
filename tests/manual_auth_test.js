// Définir explicitement l'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.SESSION_SECRET = 'test_session_secret';

const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');

// Configuration de débogage pour axios
axios.interceptors.request.use(request => {
    console.log('🚀 Requête:', {
        method: request.method,
        url: request.url,
        data: request.data,
        headers: request.headers
    });
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('✅ Réponse:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('❌ Erreur de requête:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

async function runAuthTests() {
    // Configuration de base
    const baseURL = 'http://localhost:3000/api/auth';
    const testUser = {
        name: 'Test User',
        email: `test_${Math.random().toString(36).substring(7)}@example.com`,
        password: 'Test1234!'
    };

    console.log('🧪 Début des tests d\'authentification');

    try {
        // Configuration axios pour inclure des cookies et gérer les redirections
        const axiosInstance = axios.create({
            baseURL,
            withCredentials: true,
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Test-Mode': 'true'
            }
        });

        // Test 1: Inscription
        console.log('\n📝 Test 1: Inscription');
        const signupResponse = await axiosInstance.post('/signup', testUser);
        
        if (signupResponse.status !== 201) {
            console.error('❌ Échec de l\'inscription:', signupResponse.data);
            throw new Error(`Statut d'inscription inattendu: ${signupResponse.status}`);
        }
        console.log('✅ Inscription réussie');
        console.log('Détails de l\'utilisateur:', signupResponse.data);

        // Test 2: Tentative d'inscription avec le même email
        console.log('\n📝 Test 2: Inscription - Email existant');
        const duplicateSignupResponse = await axiosInstance.post('/signup', testUser);
        
        if (duplicateSignupResponse.status !== 400) {
            console.error('❌ Échec du test : Inscription avec email existant aurait dû échouer');
            throw new Error(`Statut d'inscription en doublon inattendu: ${duplicateSignupResponse.status}`);
        }
        console.log('✅ Échec d\'inscription avec email existant (attendu)');
        console.log('Message d\'erreur:', duplicateSignupResponse.data);

        // Test 3: Connexion
        console.log('\n🔐 Test 3: Connexion');
        const loginResponse = await axiosInstance.post('/login', {
            email: testUser.email,
            password: testUser.password
        });
        
        if (loginResponse.status !== 200) {
            console.error('❌ Échec de la connexion:', loginResponse.data);
            throw new Error(`Statut de connexion inattendu: ${loginResponse.status}`);
        }
        console.log('✅ Connexion réussie');
        console.log('Token:', loginResponse.data.data.token);

        // Test 4: Connexion avec mot de passe incorrect
        console.log('\n🔐 Test 4: Connexion - Mot de passe incorrect');
        const incorrectLoginResponse = await axiosInstance.post('/login', {
            email: testUser.email,
            password: 'WrongPassword123!'
        });
        
        if (incorrectLoginResponse.status !== 401) {
            console.error('❌ Échec du test : Connexion avec mot de passe incorrect aurait dû échouer');
            throw new Error(`Statut de connexion incorrect inattendu: ${incorrectLoginResponse.status}`);
        }
        console.log('✅ Échec de connexion avec mot de passe incorrect (attendu)');
        console.log('Message d\'erreur:', incorrectLoginResponse.data);

        console.log('\n🎉 Tous les tests d\'authentification ont réussi !');
    } catch (error) {
        console.error('❌ Erreur lors des tests d\'authentification:', 
            error.response ? error.response.data : error.message
        );
        throw error;
    } finally {
        // Nettoyer l'utilisateur de test
        try {
            await User.deleteOne({ email: testUser.email });
            console.log('🧹 Nettoyage : Utilisateur de test supprimé');
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage:', error);
        }
    }
}

// Connexion à MongoDB avant de lancer les tests
mongoose.connect('mongodb://localhost:27017/fitness-quiz', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connecté à MongoDB');
    return runAuthTests();
})
.then(() => {
    console.log('✅ Tests terminés avec succès');
    process.exit(0);
})
.catch(error => {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
});
