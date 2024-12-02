class ProfileGenerator {
    static PROFILES = {
        SECHAGE_EXTREME: 'sechage_extreme',
        SECHAGE_CLASSIQUE: 'sechage_classique',
        PRISE_MASSE_1: 'prise_masse_1',
        PRISE_MASSE_2: 'prise_masse_2',
        PRISE_MASSE_3: 'prise_masse_3'
    };

    static MEAL_PLANS = {
        sechage_extreme: {
            type: 'Séchage extrême (Endomorphe)',
            meals: {
                'Petit-déjeuner': ['6 blancs d\'œuf', '50g d\'avoine'],
                'Déjeuner': ['200g de poulet', '200g de légumes', '1 cuillère d\'huile d\'olive'],
                'Collation': ['30g de whey', '1 pomme'],
                'Dîner': ['200g de poisson', '200g de légumes', '1 cuillère d\'huile de colza']
            }
        },
        sechage_classique: {
            type: 'Séchage classique (Endomorphe)',
            meals: {
                'Petit-déjeuner': ['4 blancs d\'œuf', '100g de pain complet'],
                'Déjeuner': ['150g de viande blanche', '250g de légumes', '100g de riz complet'],
                'Collation': ['30g de whey', '2 noix'],
                'Dîner': ['150g de poisson', '250g de légumes', '1 cuillère d\'huile d\'olive']
            }
        },
        prise_masse_1: {
            type: 'Prise de masse - Profil 1 (Mésomorphe)',
            meals: {
                'Petit-déjeuner': ['6 blancs d\'œuf', '200g de pain complet', '3 noix du Brésil'],
                'Déjeuner': ['200g de viande blanche', '300g de riz complet', '200g de légumes'],
                'Collation': ['4 blancs d\'œuf', '200g de pain complet', '3 noix de cajou'],
                'Dîner': ['250g de poisson', '200g de légumineuses', 'légumes à volonté', '250g de riz complet']
            }
        },
        prise_masse_2: {
            type: 'Prise de masse - Profil 2 (Mésomorphe)',
            meals: {
                'Petit-déjeuner': ['5 œufs entiers', '150g de flocons d\'avoine'],
                'Déjeuner': ['200g de bœuf', '300g de patates douces', '200g de légumes'],
                'Collation': ['50g de whey', '1 banane', '30g d\'amandes'],
                'Dîner': ['200g de poulet', '250g de pâtes complètes', 'légumes à volonté']
            }
        },
        prise_masse_3: {
            type: 'Prise de masse - Profil 3 (Ectomorphe)',
            meals: {
                'Petit-déjeuner': ['6 blancs d\'œuf', '300g de pain complet', '3 noix du Brésil'],
                'Déjeuner': ['200g de viande blanche', '350g de riz complet', '200g de légumes'],
                'Collation': ['4 blancs d\'œuf', '300g de pain complet', '3 noix de cajou'],
                'Dîner': ['300g de poisson', '200g de légumineuses', 'légumes à volonté', '350g de riz complet', '100g de pain complet']
            }
        }
    };

    static determineProfile(currentWeight, idealWeight) {
        const difference = currentWeight - idealWeight;
        console.log('Détermination du profil:', {
            currentWeight,
            idealWeight,
            difference
        });
        
        // Séchage extrême : +20 kg ou plus par rapport au poids idéal
        if (difference >= 20) {
            return this.PROFILES.SECHAGE_EXTREME;
        }
        // Séchage classique : +15 kg par rapport au poids idéal
        else if (difference >= 15) {
            return this.PROFILES.SECHAGE_CLASSIQUE;
        }
        // Prise de masse - Profil 1 : +5 à +10 kg par rapport au poids idéal
        else if (difference >= 5 && difference <= 10) {
            return this.PROFILES.PRISE_MASSE_1;
        }
        // Prise de masse - Profil 2 : Au poids idéal (différence entre -5 et +5)
        else if (Math.abs(difference) < 5) {
            return this.PROFILES.PRISE_MASSE_2;
        }
        // Prise de masse - Profil 3 : -5 à -10 kg par rapport au poids idéal
        else if (difference <= -5 && difference >= -10) {
            return this.PROFILES.PRISE_MASSE_3;
        }
        // Par défaut, si en dehors des plages définies
        else if (difference > 10) {
            return this.PROFILES.SECHAGE_CLASSIQUE;
        } else {
            return this.PROFILES.PRISE_MASSE_3;
        }
    }

    static adjustPortions(mealPlan, sex, activityLevel) {
        const plan = JSON.parse(JSON.stringify(mealPlan)); // Deep clone
        const multiplier = this.getPortionMultiplier(sex, activityLevel);
        
        // Ajuster les quantités numériques
        Object.values(plan.meals).forEach(meal => {
            meal.forEach((item, index) => {
                const match = item.match(/(\d+)([g])/);
                if (match) {
                    const quantity = parseInt(match[1]);
                    const unit = match[2];
                    const adjustedQuantity = Math.round(quantity * multiplier);
                    meal[index] = item.replace(/\d+[g]/, `${adjustedQuantity}${unit}`);
                }
            });
        });
        
        return plan;
    }

    static getPortionMultiplier(sex, activityLevel) {
        let baseMultiplier = sex === 'homme' ? 1.2 : 0.8;
        
        switch(activityLevel) {
            case 'sedentaire':
                return baseMultiplier * 0.8;
            case 'modere':
                return baseMultiplier;
            case 'actif':
                return baseMultiplier * 1.2;
            case 'tres_actif':
                return baseMultiplier * 1.4;
            default:
                return baseMultiplier;
        }
    }

    static generateRecommendations() {
        return {
            hydration: "Buvez au minimum 2.5L d'eau par jour",
            mealFrequency: "Prenez 4 repas par jour de manière régulière",
            timing: "Espacez vos repas de 3-4 heures",
            supplements: "Prenez vos compléments protéinés (whey) après l'entraînement",
            preparation: "Préparez vos repas à l'avance pour maintenir une régularité"
        };
    }

    static generateFullProfile(currentWeight, idealWeight, sex, activityLevel) {
        const profile = this.determineProfile(currentWeight, idealWeight);
        const baseMealPlan = this.MEAL_PLANS[profile];
        const adjustedMealPlan = this.adjustPortions(baseMealPlan, sex, activityLevel);
        const recommendations = this.generateRecommendations();

        return {
            profile: profile,
            profileType: baseMealPlan.type,
            mealPlan: adjustedMealPlan.meals,
            recommendations: recommendations,
            weightDifference: currentWeight - idealWeight
        };
    }
}
