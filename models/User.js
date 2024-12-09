const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Définir les rôles possibles
const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    TRAINER: 'trainer'
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nom requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères']
    },
    email: {
        type: String,
        required: [true, 'Email requis'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email invalide'],
        validate: {
            validator: function(v) {
                // Validation de base de l'email
                const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
                if (!emailRegex.test(v)) {
                    return false;
                }
                
                // Autoriser tous les domaines d'email
                return true;
            },
            message: 'Veuillez fournir un email valide'
        }
    },
    password: {
        type: String,
        required: [true, 'Mot de passe requis'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
        select: false // Ne pas inclure par défaut dans les requêtes
    },
    roles: {
        type: [String],
        default: [ROLES.USER],
        enum: Object.values(ROLES)
    },
    permissions: [{
        type: String,
        enum: [
            'view_admin_dashboard',
            'manage_users',
            'create_programs',
            'edit_programs',
            'delete_programs',
            'view_analytics'
        ]
    }],
    tokens: [{
        type: String,
        required: true
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationTokenExpires: {
        type: Date,
        select: false
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    lastPasswordChange: {
        type: Date
    },
    trustedDevices: [{
        deviceSignature: {
            type: String,
            required: true
        },
        lastUsed: {
            type: Date,
            default: Date.now
        },
        browser: {
            type: String
        },
        os: {
            type: String
        }
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    preferences: {
        notifications: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: 'fr',
            enum: ['fr', 'en']
        }
    },
    quizResults: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizResult'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour optimiser les recherches
userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

// Middleware de hachage du mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
    // Ne hache le mot de passe que s'il a été modifié
    if (!this.isModified('password')) return next();

    try {
        // Génère un sel et hache le mot de passe
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log(' Comparaison de mot de passe');
    console.log(' Mot de passe candidat:', candidatePassword);
    console.log(' Mot de passe haché stocké:', this.password);

    try {
        // Utiliser bcrypt pour comparer les mots de passe
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        
        console.log(' Résultat de la comparaison bcrypt:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error(' Erreur lors de la comparaison de mot de passe:', error);
        return false;
    }
};

// Méthode pour générer un token de réinitialisation
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
        
    this.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    
    return resetToken;
};

// Méthode pour mettre à jour la dernière connexion
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = Date.now();
    return this.save();
};

// Méthode pour nettoyer l'objet utilisateur avant de l'envoyer au client
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    return user;
};

// Méthodes de sécurité supplémentaires
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
    return verificationToken;
};

userSchema.methods.verifyEmail = function() {
    console.log(' Tentative de vérification d\'email');
    console.log(' Email actuel:', this.email);
    console.log(' Statut de vérification actuel:', this.isVerified);
    
    // Forcer la vérification
    this.isVerified = true;
    
    // Effacer le token de vérification
    this.emailVerificationToken = undefined;
    this.emailVerificationTokenExpires = undefined;
    
    console.log(' Email vérifié avec succès');
    return this;
};

userSchema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = function(callback) {
    // Si nous sommes déjà verrouillés, vérifier si le temps est écoulé
    if (this.isLocked()) {
        return callback(new Error('Compte verrouillé'));
    }

    // Incrémenter les tentatives de connexion
    const attempts = this.loginAttempts + 1;
    this.loginAttempts = attempts;

    // Verrouiller le compte après 5 tentatives
    if (attempts >= 5) {
        this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 heures
    }

    this.save(callback);
};

userSchema.methods.resetLoginAttempts = function(callback) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    this.save(callback);
};

userSchema.methods.addTrustedDevice = function(deviceSignature, browser, os) {
    // Vérifier si l'appareil existe déjà
    const existingDevice = this.trustedDevices.find(
        device => device.deviceSignature === deviceSignature
    );

    if (existingDevice) {
        // Mettre à jour la date de dernière utilisation
        existingDevice.lastUsed = Date.now();
    } else {
        // Ajouter un nouvel appareil de confiance
        this.trustedDevices.push({
            deviceSignature,
            browser,
            os
        });
    }

    return this.save();
};

userSchema.methods.removeTrustedDevice = function(deviceSignature) {
    this.trustedDevices = this.trustedDevices.filter(
        device => device.deviceSignature !== deviceSignature
    );
    return this.save();
};

// Méthode pour vérifier la force du mot de passe
userSchema.methods.isPasswordStrong = function(password) {
    console.log(' Validation du mot de passe:', {
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?-]/.test(password),
        isLongEnough: password.length >= 8
    });

    const isStrong = 
        password.length >= 8 &&  // Au moins 8 caractères
        /[a-z]/.test(password) &&  // Au moins une minuscule
        /[A-Z]/.test(password) &&  // Au moins une majuscule
        /\d/.test(password) &&     // Au moins un chiffre
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?-]/.test(password);  // Au moins un caractère spécial

    console.log(' Test de force du mot de passe:', isStrong);

    return isStrong;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
