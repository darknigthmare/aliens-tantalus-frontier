# Audit level design, props et modularité V72

Date : 5 septembre 2026. Périmètre vérifié : seize salles du hub et dix annexes V71, rendu de leurs props et des acteurs humains, reprise des états de niveau mission. Ce rapport ne constitue pas une validation commerciale de toutes les campagnes.

## Défauts reproduits et corrections

| Priorité | Défaut observé dans le code ou le bitmap | Correction réelle |
|---|---|---|
| P1 | `climbing` maintenait le joueur sur une échelle même en demandant une sortie latérale | Sortie latérale, saut depuis l’échelle et sortie aux extrémités ; dix échelles parcourues par le test |
| P1 | Les nervures solides n’avaient aucune résolution verticale ascendante | Collision de tête contre la face inférieure ; passerelles restent à sens unique ; simulation en sous-pas maximaux de 1/120 s |
| P1 | Les corps de station traversaient leurs passerelles | Passerelles déplacées dans la portion médiane libre ; validation interdit leur intersection avec une station |
| P1 | Les objets foreground isolés sur une toile1920×720 étaient rendus plein-écran | Chaque foreground devient un objet ancré240×212 maximum au bout de sa salle, avec atténuation quand le joueur passe devant |
| P1 | Transparent padding des props/portes rendait les éléments visuels plus petits ou flottants face à leur collider | Cadrage exact depuis les trente `alpha.contentBounds` du rapport artistique V71 ; aspect conservé, pied visible au sol, dimensions de porte calculées depuis sa silhouette |
| P1 | Cinq accessoires sur six étaient déclarés mais pas dessinés ; `collidable:true` sans collider consommé | Cinq accessoires reçoivent des bitmaps existants indépendants. Deux caisses reposent sur la passerelle et disposent de collisions ; console partage strictement ses bornes avec son corps physique |
| P1 | Nervures physiques invisibles | Props de tuyau existants rendus à leurs ancres ; pas de nouveau placeholder rectangle pour les masquer |
| P1 | Porte d’annexe trop large pour certains supports étroits | Support choisi seulement si largeur de porte +64px disponible ; ancre avec32px de marge de chaque côté |
| P1 | Table de briefing V61 en vue plongeante3/4, affichée520×260 contre acteur92px | Nouvelle table OpenAI en élévation frontale orthographique ; cadrage natif1611:256, rendu520×82,63 avec pied visible exactement au sol624 |
| P2 | PNJ rendus140px contre joueur128px malgré des acteurs physiques identiques de92px | Même étalon128px pour tous les humains ; aucune substitution de sprite/identité |
| P2 | Râtelier-comptoir d’armurerie affiché290px avec corps solide136px | Asset affiché200px, comptoir solide80px ; la partie murale n’est pas une barrière à hauteur de tête |
| P2 | Props gonflant4% à proximité alors que leur collision restait fixe | Seul le halo d’interaction varie ; dimensions de l’objet restent fixes |
| P1 | Une sauvegarde de base refusée pouvait quand même restaurer événements/portes/hazards du niveau | Retour immédiat `base-resume-rejected`, aucune mutation de l’état de niveau |
| P0 | `undefined === undefined` sur identifiants de conduits supprimait les dégâts joueur et pouvait court-circuiter les ennemis sans réseau | Deux gardes exigent un vrai transit et un vrai réseau avant exemption ; dégâts et protection en vrai transit testés |
| P1 | La reine agrandie pouvait apparaître sous une plateforme et tenter un lift humanoïde | Recherche d’une surface proche libre et reliée au graphe ; corps336×268 conservé, mouvements vers volume bas refusés et connecteurs trop petits interdits |

## Art et absence de fond blanc

Le scan read-only a analysé les fichiers PNG du dossier hub/props et les trente WebP alpha des annexes. Tous les exports de props possèdent de vrais pixels transparents. Cela ne prouve pas que chaque bord est beau ni qu’aucune image blanche n’existe ailleurs.

- `bridge-terminal.png` :21,41% de transparence ;0,01% de pixels blancs opaques.
- `operations-table-v61.png` :47,15% de transparence ;0% de pixels blancs opaques, mais perspective3/4 inadaptée — remplacé, original conservé.
- Le master `hub-modular-props-atlas.png` est opaque avec61,66% de blanc. Il n’est référencé par aucun module `src` ; il reste une source de production, pas un asset de scène.
- Certains anciens exports présentent un liseré clair. Une recoloration globale des blancs aurait détruit des reflets légitimes : elle n’a pas été appliquée.

La nouvelle source OpenAI est conservée sous `assets/openai/sprites/frames/v72/props/operations-table-side-v72-source.png`, SHA-256 `e82aa014e331c4e81a02256b9642d21f726ab58013e5b28d65e36ac051230c03`. Le WebP et son rapport se trouvent dans `assets/openai/hub/props/operations-table-side-v72.*`.

Le packaging réutilise l’extraction V66 : clé magenta extérieure prouvée, trous fermés dont la couleur correspond strictement à l’extérieur et frange de deux pixels. Un despill périphérique reste limité à deux pixels de la transparence prouvée. Aucun pixel de forme supprimé, aucune invention de dessin et aucun redimensionnement de la source. Le rapport expose séparément les pixels de matte, de frange et de despill ; la source reste inchangée. Ce traitement technique n’est pas compté comme une deuxième génération OpenAI.

## Régressions exécutées

- Tests runtime/contrat annexes :27/27 avant intégration finale de la table ; dix entrées/sorties réciproques, dix parcours au sol, dix montées/sorties/sauts d’échelle, reprise Y/échelle, protection de la station hors portée, plafonds, rendu des accessoires et étalon PNJ/joueur.
- Tests niveau/reprise/conduits mission :14/14 après la garde de transaction de reprise.
- Lot table + hub/contrat :32/32 ; le packaging final a ensuite passé sa reconstitution exacte `--check` dans un lot de18tests.
- Volume royal :36plans réels (trois templates, douze variantes) testés avec corps336×268, sans passage à travers plateforme, sans réduction du sprite et avec surface reliée au graphe.
- Les bornes alpha runtime sont comparées aux valeurs du rapport V71. Le validateur contrôle bitmap/collider de chaque prop et support réel sous chaque caisse.
- La nouvelle table a un test de hashes, alpha, chroma, cadrage, placement et reconstitution déterministe `--check` sans réécriture.

La recette navigateur finale appartient au rapport de clôture global. Les tests ne prétendent pas remplacer l’inspection visuelle ni une traversée humaine exhaustive de440campagnes.

## Dette restante explicite

Les soixante instances de props des annexes utilisent les dix consoles dédiées et quatre bitmaps modulaires existants partagés : ce ne sont pas soixante nouveaux dessins spécifiques. Les accessoires de chaque fonction de salle, PNJ dédiés, exercices physiques, archives jouables et commandes CCTV complètes restent à produire. Le flag `independent-prop-bitmaps` n’est donc pas retiré.

La perspective des anciens autres props, le calage précis de chaque frame corporelle et les annotations narratives restent des audits distincts ; l’étalon humain128px ne certifie pas leur fidélité anatomique. Les cinquante WebP V71 sont des assets originaux de projet avec `canonExact:false`, pas une fidélité franchise1:1 certifiée.
