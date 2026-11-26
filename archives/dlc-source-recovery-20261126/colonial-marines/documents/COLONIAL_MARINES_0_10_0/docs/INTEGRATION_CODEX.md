# Entrée hôte facultative — pas une fusion de moteurs

## Contrat et limites

L’installateur `tools/install.mjs` reprend le contrat v86 de la livraison précédente : projet `aliens-tantalus-frontier`, menu `title-menu`, entrée `/src/app.js` et séquence de build comprenant `resolveSafeBuildOutput` ainsi que `verifyPublicReleaseV86(root)`. Son origine documentaire est le commit `496996f5ea557d970ec625aa346876f3eaed1c5f`. Ce contrat n’a pas été présenté comme le dernier moteur des DLC locaux ; aucun dépôt distant n’a été écrit lors de cette passe.

Le contenu copié est constitué de treize fichiers : index, CSS, données, règles Bug Hunt, maintenance, tactique, logistique, environnement, simulation, rendu, audio, interface et point d’entrée. Le script ajoute un bouton vers une page autonome et une copie de son dossier lors du build. Il ne partage ni l’horloge, ni les sauvegardes, ni les acteurs, ni le moteur MIRE de Tantalus. Aucun build complet de l’hôte n’a été exécuté ici.

## Procédure dans une copie du projet

```sh
node tools/install.mjs status /chemin/du/projet
node tools/install.mjs apply /chemin/du/projet
node tools/install.mjs remove /chemin/du/projet
```

L’installateur sauvegarde les fichiers modifiés, contrôle les hash et refuse une chaîne inconnue, un dossier DLC préexistant, des liens symboliques ou un retour arrière qui écraserait des changements. Les essais de ce pack sont faits sur fixtures reproduisant ce contrat.

Une installation des paquets 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8 ou 0.9 possède un identifiant de sauvegarde différent. **Ne pas forcer son écrasement.** Retirer cette installation avec l’installateur de son paquet d’origine, dans une copie de travail, puis appliquer 0.10. En cas de fichiers modifiés depuis, la protection de retour arrière doit rester active : conserver les deux versions et effectuer une intégration revue manuellement.

## Travail nécessaire avant intégration native

Un adaptateur doit faire passer les données de campagne vers les services natifs de chargement de salles, combat, ennemis, équipements, événements et sauvegardes. Il doit conserver les préconditions de la poursuite et du portique et migrer les reprises sans réinitialiser silencieusement le profil hôte. Les tests des autres DLC et les données de xenobiologie doivent être exécutés sur leur version réellement disponible avant fusion. Rien de cela n’est déclaré déjà réalisé par ce lanceur.


Les vingt pièces Stasis 0.3 sont natives au moteur de cette page DLC. Cette fusion interne ne change pas le statut du lanceur hôte. Les deux chroniques et Bug Hunt sauvegardent dans leur namespace V10, sans toucher aux profils hôtes.
