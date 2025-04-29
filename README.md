# Jeu de Dames

Un jeu de dames moderne et interactif développé avec React, TypeScript et Tailwind CSS. Jouez contre un ami ou défiez l'IA avec trois niveaux de difficulté !

## 🎮 Fonctionnalités

- Interface utilisateur moderne et responsive
- Mode deux joueurs
- Mode contre l'IA avec trois niveaux de difficulté :
  - Facile
  - Moyen
  - Difficile
- Effets sonores immersifs
- Animations fluides
- Règles officielles du jeu de dames
- Détection automatique des prises obligatoires
- Promotion automatique en dame
- Indicateur de tour actuel
- Compteur de pièces capturées
- Détection de fin de partie

## 🚀 Démo

Essayez le jeu en ligne : [Jouer au Jeu de Dames](https://azuiou.github.io/Dames/)

## 🛠️ Technologies Utilisées

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (pour les icônes)

## 📝 Règles du Jeu

1. Les pions se déplacent en diagonale vers l'avant d'une case
2. La prise est obligatoire
3. Les prises multiples sont possibles
4. Un pion qui atteint la dernière rangée devient une dame
5. Les dames peuvent se déplacer en diagonale dans toutes les directions
6. Le joueur qui capture toutes les pièces adverses ou bloque leur mouvement gagne la partie

## 🎯 Fonctionnalités de l'IA

L'IA utilise un algorithme MinMax avec élagage alpha-beta pour :
- Évaluer la position du plateau
- Calculer les meilleurs coups possibles
- Adapter sa stratégie selon le niveau de difficulté
- Prioriser les prises et les positions stratégiques

## 🎨 Interface

- Design épuré et moderne
- Animations fluides pour améliorer l'expérience utilisateur
- Indicateurs visuels pour les mouvements possibles
- Effets spéciaux pour les captures et les promotions
- Mode sombre/clair automatique

## 🔊 Sons

- Effets sonores pour les mouvements
- Sons distincts pour les captures
- Fanfare pour la promotion en dame
- Musique de victoire
- Contrôle du volume intégré

## 🏆 Système de Jeu

- Match nul après 30 coups sans prise
- Détection automatique des situations de blocage
- Compteur de pièces capturées pour chaque joueur

## 📱 Compatibilité

- Ordinateurs de bureau
- Tablettes
- Smartphones
- Tous les navigateurs modernes

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👏 Remerciements

- Images : Pexels
- Sons : Freesound.org
- Icônes : Lucide React
