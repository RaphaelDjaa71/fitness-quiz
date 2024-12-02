#!/bin/bash

# Création du répertoire pour les images optimisées
mkdir -p images/optimized

# Conversion des SVG en WebP
for file in images/*.svg; do
    filename=$(basename "$file" .svg)
    convert "$file" -resize 96x96 "images/optimized/$filename.webp"
done

# Optimisation et conversion des PNG en WebP
for file in images/*.png; do
    filename=$(basename "$file" .png)
    convert "$file" -resize 96x96 -quality 85 "images/optimized/$filename.webp"
done

# Optimisation et conversion des JPG/JPEG en WebP
for file in images/*.{jpg,jpeg}; do
    filename=$(basename "$file" .jpg)
    filename=$(basename "$filename" .jpeg)
    convert "$file" -resize 96x96 -quality 85 "images/optimized/$filename.webp"
done

# Déplacement des fichiers optimisés
mv images/optimized/* images/
rmdir images/optimized

echo "Images optimisées et converties en WebP avec succès !"
