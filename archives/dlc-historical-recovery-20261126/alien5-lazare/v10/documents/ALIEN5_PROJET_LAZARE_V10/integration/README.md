# Lanceur facultatif — pas une fusion native
Le jeu autonome se suffit à lui-même. Ce lanceur ne doit être appliqué qu’à une **copie locale** de votre projet Tantalus. Il ajoute un lien dans son menu titre et copie la page du DLC dans `assets/dlc/alien5-lazare/index.html`. Il ne change ni les missions, ni le registre MIRE, ni les sauvegardes du jeu hôte.

Depuis le dossier de ce paquet :
```
node integration/install.mjs --check CHEMIN_DE_LA_COPIE_TANTALUS
node integration/install.mjs --apply CHEMIN_DE_LA_COPIE_TANTALUS
```
Pour remplacer une version précédente reconnue du lanceur :
```
node integration/install.mjs --upgrade CHEMIN_DE_LA_COPIE_TANTALUS
```
Pour enlever une installation inchangée :
```
node integration/install.mjs --remove CHEMIN_DE_LA_COPIE_TANTALUS
```
Le contrôle vérifie le nom du projet, un menu titre non ambigu et l’absence de fichiers étrangers à écraser. Les modifications concurrentes, liens symboliques et registres incohérents sont refusés. Le marqueur historique V1 identifie la même lignée de lanceur ; il ne signifie pas que le jeu copié est resté en V1. Les tests fournis portent sur des fixtures minimales jetables, pas sur l’ensemble du projet Tantalus.
