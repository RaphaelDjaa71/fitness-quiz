#!/bin/bash

# Script de déploiement pour Fitness Quiz

# Arrêter le script en cas d'erreur
set -e

# Variables
APP_DIR="/Users/toji/CascadeProjects/fitness-quiz"
ENV_FILE="$APP_DIR/config/.env.production"

# Aller dans le répertoire de l'application
cd "$APP_DIR"

# Afficher un message de début
echo "🚀 Démarrage du déploiement de Fitness Quiz"

# Vérifier les prérequis
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Charger les variables d'environnement
export $(cat "$ENV_FILE" | xargs)

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --production

# Construction des assets (si nécessaire)
echo "🛠️ Construction des assets..."
npm run build

# Migration de la base de données
echo "💾 Mise à jour de la base de données..."
npm run migrate

# Lancement de l'application avec PM2 pour la gestion des processus
echo "🌐 Lancement de l'application..."
pm2 start server.js --name "fitness-quiz" --env production

# Afficher le statut
pm2 list

echo "✅ Déploiement terminé avec succès !"
