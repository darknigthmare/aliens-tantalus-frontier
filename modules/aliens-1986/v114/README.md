# ALIENS — Lieux et identités / V114 RC1

Suite réelle de l’archive fournie V113 « Tenir les angles ». **Branche autonome jouable**, pas une archive du moteur Tantalus natif ni une reproduction complète1:1 du film.

## Jouer
Ouvrir `JOUER_ALIENS_V114.html` dans un navigateur récent. Il contient le code et les ressources procédurales nécessaires ; aucun média réseau obligatoire. Les tests utilisent les octets exacts dans Chromium, le transport local `file://` reste soumis à la politique de votre navigateur. Alternative : `npm run preview`, puis ouvrir le serveur local port8767.

L’opération locale conserve ses cinq objectifs et se termine au repli. Les inspections sont accessibles depuis le menu et l’atlas ; elles ne valident pas l’opération. Vingt-cinq lieux inspectables, onze d’opération, vingt raccords réciproques. Les lieux éloignés appartiennent à des ensembles distincts, sans porte magique entre vaisseau et planète.

## Commandes principales
A/D ou Q/D, flèches : horizontal. W/S ou Z/S : profondeur. E : agir / passage. R : sas partagé. F ou clic : tirer. M : carte. Tab : archives. Échap : pause. T : détecteur. V : prudence. L : torche. K : circuit local. P : balise. G/H/C : rallier/tenir/couvrir. X/N : poste/secteur.2 : discipline. B/I/Y : ravitailler/soigner/cartouche sentinelle. O/U/J : renfort/découpe/réparation.

**F2 : onglet Armement, sans pause.** Choisir un membre, puis l’arme qu’il possède. **F5 ou E : caisse d’armement à portée**. Le geste dure1,05 s et s’interrompt sans dotation anticipée. M240 et3 grenades sous-canon dans la caisse de maintenance ; shotgun et6 cartouches pour Hicks au départ neuf. Tous les profils sont essayables au râtelier du Sulaco en inspection, hors chronologie. Les grenades peuvent blesser l’équipe ; Newt ne reçoit jamais d’arme. Gateway ne permet pas le tir.

## Fidélité
Le bouton Fidélité ouvre l’atlas :lieux présents et manquants, personnages, armes et équipements, continuité. Les plans sont interprétés pour le jeu. Les costumes sont distincts, mais restent procéduraux stylisés. Les8 repères non présents et les systèmes non joués sont nommés, pas masqués derrière des fiches « complètes ».

Le rapport `RAPPORT_ILLUSTRE_V114.html` embarque12 captures directes de Chromium avec leur origine. Le Codex contient80 règles et25 plans calculés, explicitement étiquetés comme schémas et non captures.

## Sauvegardes
Exporter dans la pause. Un import valide reprend en pause ; un fichier invalide laisse la partie intacte. V113 est lue par son vrai validateur puis migrée sans dotation secondaire offerte. Les ajouts d’architecture peuvent rendre un ancien emplacement incompatible : le fichier est alors refusé, sans téléportation arbitraire. Voir le corpus QA pour le cas connu.

## Reproduire les contrôles
- `npm run check` :665 tests Node, dont579 historiques et86 V114.
- `npm run drive` :parcours publics locaux et inspections ; génère de nouveaux exports.
- `npm run build` :reconstruit le HTML.
- `npm run browser` :recettes Chromium via PythonPlaywright installé.
- `npm run docs` :génère Codex et rapport depuis les données/proofs.
- `npm run verify` :vérification SHA-256 en lecture seule.

Rejouer les recettes peut modifier leurs reçus et captures. Cela ne constitue pas une vérification de l’intégrité du paquet original ; utiliser `npm run verify` avant toute reconstruction.

Pas de publication GitHub/Vercel. AdaptateurV106 conservé mais non activé. Le boss et le final historique Reine/P-5000/sas restent à raccorder dans une prochaine étape native.
