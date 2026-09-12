# V79 — Runtime de scène titre modulaire

## État réel

Cette passe livre l’architecture de composition, son premier rendu exécutable et un premier lot de **18 bitmaps originaux OpenAI validés et reliés**. Elle ne déclare pas les 53 slots artistiques V79 terminés.

- Le bitmap OpenAI V61 reste présent comme **fallback de compatibilité**, mais il est masqué dès que le compositeur V79 est utilisable.
- Le rendu V79 courant est constitué de surfaces séparées : espace, deux champs d’étoiles, nébuleuse, planète, atmosphère, nuages, orbite, trafic, débris, avant-plan et effets.
- Les primitives procédurales restent des fallbacks par strate pendant le chargement ou si un bitmap échoue. Un bitmap chargé masque seulement le fallback auquel son contrat le rattache.
- Le registre `src/title-scene-assets-v79.js` expose exactement 18 fichiers présents et contrôlés par hash : 11 strates communes, les planètes/atmosphères Acheron, Ceto et Mire-9, plus les nuages Acheron.
- Les 35 slots encore absents du manifeste ne sont jamais exposés par le catalogue runtime.

## Contrats runtime

| Surface | Contrat |
| --- | --- |
| Catalogue | `src/title-scene-catalog-v79.js` vérifie les rôles, IDs, modes et chemins d’images admis. |
| Compositeur | `src/title-scene-v79.js` crée un élément DOM indépendant par calque et isole une erreur d’asset. |
| Sélection | Acheron, Ceto et Mire-9 choisissent leur preset dédié ; leurs variantes Reach suivent le même mapping. Hors de ces mondes, le choix reste déterministe par profil/sauvegarde. Un choix explicite sauvegardé garde priorité. |
| Full | Toutes les strates et animations sont actives. |
| Reduced | Le trafic proche et l’impulsion secondaire sont retirés, les mouvements restants sont ralentis. |
| Static | Les onze familles restent composées sans animation. Activé par le réglage interne ou `prefers-reduced-motion`. |
| Fallback | Si le navigateur ne sait pas composer les gradients, si le DOM est incomplet ou si un futur asset requis échoue, le fond réel V61 redevient visible. |
| Cycle de vie | Les animations sont suspendues dès que l’écran titre est fermé et reprennent seulement lorsqu’il est affiché. |

## Responsive

Trois compositions sont couvertes sans retirer d’action du menu :

1. bureau 16:9 ;
2. portrait mobile ;
3. paysage compact/hauteur réduite.

Le voile de lisibilité est désormais progressif et non une séparation verticale opaque. La planète et ses calques liés partagent les mêmes variables de placement afin d’éviter un décalage atmosphère/nuages lors d’un changement de ratio.
Le conteneur réinitialise aussi son défilement horizontal au focus, à l’ouverture et à chaque resize : la séquence bureau → portrait → paysage → compact → bureau ne conserve plus de cadrage décalé.

## Garde-fous avant de déclarer le lot V79 complet

- produire et intégrer les 35 bitmaps encore manquants du manifeste de production ;
- atteindre les 20 presets réellement distincts demandés, sans dupliquer un même master sous plusieurs noms ;
- contrôler opacité, bords, perspective et continuité de chaque image ;
- faire une QA navigateur visuelle sur les trois presets et les trois modes ;
- vérifier la taille réseau, le cache PWA et le fallback hors ligne ;
- ne retirer le bitmap V61 qu’après présence et validation de tous les calques requis.
- réduire le transfert initial PNG, actuellement mesuré entre 7,20 et 7,72 Mio selon le preset, sans dégrader les alpha ni la provenance.

## Validation de cette passe

- tests unitaires : déterminisme, trois modes, onze rôles, parité des 18 hashes, lifecycle et fallback par strate ;
- contrats shell/build/PWA ;
- scénario navigateur complet V78 rejoué sur V79 aux formats 1280×720, 390×844, 844×390 et 480×320, puis contrôle explicite des trois presets (28 groupes, 12 captures, 0 issue).

Le runtime V79 et son premier lot graphique sont **intégrés** ; la production artistique globale reste **partielle** jusqu’aux gates ci-dessus.
