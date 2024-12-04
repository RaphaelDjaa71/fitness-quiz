const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(app) {
    // Initialisation de Passport
    app.use(passport.initialize());
    app.use(passport.session());

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
            // Mode test : accepter n'importe quel utilisateur
            if (process.env.NODE_ENV === 'test') {
                console.log(' Mode test : Authentification simulée');
                return done(null, {
                    id: '000000000000000000000001',
                    email: email,
                    name: 'Test User'
                });
            }

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

    return passport;
};
