# V65 — Facehugger et fiabilisation du runtime

Date : 31 août 2026.

Ce lot poursuit la production ; il ne certifie ni les 500 planches demandées,
ni la complétude commerciale du jeu.

## Art réellement livré

Quatre planches OpenAI ImageGen, huit poses chacune : repos, course, attaque,
mort du Facehugger. Un atlas RGBA WebP 1024×2048 est intégré au profil
`enemy-002-facehugger` et à la forme Neuro-002, avec une échelle commune,
des pivots stables et une découpe compatible avec les deux renderers.

Les variantes ne sont pas déclarées achevées par réutilisation de cette image.
Les dix Ovomorph V65 non acceptés restent hors du build.

## Corrections

- Attaque Facehugger standard : anticipation, déplacement balayé contre les
  obstacles, impact unique et récupération sur huit poses à 12 fps. La cible
  reste verrouillée ; porte fermée, blessure ou cible invalide annulent le coup.
  La reprise de sauvegarde annule une attaque en cours avec un délai sûr,
  sans rejouer ses dégâts. Les autres profils restent inchangés.
- Blessure non létale distincte des lignes de mort des plaques d’action.
- Grilles variables : la moitié basse d’un atlas 4×8 n’est plus hors image.
- Chargement des ennemis visibles à la demande ; cache protégé contre
  l’éviction en boucle, avec 12 atlas inactifs conservés.
- Échec réseau : nouvelles tentatives espacées et pause de sécurité,
  indépendante de la pause manuelle ; aucun ennemi de substitution.
- Boss tué avant le trigger : le sas ne se reverrouille pas ; reprise
  des sauvegardes concernées sans rejouer les récompenses.
- Les huit fiches M577 affichent leur véritable bitmap runtime. Les fits
  restent explicitement des réemplois de châssis.
- Masters et aperçus filtrés avant copie du build ; candidats refusés non publiés.
- Le serveur local sert les WebP avec le bon type et renvoie 404 pour un asset absent.

## Sources et vérification

- [Audit de reprise et limites](references/V65_RESUME_AUDIT.md)
- [Inventaire runtime mesuré](references/V65_RUNTIME_COVERAGE.json)
- [Références et prompts ImageGen](references/V65_FACEHUGGER_IMAGEGEN.md)
- [Contenu lisible du nouveau partage](references/V65_SHARED_METROIDVANIA_REQUEST.md)

Commandes : `npm run qa`, `npm run art:v65:check`.
Résultat final : 448 tests réussis, lint et build 65.0.0 validés.

Les sources ImageGen et le contact-sheet ont été inspectés visuellement.
Les contrôles de dessin automatisés utilisent les vrais renderers avec Canvas
instrumenté. La QA interactive navigateur n’est pas certifiée dans ce lot,
la connexion du navigateur étant bloquée par l’environnement Windows.
