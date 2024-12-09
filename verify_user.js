const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/fitness-quiz', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function verifyUser() {
    try {
        const user = await User.findOne({ email: 'laser_messie.9p@icloud.com' });
        
        if (!user) {
            console.log('Utilisateur non trouvé');
            return;
        }

        user.isVerified = true;
        await user.save();

        console.log('Utilisateur vérifié avec succès');
        console.log('Détails mis à jour:', {
            email: user.email,
            isVerified: user.isVerified
        });
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
    } finally {
        mongoose.connection.close();
    }
}

verifyUser();
