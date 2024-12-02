# Quiz Fitness - Application Web

Une application web interactive pour créer des programmes fitness personnalisés basés sur les réponses des utilisateurs à un questionnaire détaillé.

## Fonctionnalités

- Système d'authentification sécurisé
- Quiz interactif multi-étapes
- Génération de programmes personnalisés
- Historique des résultats
- Interface utilisateur moderne et responsive
- Sécurité renforcée (CSRF, XSS, etc.)

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

## Installation

1. Clonez le dépôt :
```bash
git clone [URL_DU_REPO]
cd fitness-quiz
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet :
```env
MONGODB_URI=mongodb://localhost:27017/fitness_quiz
JWT_SECRET=votre_secret_jwt_super_securise
SESSION_SECRET=votre_secret_session_super_securise
COOKIE_SECRET=votre_secret_cookie_super_securise
PORT=3000
NODE_ENV=development
```

4. Démarrez MongoDB :
```bash
mongod
```

5. Lancez l'application :
```bash
npm start
```

L'application sera accessible à l'adresse : http://localhost:3000

## Structure du Projet

```
fitness-quiz/
├── config/         # Configuration de l'application
├── middleware/     # Middleware personnalisés
├── models/         # Modèles Mongoose
├── public/         # Fichiers statiques
│   ├── css/
│   ├── js/
│   └── images/
├── routes/         # Routes de l'API
└── app.js         # Point d'entrée de l'application
```

## Sécurité

- Hachage des mots de passe avec bcrypt
- Protection CSRF
- Protection XSS
- Limitation du taux de requêtes
- En-têtes de sécurité avec Helmet
- Sanitization des entrées MongoDB

## Scripts Disponibles

- `npm start` : Démarre l'application
- `npm run dev` : Démarre l'application en mode développement avec nodemon
- `npm test` : Lance les tests

## Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
