# V90 — lot local du 23 septembre 2026

## État et périmètre

Travail repris dans `D:/CodexWork/aliens-tantalus-frontier/project`, sur le chantier V88/V89 déjà non commité. Aucun reset, commit, push ni déploiement effectué dans ce lot. Le numéro technique du paquet reste 86.0.0 ; V90 désigne le lot de travail, pas une version publique publiée.

### Début jouable

Le quai des vivants est désormais une séquence physique : emporter le fret choisi, rejoindre le triage, assister le blessé, grimper à la passerelle, rétablir le sas, escorter trois civils et transmettre le constat avant de débloquer les opérations. Progression et reçu uniques sauvegardés, sans écraser les coordonnées du hub Tantalus.

Les contrôles navigateur partent d'un état de briefing isolé, puis utilisent clavier/clics réels. Ils ne refont pas le créateur, le réveil et l'exercice précédent. Les deux variantes de fret ont été parcourues. Le trajet quai → première mission → reprise → retraite conserve le fret sans second crédit.

La capture initiale de mission a révélé un écran transitoire de chargement. Le contrôle renforcé attend la fin des deux verrous d'images, puis vérifie déplacement au clavier et chrono actif avant et après rechargement ; aucune panne runtime reproduite. Voir rapport définitif de simulation ci-dessous.

### Créatures et encyclopédie

Les 35 identités importées restent branchées aux missions, à la découverte et à l'encyclopédie. Deux spécialisations partielles ajoutées : salve acide de la Pathogen Queen et progression irrégulière du Pathogen Runner. Avec V89, cinq identités ont un comportement spécialisé ; trente restent simplifiées. Les cinq contrats et leurs références sont visibles dans l'encyclopédie/BIOFORGE, avec distinction explicite entre mission et labo simplifié.

Les contrôles d'attaques utilisent le moteur/géométrie réels mais des positions et temps déterministes : ce n'est pas un parcours complet de campagne ni une validation de l'IA du labo.

### Menu et images

Vue extérieure : pas de cockpit ni de débris sans contexte autorisé. Mouvement continu conservé au retour des options. Quatre angles réellement dessinés, pas des profils déformés : Sulaco arrière, Narcissus avant/profondeur, Nostromo trois-quarts. Contrôle des dimensions PNG, SHA, cadrage desktop/mobile et repli sur la référence du même vaisseau en cas d'erreur. Aucune prétention de vraie 3D ou de canon exact.

Générateur intégré uniquement : 13 demandes, 11 PNG produits, 2 refus sans réessai (Spitter AFE et Warrior 1986). Big Chap refusé antérieurement, non relancé. Quatre fichiers admis au menu ; sept autres revus et conservés comme candidats/réserves privés. Reine en pose unique produite mais marge verticale trop serrée pour la promouvoir en master. Aucun atlas animé nouveau. Aucun original supprimé ou retouché par script.

[Galerie des onze images](v90-art-batch/index.html) · [références et réserves](v90-art-batch/REFERENCES.md) · [prompts/provenance/résultats](v90-art-batch/GENERATIONS.json)

## Vérifications du paquet final

Sortie indépendante : `E:/CodexQA/AliensTantalus/v90-final-20260923/dist`, servie seulement en boucle locale sur `http://127.0.0.1:4198`. Les fichiers privés V88–V90 et leurs candidats sont exclus ; seuls les quatre PNG admis sont publics dans le lot.

| Contrôle | Résultat vérifié |
| --- | --- |
| `npm test` | 3 277 cas : 3 276 PASS, 0 FAIL, 1 ignoré (création de symlink interdite par cet hôte) |
| `npm run lint` | 564 modules PASS |
| `npm run build` vers la sortie E: | PASS, 3 450 entrées catalogue global |
| `git diff --check` | PASS, avertissements LF/CRLF seulement |
| Fichiers servis/source SHA, MIME et exclusions privées | 99 contrôles PASS |
| Menu : chargement, erreurs injectées, quatre angles desktop/mobile | 11 contrôles, 12 captures, 0 erreur |
| Menu : options, commandes et objectifs affichés | 8 contrôles, 0 erreur |
| Comportements V89/V90 + catalogue/BIOFORGE | 17 contrôles, 22 captures, 0 erreur |
| Quai → première opération → reprise → retraite | PASS, 6 reloads, 8 captures ; déplacement/chrono actifs avant et après reprise |

Preuves privées sous `E:/CodexQA/AliensTantalus/v90-final-20260923` :

- `tests-final-pass.log`, `build.log`, `http-build.json`.
- `menu-browser/report.json`, `menu-options-browser/report.json`.
- `catalog-behaviors-browser/README.md` et ses trois `report.json`.
- `opening-browser/port-meridien-v90-browser.json` : premier passage, capture de chargement trop précoce ; ne pas l'utiliser seule pour certifier la simulation active.
- `opening-browser-simulation/port-meridien-v90-browser.json` : diagnostic renforcé et déplacement réel avant/après reprise ; invocation instrumentée en mémoire.
- `opening-browser-verified/port-meridien-v90-browser.json` : invocation directe reproductible du harnais renforcé. Chargement terminé en environ 0,6 s ; x159 → 270,99 puis, après reprise, x271,68 → 380,77, chrono actif, deux verrous d'images à false. Médikits 10 → 10 sans second crédit ; retour Tantalus réussi. Capture 07 inspectée sans overlay bloquant.

Le cache est `atf-v86-physical-placeables-shell-12`. Les deux modules de quai, ses dix bitmaps réutilisés et les quatre nouvelles vues sont dans le précache. Les harnais d'injection de panne contournent volontairement le service worker : ils ne constituent pas à eux seuls une preuve hors ligne.

Un contrôle distinct a ensuite installé le service worker, coupé le réseau de l'onglet ET du worker, vérifié le rejet d'une sonde réseau inédite et rechargé le menu depuis le cache : les quatre vues natives sont accessibles hors ligne et le mobile ne déborde pas. Les huit jalons du menu passent, mais le contrôle réseau global échoue : l'initialisation tente environ 204 requêtes d'autres assets non précachés. Preuves : `offline-browser/report.json`. Ne pas annoncer zéro erreur réseau hors ligne ni le jeu entier disponible hors ligne. L'essai `report-page-only-network.json` n'est pas une preuve hors ligne, car couper seulement l'onglet ne coupait pas le réseau du worker.

## Chantiers restant ouverts

- Suite intégrale PALISADE/Port-Méridien : ville, lieux intérieurs, Lina Kade, première rencontre, évacuation APC et persistance de la ville ne sont pas livrés par cette tranche.
- Ensemble films/jeux/comics non exhaustif ; voir [inventaire borné et verrous de preuve](V90_SOURCE_BACKED_GAPS_20260923.md). Les 571 profils historiques sont des variantes/adaptations, pas 571 espèces officielles.
- Anatomies/animations complètes et master unique certifié 1:1 restent non validés. Les références sont traçables, jamais une garantie de similitude parfaite.
- Auriga/Cheyenne privés non enregistrés ; réserves Sulaco avant, Nostromo dessous et Reine non admises automatiquement. Prometheus non généré faute de référence visuelle suffisamment accessible ce tour.
- Avant publication : ancien `docs/references/V64_IMAGEGEN_PROMPTS.md` encore servi dans ce build local (reliquat hors V90). Ne pas annoncer tous les prompts historiques privés ; filtrer cet export avant une publication qui exige leur retrait. Aucun changement silencieux des contrats V64.
- Disques très serrés à la fin des contrôles (C: environ 0,5 Go, D: 3,5 Go, E: 5,5 Go). Pas de nouvelle copie globale ou suppression non vérifiée.
