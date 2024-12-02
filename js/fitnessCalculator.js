class FitnessCalculator {
    constructor() {
        this.state = this.loadState();
    }

    loadState() {
        return JSON.parse(localStorage.getItem('fitnessQuizState') || '{}');
    }

    saveState(state) {
        localStorage.setItem('fitnessQuizState', JSON.stringify(state));
    }

    /**
     * Calcule le poids idéal selon la formule de Monnerot-Dumaine
     * @param {number} tourPoignet - Tour de poignet en cm
     * @param {number} taille - Taille en cm
     * @param {string} sexe - 'homme' ou 'femme'
     * @returns {number} Poids idéal en kg
     */
    static calculerPoidsIdeal(tourPoignet, taille, sexe) {
        // Formule de Monnerot-Dumaine
        // Pour les hommes : (Taille - 100) + ((Tour de poignet - 20) × 1.5)
        // Pour les femmes : (Taille - 100) + ((Tour de poignet - 16) × 1.5)

        const basePoidsIdeal = taille - 100;
        let poidsIdeal;

        if (sexe === 'homme') {
            poidsIdeal = basePoidsIdeal + ((tourPoignet - 20) * 1.5);
        } else {
            poidsIdeal = basePoidsIdeal + ((tourPoignet - 16) * 1.5);
        }

        // Arrondir à une décimale
        return Math.round(poidsIdeal * 10) / 10;
    }

    /**
     * Calcule la différence entre le poids actuel et le poids idéal
     * @param {number} poidsActuel - Poids actuel en kg
     * @param {number} poidsIdeal - Poids idéal en kg
     * @returns {Object} Informations sur la différence de poids
     */
    static analyserDifferencePoids(poidsActuel, poidsIdeal) {
        const difference = poidsActuel - poidsIdeal;
        const absDifference = Math.abs(difference);

        let status, message, classe;

        if (absDifference < 2) {
            status = "neutre";
            message = "Vous êtes à votre poids idéal ! Un objectif de maintien est recommandé.";
            classe = "neutral";
        } else if (difference > 0) {
            status = "perte";
            message = `Pour atteindre votre poids idéal, une perte de ${difference.toFixed(1)} kg est recommandée.`;
            classe = "positive";
        } else {
            status = "gain";
            message = `Pour atteindre votre poids idéal, un gain de ${absDifference.toFixed(1)} kg est recommandé.`;
            classe = "negative";
        }

        return {
            difference: difference.toFixed(1),
            status,
            message,
            classe
        };
    }

    // Détermination du profil basé sur l'écart avec le poids idéal
    determineProfile(currentWeight, idealWeight) {
        const difference = currentWeight - idealWeight;

        if (difference >= 20) {
            return 'sechage-extreme';
        } else if (difference >= 15) {
            return 'sechage-classique';
        } else if (difference >= 5) {
            return 'prise-masse-1';
        } else if (Math.abs(difference) < 5) {
            return 'prise-masse-2';
        } else {
            return 'prise-masse-3';
        }
    }

    // Ajustement des portions en fonction du sexe et de l'activité
    adjustPortions(basePortions, sex, activityLevel) {
        let multiplier = 1;

        // Ajustement selon le sexe
        if (sex === 'femme') {
            multiplier *= 0.8;
        }

        // Ajustement selon le niveau d'activité
        switch (activityLevel) {
            case 'sedentaire':
                multiplier *= 0.9;
                break;
            case 'actif':
                multiplier *= 1.1;
                break;
            case 'tres-actif':
                multiplier *= 1.2;
                break;
        }

        // Arrondir les portions à des nombres plus pratiques
        return Object.fromEntries(
            Object.entries(basePortions).map(([key, value]) => {
                if (typeof value === 'number') {
                    return [key, Math.round(value * multiplier / 5) * 5];
                }
                return [key, value];
            })
        );
    }

    // Génération du programme alimentaire
    generateMealPlan(profile, sex, activityLevel) {
        const mealPlans = {
            'sechage-extreme': {
                title: 'Programme de Séchage Extrême',
                description: 'Programme strict pour une perte de poids maximale',
                meals: {
                    'petit-dejeuner': {
                        'blancs-oeuf': 6,
                        'avoine': 50,
                        'notes': 'Préparez les blancs en omelette'
                    },
                    'dejeuner': {
                        'poulet': 200,
                        'legumes': 200,
                        'huile-olive': 1,
                        'notes': 'Légumes vapeur ou grillés'
                    },
                    'collation': {
                        'whey': 30,
                        'pomme': 1,
                        'notes': 'À prendre 1h avant l\'entraînement'
                    },
                    'diner': {
                        'poisson': 200,
                        'legumes': 200,
                        'huile-colza': 1,
                        'notes': 'Privilégiez les poissons gras'
                    }
                }
            },
            // ... Autres profils similaires
        };

        const basePlan = mealPlans[profile];
        if (!basePlan) return null;

        // Ajuster les portions
        const adjustedMeals = {};
        for (const [mealName, meal] of Object.entries(basePlan.meals)) {
            adjustedMeals[mealName] = this.adjustPortions(meal, sex, activityLevel);
        }

        return {
            ...basePlan,
            meals: adjustedMeals,
            recommendations: {
                hydration: '2.5L d\'eau par jour',
                frequency: '4 repas indispensables',
                timing: 'Espacez les repas de 3-4 heures'
            }
        };
    }

    // Calcul complet du profil et du programme
    calculateFullProgram() {
        const state = this.loadState();
        if (!state.answers) return null;

        const height = parseFloat(state.answers.taille);
        const wristCircumference = parseFloat(state.answers.poignet);
        const currentWeight = parseFloat(state.answers.poids);
        const sex = state.answers.sexe;
        const activityLevel = state.answers.niveau_activite;

        const idealWeight = FitnessCalculator.calculerPoidsIdeal(wristCircumference, height, sex);
        const profile = this.determineProfile(currentWeight, idealWeight);
        const mealPlan = this.generateMealPlan(profile, sex, activityLevel);

        const results = {
            idealWeight,
            currentWeight,
            profile,
            mealPlan,
            metrics: {
                height,
                wristCircumference,
                bmi: currentWeight / ((height / 100) ** 2)
            }
        };

        // Sauvegarder les résultats
        state.results = results;
        this.saveState(state);

        return results;
    }
}

// Initialisation globale
window.fitnessCalculator = new FitnessCalculator();
