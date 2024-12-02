const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'ID utilisateur est requis'],
        index: true
    },
    completedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    answers: [{
        questionId: {
            type: String,
            required: true
        },
        answer: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    results: {
        fitnessLevel: {
            type: String,
            enum: ['débutant', 'intermédiaire', 'avancé'],
            required: true
        },
        recommendedProgram: {
            type: String,
            required: true
        },
        scores: {
            strength: {
                type: Number,
                min: 0,
                max: 100
            },
            endurance: {
                type: Number,
                min: 0,
                max: 100
            },
            flexibility: {
                type: Number,
                min: 0,
                max: 100
            },
            balance: {
                type: Number,
                min: 0,
                max: 100
            }
        },
        recommendations: [{
            category: String,
            description: String,
            priority: {
                type: Number,
                min: 1,
                max: 5
            }
        }]
    },
    metadata: {
        duration: {
            type: Number,
            min: 0
        },
        platform: String,
        userAgent: String,
        version: String
    }
}, {
    timestamps: true
});

// Index composé pour les recherches fréquentes
quizResultSchema.index({ userId: 1, completedAt: -1 });

// Méthode pour calculer les statistiques globales
quizResultSchema.statics.getUserStats = async function(userId) {
    try {
        const stats = await this.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $sort: { completedAt: -1 } },
            {
                $group: {
                    _id: null,
                    totalQuizzes: { $sum: 1 },
                    averageStrength: { $avg: '$results.scores.strength' },
                    averageEndurance: { $avg: '$results.scores.endurance' },
                    averageFlexibility: { $avg: '$results.scores.flexibility' },
                    averageBalance: { $avg: '$results.scores.balance' },
                    lastQuizDate: { $first: '$completedAt' }
                }
            }
        ]);

        return stats[0] || {
            totalQuizzes: 0,
            averageStrength: 0,
            averageEndurance: 0,
            averageFlexibility: 0,
            averageBalance: 0
        };
    } catch (error) {
        throw new Error('Erreur lors du calcul des statistiques');
    }
};

// Méthode pour obtenir la progression
quizResultSchema.statics.getUserProgress = async function(userId) {
    try {
        return await this.find({ userId })
            .select('completedAt results.scores')
            .sort({ completedAt: 1 });
    } catch (error) {
        throw new Error('Erreur lors de la récupération de la progression');
    }
};

// Middleware pour mettre à jour le document User associé
quizResultSchema.post('save', async function(doc) {
    try {
        await mongoose.model('User').findByIdAndUpdate(
            doc.userId,
            { $addToSet: { quizResults: doc._id } }
        );
    } catch (error) {
        console.error('Erreur lors de la mise à jour des résultats utilisateur:', error);
    }
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;
