const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
            },
            message: 'Veuillez fournir un email valide'
        }
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
        select: false // Ne pas inclure par défaut dans les requêtes
    },
    tokens: [{
        type: String,
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
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
    timestamps: true
});

// Index pour optimiser les recherches
userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
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

const User = mongoose.model('User', userSchema);

module.exports = User;
