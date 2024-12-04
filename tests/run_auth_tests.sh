#!/bin/bash

# Démarrer le serveur en arrière-plan
npm start &
SERVER_PID=$!

# Attendre que le serveur démarre
sleep 5

# Exécuter les tests Postman
newman run /Users/toji/CascadeProjects/fitness-quiz/tests/auth_tests.json \
    -e /Users/toji/CascadeProjects/fitness-quiz/tests/local_env.json

# Récupérer le code de sortie des tests
TEST_EXIT_CODE=$?

# Arrêter le serveur
kill $SERVER_PID

# Sortir avec le code de sortie des tests
exit $TEST_EXIT_CODE
