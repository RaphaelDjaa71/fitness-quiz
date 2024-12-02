const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
    // Configuration de la sérialisation de l'utilisateur
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Configuration de la désérialisation de l'utilisateur
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Configuration de la stratégie locale
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            // Rechercher l'utilisateur
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Email ou mot de passe incorrect' });
            }

            // Vérifier le mot de passe
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Email ou mot de passe incorrect' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));
};
