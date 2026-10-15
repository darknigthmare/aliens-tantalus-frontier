# Frontier Forge V130 — éditeur de niveaux

Extension de l’éditeur existant, basée sur `6c1ec551f21e2a87e9920aca35b8e77c7adc9b06` (V129). Les tenues, le moteur de campagne, les assets et les identifiants des contrôles existants ne sont pas remplacés.

## Utilisation

Ouvrir Frontier Forge par son entrée habituelle. Choisir Mission ou Intérieur USS Tantalus. Dans SECTEURS, créer, dupliquer, renommer ou redimensionner une salle. Les quatre gabarits sont Coursive technique, Puits de maintenance, Défense de secteur et Hangar de transit. Leur application remplace seulement la salle active, après confirmation si elle contient déjà des blocs.

Le catalogue garde les 13 types physiques existants. Choisir un type, puis éventuellement un autre calque : Arrière-plan, Structure, Interactions, Premier plan. Vue masque un calque ; Verrou empêche sa modification dans la session. Le verrou individuel d’un bloc est enregistré dans le projet. Masquer un calque physique ne le supprime PAS de la projection de test.

Tracer avec la brosse de 1 à 6 cases, une ligne, un rectangle plein ou le remplissage. Clic droit ou Maj gomme au lieu de peindre. Une sélection rectangulaire porte sur le calque actif ; la déplacer par glisser, par les flèches ou par X/Y dans l’inspecteur. Copier/coller utilise un presse-papiers interne, conservé entre salles pendant la session. Les miroirs horizontal et vertical conservent les identifiants ; le collage et la duplication créent de nouveaux identifiants. Une destination occupée ou hors limites refuse l’opération entière, sans écrasement partiel.

Molette : zoom autour du pointeur. Alt + glisser, bouton du milieu ou outil Caméra : déplacement de vue. La minimap centre la caméra ; Entrée sur cette minimap recadre. Agrandir l’atelier déploie l’interface sur la fenêtre sans modifier les vues de campagne.

## Raccourcis dans le canvas

| Commande | Raccourci |
|---|---|
| Brosse / Ligne / Rectangle / Remplissage | B / L / R / F |
| Sélection / Pipette / Caméra | V / I / P |
| Annuler / Rétablir | Ctrl ou Cmd + Z / Y ; Maj + Z rétablit aussi |
| Copier / Coller / Tout sélectionner | Ctrl ou Cmd + C / V / A |
| Réessayer l’enregistrement | Ctrl ou Cmd + S |
| Déplacer | Flèches ; Maj = 10 cases |
| Supprimer la sélection | Suppr ou Retour arrière |
| Cadrer / Grille | 0 / G |
| Annuler le geste, désélectionner, sortir de l’atelier agrandi | Échap selon le contexte |

Ces raccourcis ne capturent pas la saisie dans les champs de texte. Une perte de capture, un pointercancel ou la perte de focus annule le geste commencé. L’historique conserve au plus 60 opérations et applique un budget de 16 Mio aux états sérialisés ; les gestes sans modification n’effacent pas le rétablissement.

## Salles, données et raccords

Le format d’édition est `schema: 3`. Il contient `kind`, `name`, `activeRoomId`, `rooms` et `links`. Chaque salle contient `id`, `name`, `size: [colonnes, lignes]` et `cells`. Chaque bloc contient `id`, `x`, `y`, `type`, `layer`, `label` et `locked`. Une liaison contient `id`, `from: {roomId, cellId}`, `to` et `bidirectional`.

Budget : 32 salles, chacune de 8 × 8 à 128 × 72 cases ; 60 000 blocs au maximum dans le projet, sous réserve du budget JSON canonique de 4 Mio qui peut être atteint avant. Les imports historiques schema 1/2 sont convertis en une salle sans ignorer leurs dimensions. Les versions inconnues, doublons, positions invalides et liaisons pendantes sont refusés avant remplacement du document.

Une liaison relie deux sas physiques de salles différentes, avec au plus une liaison par sas. La suppression d’un sas ou de sa salle retire ses références. Une duplication ne copie pas les liaisons externes. Le rapport contrôle les salles non reliées et le sens des liaisons.

EXPORTER produit toutes les salles et tous les calques, pas seulement la vue courante. IMPORTER est annulable ; une lecture asynchrone dépassée par une autre modification est refusée. Exporter le rapport fournit tous les diagnostics, même lorsque l’inspecteur limite son affichage aux 100 premiers.

## Contrôle et limites importantes

Le bouton TESTER LA SALLE conserve le circuit natif isolé de la campagne. `serializeProject()` ajoute `size`, `tiles` et `validation` pour la salle active, compatibles avec le contrat précédent. Aucun nouveau compilateur de campagne n’est introduit.

**Les liaisons entre salles sont des données d’édition : elles ne déclenchent pas encore de transition jouable. Les calques Arrière-plan et Premier plan sont des repères dans l’éditeur, pas des décors rendus par le moteur.** Les sas, ascenseurs, menaces et équipements restent soumis aux comportements du compilateur existant ; ce changement ne leur ajoute pas de scripting personnalisé.

Les erreurs de la salle active bloquent le test : insertion absente ou multiple, absence d’objectif ou de sol, insertion sans support, chevauchement physique et objectif dans un volume fermé. Les autres salles restent inspectables sans bloquer le test d’une salle prête. Les sas sans encadrement, les objets sans support et les bases d’échelles non raccordées produisent des avertissements.

La recherche de volume fermé ne simule ni les sauts, ni les tailles des acteurs, ni les clés de portes. Ce n’est pas une preuve de navigabilité. Le canvas reste un éditeur de blocs symboliques, pas un aperçu final des assets du jeu.

## Sauvegarde et intégration

L’espace de travail reste dans `atf-v62-frontier-forge-workspace`, schema 1. Les anciens projets de campagne sont copiés une fois ; aucune clé de campagne n’est écrite par la Forge. Le schema 3 est conservé intégralement dans le gestionnaire existant.

Une ancienne version valide est copiée au mieux vers `atf-v62-frontier-forge-workspace-backup-v130`. Cette copie peut échouer faute de quota et ne remplace pas un export manuel. Une écriture échouée conserve les modifications en mémoire et signale l’absence de confirmation. Des données corrompues ou d’une version future ne sont pas automatiquement écrasées. Une comparaison avant écriture détecte un espace modifié depuis sa lecture ; il ne s’agit pas d’un verrou distribué ou d’une garantie atomique entre onglets.

En cas d’avertissement, exporter le projet avant de fermer. Ne pas effacer les données du site pour résoudre un conflit : elles contiennent aussi les profils du jeu. `exportRawV130()` et l’import explicite d’un workspace valide existent au niveau du gestionnaire pour la récupération ; cette PR ne fournit pas de nouvel assistant graphique de récupération de workspace.

Le contrôleur s’intègre à `setupEditor()` sans réécrire `app.js` ou `index.html`. La feuille de style reste dans `src`, déjà copié par le build. Le service worker réseau-d’abord n’est pas modifié ; une installation PWA complète et le jeu natif doivent encore être vérifiés comme indiqué dans QA-V130.md.

## Vérifications reproductibles

```sh
npm run test:forge
python scripts/verify-forge-browser-v130.py --output /tmp/forge-qa
# Environnement sans navigation HTTP locale : stockage explicitement simulé.
python scripts/verify-forge-browser-v130.py --offline --output /tmp/forge-qa-offline
```

Node 22 suffit pour la suite unitaire, sans installation de nouvelle dépendance. La suite navigateur demande Python, Playwright et Chromium ; `CHROMIUM_PATH` permet de préciser le binaire. Le harnais importe seulement les modules Forge et reproduit les contrôles du panneau natif, pas le moteur de campagne.
