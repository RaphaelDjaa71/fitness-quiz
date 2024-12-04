class QuizResults {
    constructor() {
        this.answers = this.loadAnswers();
        this.initializeResults();
    }

    loadAnswers() {
        return JSON.parse(localStorage.getItem('quizAnswers')) || {};
    }

    initializeResults() {
        this.displaySummary();
        this.displayPersonalizedRecommendations();
        this.displayFitnessProfile();
        this.displayRecommendations();
        this.displayNextSteps();
    }

    displaySummary() {
        const summaryContainer = document.querySelector('.summary-grid');
        if (!summaryContainer) return;

        const summaryItems = [
            { icon: 'fa-bullseye', label: 'Objectif', value: this.getGoalText(this.answers.goal) },
            { icon: 'fa-venus-mars', label: 'Genre', value: this.getGenderText(this.answers.gender) },
            { icon: 'fa-calendar', label: 'Âge', value: `${this.answers.age} ans` },
            { icon: 'fa-ruler-vertical', label: 'Taille', value: `${this.answers.height} cm` },
            { icon: 'fa-weight', label: 'Poids actuel', value: `${this.answers['current-weight']} kg` },
            { icon: 'fa-weight-scale', label: 'Poids cible', value: `${this.answers['target-weight']} kg` },
            { icon: 'fa-running', label: 'Niveau d\'activité', value: this.getActivityText(this.answers['activity-level']) },
            { icon: 'fa-dumbbell', label: 'Expérience musculation', value: this.getExperienceText(this.answers.experience) },
            { icon: 'fa-calendar-check', label: 'Fréquence d\'entraînement', value: this.getFrequencyText(this.answers.frequency) },
            { icon: 'fa-utensils', label: 'Préférences alimentaires', value: this.getDietText(this.answers.diet) }
        ];

        summaryContainer.innerHTML = summaryItems.map(item => `
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">${item.label}</div>
                    <div class="summary-value">${item.value || 'Non spécifié'}</div>
                </div>
            </div>
        `).join('');
    }

    getGoalText(goal) {
        const goals = {
            'weight-loss': 'Perdre du poids',
            'muscle-gain': 'Prendre du muscle',
            'fitness': 'Être en meilleure forme'
        };
        return goals[goal] || goal;
    }

    getGenderText(gender) {
        const genders = {
            'male': 'Homme',
            'female': 'Femme'
        };
        return genders[gender] || gender;
    }

    getActivityText(activity) {
        const activities = {
            'sedentary': 'Sédentaire',
            'light': 'Léger',
            'moderate': 'Modéré',
            'active': 'Actif',
            'very-active': 'Très actif'
        };
        return activities[activity] || activity;
    }

    getExperienceText(experience) {
        const experiences = {
            'beginner': 'Débutant',
            'intermediate': 'Intermédiaire',
            'advanced': 'Avancé'
        };
        return experiences[experience] || experience;
    }

    getFrequencyText(frequency) {
        const frequencies = {
            '2-times': '2 fois par semaine',
            '3-times': '3 fois par semaine',
            '4-times': '4 fois par semaine',
            '5-times': '5+ fois par semaine'
        };
        return frequencies[frequency] || frequency;
    }

    getDietText(diet) {
        const diets = {
            'none': 'Standard',
            'vegetarian': 'Végétarien',
            'vegan': 'Végétalien',
            'keto': 'Keto',
            'paleo': 'Paléo'
        };
        return diets[diet] || diet;
    }

    displayPersonalizedRecommendations() {
        const container = document.querySelector('.recommendations-grid');
        if (!container) return;

        const recommendations = [
            this.getTrainingRecommendations(),
            this.getNutritionPlanRecommendations(),
            this.getLifestyleRecommendations()
        ];

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-title">
                    <i class="fas ${rec.icon}"></i>
                    ${rec.title}
                </div>
                <div class="recommendation-content">
                    <p>${rec.description}</p>
                    ${rec.list ? `
                        <ul class="recommendation-list">
                            ${rec.list.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${rec.emphasis ? `<p class="recommendation-emphasis">${rec.emphasis}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    getTrainingRecommendations() {
        const goal = this.answers.goal;
        const experience = this.answers.experience;
        const frequency = this.answers.frequency;
        const locations = this.answers.location || [];

        let title = 'Programme d\'entraînement';
        let icon = 'fa-dumbbell';
        let description = '';
        let list = [];
        let emphasis = '';

        // Déterminer la fréquence d'entraînement recommandée
        const frequencyText = {
            '2-times': '2 séances',
            '3-times': '3 séances',
            '4-times': '4 séances',
            '5-times': '5 séances ou plus'
        }[frequency] || '3-4 séances';

        // Recommandations spécifiques selon l'objectif
        if (goal === 'weight-loss') {
            description = `Pour optimiser votre perte de poids, nous recommandons ${frequencyText} par semaine combinant :`;
            list = [
                'Exercices cardio-vasculaires à intensité variable',
                'Séances de renforcement musculaire',
                'Exercices de mobilité et récupération'
            ];
            if (experience === 'beginner') {
                list.push('Initiation progressive aux mouvements de base');
            }
        } else if (goal === 'muscle-gain') {
            description = `Pour maximiser votre prise de muscle, nous recommandons ${frequencyText} par semaine focalisées sur :`;
            list = [
                'Exercices composés avec charges progressives',
                'Séances ciblées par groupes musculaires',
                'Récupération adaptée entre les séances'
            ];
            if (experience === 'advanced') {
                list.push('Techniques avancées (séries descendantes, super-séries)');
            }
        } else {
            description = `Pour améliorer votre condition physique, nous recommandons ${frequencyText} par semaine incluant :`;
            list = [
                'Mix d\'exercices cardio et musculation',
                'Séances de mobilité et souplesse',
                'Exercices fonctionnels adaptés'
            ];
        }

        // Adapter les recommandations selon le lieu d'entraînement
        if (locations.length === 2) {
            emphasis = 'Programme hybride combinant exercices en salle et à domicile pour plus de flexibilité';
            list.push('Alternance entre séances en salle et à domicile');
        } else if (locations.includes('gym')) {
            emphasis = 'Programme optimisé pour l\'utilisation des équipements de salle de sport';
            list.push('Utilisation complète du parc de machines');
            list.push('Accès aux charges lourdes pour progression optimale');
        } else if (locations.includes('home')) {
            emphasis = 'Programme adapté pour un entraînement efficace à domicile';
            list.push('Exercices avec poids du corps et équipement minimal');
            list.push('Solutions créatives pour progression sans matériel');
        }

        return { title, icon, description, list, emphasis };
    }

    getNutritionPlanRecommendations() {
        const goal = this.answers.goal;
        const diet = this.answers.diet;
        const currentWeight = parseFloat(this.answers['current-weight']);
        const targetWeight = parseFloat(this.answers['target-weight']);

        let title = 'Plan nutritionnel';
        let icon = 'fa-apple-alt';
        let description = '';
        let list = [];
        let emphasis = '';

        // Calcul des besoins caloriques de base (formule simplifiée)
        const basalCalories = Math.round(currentWeight * 24);
        
        if (goal === 'weight-loss') {
            const deficit = 500; // Déficit calorique recommandé
            description = `Plan nutritionnel pour une perte de poids saine et durable :`;
            list = [
                `Objectif calorique : environ ${basalCalories - deficit} calories par jour`,
                'Privilégier les aliments peu transformés et riches en protéines',
                'Répartir les repas sur la journée',
                'Maintenir une bonne hydratation (2L d\'eau/jour minimum)'
            ];
        } else if (goal === 'muscle-gain') {
            const surplus = 300; // Surplus calorique recommandé
            description = `Plan nutritionnel pour favoriser la prise de muscle :`;
            list = [
                `Objectif calorique : environ ${basalCalories + surplus} calories par jour`,
                'Augmenter les apports en protéines (1.6-2.2g/kg)',
                'Assurer un apport suffisant en glucides complexes',
                'Répartir les protéines sur 4-5 repas par jour'
            ];
        } else {
            description = `Plan nutritionnel équilibré pour votre bien-être :`;
            list = [
                `Maintenir un apport d'environ ${basalCalories} calories par jour`,
                'Équilibrer les macronutriments',
                'Privilégier les aliments complets',
                'Varier les sources de nutriments'
            ];
        }

        // Ajout de recommandations spécifiques au régime alimentaire
        if (diet === 'vegetarian') {
            list.push('Sources de protéines végétariennes : œufs, produits laitiers, légumineuses');
            emphasis = 'Attention particulière aux apports en B12 et fer';
        } else if (diet === 'vegan') {
            list.push('Sources de protéines végétales : légumineuses, tofu, seitan, tempeh');
            emphasis = 'Supplémentation en B12 recommandée';
        } else if (diet === 'keto') {
            list = [
                'Limiter les glucides à 20-50g par jour',
                'Augmenter les graisses saines',
                'Maintenir un apport protéique adéquat',
                'Surveiller les électrolytes'
            ];
        }

        return { title, icon, description, list, emphasis };
    }

    getLifestyleRecommendations() {
        const activityLevel = this.answers['activity-level'];
        const goal = this.answers.goal;

        let title = 'Mode de vie';
        let icon = 'fa-heart';
        let description = 'Recommandations pour optimiser vos résultats :';
        let list = [
            'Maintenir un rythme de sommeil régulier (7-9h par nuit)',
            'Gérer le stress par des techniques de relaxation',
            'Rester actif au quotidien'
        ];

        if (activityLevel === 'sedentary') {
            list.push('Augmenter progressivement l\'activité quotidienne');
            list.push('Prendre des pauses actives toutes les heures');
        } else if (activityLevel === 'very-active') {
            list.push('Assurer une récupération suffisante');
            list.push('Écouter les signaux de fatigue du corps');
        }

        if (goal === 'weight-loss') {
            list.push('Planifier les repas à l\'avance');
            list.push('Éviter les tentations alimentaires à la maison');
        }

        return { title, icon, description, list };
    }

    displayRecommendations() {
        const recommendationsContainer = document.querySelector('.recommendations');
        if (!recommendationsContainer) return;

        const recommendations = this.generateRecommendations();
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-icon">
                    <i class="fas ${rec.icon}"></i>
                </div>
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
            </div>
        `).join('');
    }

    generateRecommendations() {
        const goal = this.answers.goal;
        const experience = this.answers.experience;
        const equipment = this.answers.equipment || [];
        
        const recommendations = [
            {
                icon: 'fa-heart',
                title: 'Programme personnalisé',
                description: this.getPersonalizedProgram(goal, experience, equipment)
            },
            {
                icon: 'fa-apple-alt',
                title: 'Recommandations nutritionnelles',
                description: this.getNutritionRecommendations()
            },
            {
                icon: 'fa-chart-line',
                title: 'Objectifs recommandés',
                description: this.getGoalRecommendations()
            }
        ];

        // Add equipment-specific recommendation if needed
        if (equipment.length === 0 || equipment.includes('none')) {
            recommendations.push({
                icon: 'fa-dumbbell',
                title: 'Équipement recommandé',
                description: 'Pour optimiser vos résultats, nous vous recommandons de vous procurer au minimum une paire d\'haltères et un tapis de fitness.'
            });
        }

        return recommendations;
    }

    getPersonalizedProgram(goal, experience, equipment) {
        let baseProgram = '';

        // Determine base program based on goal and experience
        if (goal === 'weight-loss') {
            if (experience === 'beginner') {
                baseProgram = 'Programme de cardio-training progressif avec initiation aux exercices de force';
            } else if (experience === 'intermediate') {
                baseProgram = 'Mix équilibré de HIIT et musculation';
            } else {
                baseProgram = 'Programme intensif alternant cardio haute intensité et musculation';
            }
        } else if (goal === 'muscle-gain') {
            if (experience === 'beginner') {
                baseProgram = 'Programme de base en musculation avec focus sur les mouvements composés';
            } else if (experience === 'intermediate') {
                baseProgram = 'Split training avec progression en charge';
            } else {
                baseProgram = 'Programme de musculation avancé avec périodisation';
            }
        } else { // fitness
            if (experience === 'beginner') {
                baseProgram = 'Programme complet de remise en forme progressive';
            } else if (experience === 'intermediate') {
                baseProgram = 'Programme varié combinant cardio et renforcement';
            } else {
                baseProgram = 'Programme personnalisé haute intensité';
            }
        }

        // Adapt program based on available equipment
        let equipmentNote = '';
        if (equipment.length === 0 || equipment.includes('none')) {
            equipmentNote = ' adapté pour des exercices au poids du corps';
        } else if (equipment.includes('dumbbells')) {
            equipmentNote = ' utilisant des haltères pour une progression optimale';
        } else if (equipment.includes('gym')) {
            equipmentNote = ' optimisé pour une salle de sport complète';
        } else if (equipment.includes('home-gym')) {
            equipmentNote = ' adapté à votre équipement maison';
        }

        return baseProgram + equipmentNote;
    }

    getNutritionRecommendations() {
        const goal = this.answers.goal;
        const diet = this.answers.diet;

        let baseRecommendation = '';
        if (goal === 'weight-loss') {
            baseRecommendation = 'Déficit calorique modéré avec accent sur les protéines et légumes';
        } else if (goal === 'muscle-gain') {
            baseRecommendation = 'Surplus calorique contrôlé avec focus sur les protéines et glucides complexes';
        } else {
            baseRecommendation = 'Alimentation équilibrée adaptée à vos besoins énergétiques';
        }

        // Add diet-specific recommendations
        let dietNote = '';
        if (diet === 'vegetarian') {
            dietNote = '\nSources de protéines végétariennes : œufs, produits laitiers, légumineuses';
        } else if (diet === 'vegan') {
            dietNote = '\nSources de protéines végétales : légumineuses, tofu, seitan, tempeh';
        } else if (diet === 'keto') {
            dietNote = '\nRépartition recommandée : 70% lipides, 25% protéines, 5% glucides';
        } else if (diet === 'paleo') {
            dietNote = '\nFocus sur les aliments non transformés, viandes maigres et légumes';
        }

        return baseRecommendation + dietNote;
    }

    getGoalRecommendations() {
        const currentWeight = parseFloat(this.answers['current-weight']);
        const targetWeight = parseFloat(this.answers['target-weight']);
        const goal = this.answers.goal;

        if (goal === 'weight-loss') {
            const weightDiff = currentWeight - targetWeight;
            return `Objectif de perte de ${weightDiff.toFixed(1)}kg de manière saine et durable`;
        } else if (goal === 'muscle-gain') {
            const weightDiff = targetWeight - currentWeight;
            return `Objectif de prise de ${weightDiff.toFixed(1)}kg de masse musculaire`;
        }
        return 'Amélioration globale de la condition physique et du bien-être';
    }

    calculateIdealWeight() {
        // Méthode de Monnerot-Dumaine pour calculer le poids idéal
        const { height, wristCircumference, gender } = this.answers;
        
        // Conversion de la hauteur en cm si nécessaire
        const heightCm = typeof height === 'string' ? parseFloat(height.replace('cm', '')) : height;
        
        // Conversion du tour de poignet en cm
        const wristCircumferenceCm = typeof wristCircumference === 'string' 
            ? parseFloat(wristCircumference.replace('cm', '')) 
            : wristCircumference;
        
        // Calcul selon la méthode de Monnerot-Dumaine
        let idealWeight;
        if (gender === 'homme') {
            // Formule pour les hommes
            idealWeight = (heightCm - 100) - ((heightCm - 150) / 4) + ((wristCircumferenceCm - 18) * 0.5);
        } else {
            // Formule pour les femmes
            idealWeight = (heightCm - 100) - ((heightCm - 150) / 2.5) + ((wristCircumferenceCm - 16) * 0.5);
        }
        
        return Math.round(idealWeight);
    }

    determineMealPlan() {
        const currentWeight = parseFloat(this.answers.currentWeight);
        const idealWeight = this.calculateIdealWeight();
        const weightDifference = currentWeight - idealWeight;

        let mealPlanType;
        if (weightDifference > 20) {
            mealPlanType = 'Séchage extrême';
        } else if (weightDifference > 15) {
            mealPlanType = 'Séchage classique';
        } else if (weightDifference >= 5 && weightDifference <= 10) {
            mealPlanType = 'Prise de masse - Profil 1';
        } else if (Math.abs(weightDifference) < 5) {
            mealPlanType = 'Prise de masse - Profil 2';
        } else if (weightDifference >= -10 && weightDifference < -5) {
            mealPlanType = 'Prise de masse - Profil 3';
        } else {
            // Cas par défaut
            mealPlanType = 'Prise de masse - Profil 2';
        }

        return {
            type: mealPlanType,
            idealWeight: idealWeight,
            weightDifference: weightDifference
        };
    }

    getMealPlanDetails(mealPlanType) {
        const mealPlans = {
            'Séchage extrême': {
                'Petit-déjeuner': [
                    'Blanc d\'œuf (3-4)',
                    'Protéines en poudre (30g)',
                    'Fruits rouges (50g)'
                ],
                'Déjeuner': [
                    'Poulet maigre (150g)',
                    'Légumes verts (200g)',
                    'Riz brun (50g)'
                ],
                'Collation': [
                    'Thon en conserve (1 boîte)',
                    'Concombre',
                    'Amandes (10-15)'
                ],
                'Dîner': [
                    'Poisson blanc (150g)',
                    'Salade verte',
                    'Patate douce (100g)'
                ]
            },
            'Séchage classique': {
                'Petit-déjeuner': [
                    'Œufs entiers (2)',
                    'Protéines en poudre (25g)',
                    'Fruits (1 portion)'
                ],
                'Déjeuner': [
                    'Dinde (120g)',
                    'Légumes mixtes (150g)',
                    'Quinoa (75g)'
                ],
                'Collation': [
                    'Yaourt grec',
                    'Fruits secs (30g)',
                    'Beurre de cacahuète (1 cuillère)'
                ],
                'Dîner': [
                    'Saumon (120g)',
                    'Légumes grillés',
                    'Riz complet (50g)'
                ]
            },
            'Prise de masse - Profil 1': {
                'Petit-déjeuner': [
                    'Œufs entiers (3)',
                    'Avoine (80g)',
                    'Banane',
                    'Beurre de cacahuète'
                ],
                'Déjeuner': [
                    'Bœuf maigre (150g)',
                    'Riz blanc (100g)',
                    'Légumes (200g)',
                    'Huile d\'olive'
                ],
                'Collation': [
                    'Shake protéiné',
                    'Fruits secs (50g)',
                    'Fruits frais'
                ],
                'Dîner': [
                    'Poulet (180g)',
                    'Pâtes complètes (100g)',
                    'Sauce tomate',
                    'Fromage'
                ]
            },
            'Prise de masse - Profil 2': {
                'Petit-déjeuner': [
                    'Œufs entiers (2)',
                    'Pain complet',
                    'Avocat',
                    'Smoothie protéiné'
                ],
                'Déjeuner': [
                    'Thon frais (150g)',
                    'Patates (100g)',
                    'Légumes verts',
                    'Sauce au yaourt'
                ],
                'Collation': [
                    'Fromage blanc',
                    'Fruits',
                    'Noix'
                ],
                'Dîner': [
                    'Poisson (150g)',
                    'Quinoa (75g)',
                    'Légumes rôtis',
                    'Sauce à l\'ail'
                ]
            },
            'Prise de masse - Profil 3': {
                'Petit-déjeuner': [
                    'Œufs entiers (4)',
                    'Pain complet épais',
                    'Beurre de noisette',
                    'Fruits'
                ],
                'Déjeuner': [
                    'Steak (200g)',
                    'Pâtes complètes (150g)',
                    'Légumes sautés',
                    'Sauce au fromage'
                ],
                'Collation': [
                    'Gainer protéiné',
                    'Fruits secs',
                    'Fruits frais'
                ],
                'Dîner': [
                    'Poulet (200g)',
                    'Riz complet (150g)',
                    'Légumes grillés',
                    'Sauce barbecue'
                ]
            }
        };

        return mealPlans[mealPlanType] || mealPlans['Prise de masse - Profil 2'];
    }

    determineProfile() {
        const mealPlanInfo = this.determineMealPlan();
        const morphotype = this.determineMorphotype();

        return {
            type: mealPlanInfo.type,
            morphotype: morphotype,
            meals: this.getMealPlanDetails(mealPlanInfo.type),
            details: {
                idealWeight: mealPlanInfo.idealWeight,
                weightDifference: mealPlanInfo.weightDifference
            }
        };
    }

    determineMorphotype() {
        const { height, wristCircumference, gender } = this.answers;
        
        // Conversion de la hauteur en cm si nécessaire
        const heightCm = typeof height === 'string' ? parseFloat(height.replace('cm', '')) : height;
        
        // Conversion du tour de poignet en cm
        const wristCircumferenceCm = typeof wristCircumference === 'string' 
            ? parseFloat(wristCircumference.replace('cm', '')) 
            : wristCircumference;
        
        // Calcul du morphotype
        let morphotype;
        if (gender === 'homme') {
            if (wristCircumferenceCm < 17) {
                morphotype = 'Ectomorphe';
            } else if (wristCircumferenceCm < 19) {
                morphotype = 'Mésomorphe';
            } else {
                morphotype = 'Endomorphe';
            }
        } else {
            if (wristCircumferenceCm < 15) {
                morphotype = 'Ectomorphe';
            } else if (wristCircumferenceCm < 17) {
                morphotype = 'Mésomorphe';
            } else {
                morphotype = 'Endomorphe';
            }
        }

        return morphotype;
    }

    getMorphotypeIcon(morphotype, gender) {
        const icons = {
            'Endomorphe': {
                'homme': '<i class="fas fa-male fa-4x"></i><i class="fas fa-circle fa-3x" style="margin-left: -25px; opacity: 0.3;"></i>',
                'femme': '<i class="fas fa-female fa-4x"></i><i class="fas fa-circle fa-3x" style="margin-left: -25px; opacity: 0.3;"></i>'
            },
            'Mésomorphe': {
                'homme': '<i class="fas fa-male fa-4x"></i><i class="fas fa-dumbbell fa-2x" style="margin-left: -25px;"></i>',
                'femme': '<i class="fas fa-female fa-4x"></i><i class="fas fa-dumbbell fa-2x" style="margin-left: -25px;"></i>'
            },
            'Ectomorphe': {
                'homme': '<i class="fas fa-male fa-4x"></i><i class="fas fa-ruler-vertical fa-2x" style="margin-left: -25px;"></i>',
                'femme': '<i class="fas fa-female fa-4x"></i><i class="fas fa-ruler-vertical fa-2x" style="margin-left: -25px;"></i>'
            }
        };
        return icons[morphotype]?.[gender] || icons[morphotype]?.['homme'];
    }

    displayFitnessProfile() {
        const profile = this.determineProfile();
        const profileContainer = document.querySelector('.profile-type');
        const mealsContainer = document.querySelector('.meals-grid');

        if (!profileContainer || !mealsContainer) return;

        // Déterminer le sexe pour l'illustration
        const gender = this.answers.gender || 'homme';

        // Afficher le type de profil avec l'illustration
        profileContainer.innerHTML = `
            <div class="morphotype-illustration">
                ${this.getMorphotypeIcon(profile.morphotype, gender)}
            </div>
            <div class="profile-info">
                <h3>${profile.type}</h3>
                <div class="morphotype">Morphotype : ${profile.morphotype}</div>
                <p class="description">
                    ${this.getMorphotypeDescription(profile.morphotype)}
                </p>
                <p class="ideal-weight">Poids idéal : ${profile.details.idealWeight} kg</p>
                <p class="weight-difference">Écart de poids : ${profile.details.weightDifference} kg</p>
            </div>
        `;

        // Afficher le plan alimentaire en grille 2x2
        mealsContainer.innerHTML = Object.entries(profile.meals).map(([mealName, items]) => `
            <div class="meal-card">
                <div class="meal-card-content">
                    <h4 class="meal-title">
                        ${this.getMealIcon(mealName)}
                        ${mealName}
                    </h4>
                    <ul class="meal-list">
                        ${items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    getMealIcon(mealName) {
        const icons = {
            'Petit-déjeuner': '<i class="fas fa-sun"></i>',
            'Déjeuner': '<i class="fas fa-utensils"></i>',
            'Collation': '<i class="fas fa-apple-alt"></i>',
            'Dîner': '<i class="fas fa-moon"></i>'
        };
        return icons[mealName] || '';
    }

    getMorphotypeDescription(morphotype) {
        const descriptions = {
            'Endomorphe': 'Tendance naturelle à stocker les graisses, masse musculaire développée. Votre programme est conçu pour optimiser la perte de graisse tout en préservant votre masse musculaire.',
            'Mésomorphe': 'Facilité à prendre du muscle et à perdre de la graisse. Votre programme est équilibré pour maximiser vos avantages naturels.',
            'Ectomorphe': 'Métabolisme rapide, difficulté à prendre du poids. Votre programme est axé sur la prise de masse avec un surplus calorique important.'
        };
        return descriptions[morphotype] || '';
    }

    displayNextSteps() {
        const nextStepsContainer = document.querySelector('.next-steps');
        if (!nextStepsContainer) return;

        const nextSteps = [
            {
                icon: 'fa-calendar-alt',
                title: 'Planifier votre programme',
                description: 'Commencez par établir un planning d\'entraînement adapté à votre emploi du temps'
            },
            {
                icon: 'fa-clipboard-list',
                title: 'Suivi des progrès',
                description: 'Utilisez notre outil de suivi pour mesurer vos progrès et rester motivé'
            },
            {
                icon: 'fa-users',
                title: 'Rejoindre la communauté',
                description: 'Connectez-vous avec d\'autres membres pour partager vos expériences et vous motiver mutuellement'
            }
        ];

        nextStepsContainer.innerHTML = nextSteps.map(step => `
            <div class="next-step-card">
                <i class="fas ${step.icon}"></i>
                <div class="next-step-card-content">
                    <h3>${step.title}</h3>
                </div>
            </div>
        `).join('');
    }
}

// Initialiser les résultats quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new QuizResults();
});
