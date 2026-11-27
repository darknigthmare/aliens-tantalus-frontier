# ALIEN 5 — PROJET LAZARE
## V9 · Les lignes de feu · 1.8.0-candidate.1

### Jouer
Ouvrir `ALIEN5_PROJET_LAZARE_JOUER.html`. Ce fichier contient ses scripts et styles et ne demande aucun téléchargement. La version modulaire est `game/index.html`. Son rendu vectoriel est un prototype stylisé, pas une restitution photoréaliste des concepts. Navigateur de bureau conseillé ; commandes tactiles disponibles.

### Ce qui change
Y alterne la visée classique et la visée libre dans le plan du sol (ce n’est pas une élévation en 3D). Souris : viser le torse puis cliquer. Stick droit + gâchette droite pour le contrat de manette standard ; aucune manette physique testée dans cette livraison. Le pavé VISER sous le terrain fonctionne indépendamment des déplacements. Tirer reste un bouton séparé au tactile.

P ouvre Défense. Après réarmement du groupe auxiliaire, rejoindre la soute des dépanneurs : la caisse S-12 est à x1180 / z0,50. Un seul kit, 48 cartouches, 70 points d’intégrité. Pose dans une salle avec profondeur, loin des accès ; 2 secondes, puis armer sur place. Secteur 110°, portée 580 unités. Le petit arc dessiné prévisualise la direction, pas la portée complète. La sentinelle retient le feu devant un humain. Recharger utilise la réserve de Ripley. Replier conserve cartouches, dégâts et chauffe. Un châssis détruit ne se répare pas ; aucune simulation de tirs hors de la pièce active.

La case **Dotation rationnée**, inactive par défaut, ne concerne que les nouvelles parties. Départ : réserve80, carburant60, soins2, Hicks48. Les nouvelles cartouches/carburant des caches sont divisés par deux ; plafonds Ripley96/80/3, Hicks64. Le chargeur initial, les points de santé et les ennemis restent inchangés. Les ressources personnelles de Newt ne sont pas amputées. Le profil accompagne la sauvegarde ; une V8 importée reste à sa dotation normale.

Six paragraphes conditionnels complètent le bilan et ses exports : témoins, civils, équipiers, laboratoire, cargo et S-12. Ce ne sont pas six fins supplémentaires. Les trois dénouements existants demeurent.

### Commandes conservées
ZQSD / WASD / flèches : marcher. Maj : marche silencieuse. E : agir/interrompre. Espace ou clic : tirer. R : recharger. 1/2 : armes. H : soin. F : leurre (carburant de Ripley ; réserve personnelle de Newt). L : torche. T : détecteur. B : regroupement. C : ordre de Hicks. G : transfert de munitions. X : niche. V : renforcer une cloison. U : industrie. K : pinces du chargeur. O : signature M-4. Tab : carte. J : journal. Échap : pause. Les menus reprennent les commandes à portée et ne donnent pas d’action distante.

### Reprise
Exporter un JSON en V8 puis Pause → Importer en V9. Formats V1 à V9 acceptés. Clé `atf.alien5.lazare.v9` ; les anciennes clés ne sont pas écrasées. Trois emplacements manuels, automatique validé et copie de secours. Les écrasements et reprises demandent confirmation. En cas de refus de stockage, conserver l’export JSON.
La persistance native après fermeture du navigateur n’est pas certifiée dans l’environnement de test : les tests de stockage emploient un substitut explicite, séparé du contrôle du refus natif.

### Livrables et vérification
`CODEX_ALIEN5.html` : 128 règles et 56 fiches illustrées.
`RAPPORT_VISUEL.html` : changements, captures, preuves et limites.
`game/` : sources cumulatives V1–V9. Les fichiers historiques ne sont pas des moteurs alternatifs sélectionnés : ils forment une chaîne chargée dans un ordre défini.
`qa/qa-summary-v9.json` : 552 contrôles de jeu, interface et installation ; contrôles documentaires séparés.
Les quatre campagnes automatiques (Récit/Survie, standard/rationné) terminent 27 objectifs, les trois civils, Miller et Hicks. Leurs pilotes connaissent positions et solutions. Elles ne certifient pas une difficulté humaine. Un replay S-12 séparé part d’un checkpoint obtenu par ce pilote et abat le drone en quatre tirs avant repli à44/48.
Les captures de visée isolées et l’atlas sont préparés ; les captures de défense reprennent les checkpoints pilotés. Chromium a refusé une vraie navigation HTTP locale avec ERR_BLOCKED_BY_ADMINISTRATOR ; tests par `page.set_content`, horloge contrôlée, pas un banc de FPS. Les commandes tactiles et le contrat logiciel de manette ne constituent pas un essai sur appareil physique.

### Reconstruire
Node20 ou plus pour la simulation et l’installateur ; Python3 pour construire le HTML et les documents. La reconstruction du HTML utilise uniquement la bibliothèque standard Python. Tests et documents navigateur : Python Playwright, Chromium ; documents : Pillow, BeautifulSoup4. Aucun paquet n’est requis pour ouvrir le HTML livré.

```
npm run build
npm test
npm run test:campaign
npm run test:browser
npm run qa:summary
npm run docs
npm run test:docs
npm run package
```

Les suites de régression conservent leurs noms V4–V8 mais chargent bien systems-v9.js. Leurs rapports sont listés explicitement dans le résumé V9. Les fixtures d’anciennes versions servent seulement aux migrations/régressions ; elles ne sont pas comptées comme de nouveaux parcours.

### Intégration facultative
Lire `integration/README.md` s’il est présent, sinon `node integration/install.mjs --help`. Le lanceur travaille sur une copie locale, contrôle son propre contenu et peut le retirer. Il ajoute uniquement un bouton et sa page autonome ; ce n’est pas une fusion au moteur natif ou aux sauvegardes de Tantalus. Les tests utilisent des fixtures jetables, pas le jeu hôte complet. Aucun push ou déploiement distant effectué.

### Provenance
Interprétation non officielle du projet Alien5. Calder, Lazare, la topologie, les dialogues, les comportements du M-4 et de S-12 et les dénouements sont des créations de cette adaptation. Références artistiques héritées documentées dans le codex ; aucune nouvelle recherche ni scénario intégral authentifié dans cette continuation. Alien appartient à ses ayants droit ; le paquet n’accorde aucune autorisation d’exploitation commerciale de leur propriété intellectuelle.
