# Research: Salles hybrides 2D / 2,5D — prototype du hangar

## R1 — Profondeur : coordonnée de présentation et de collision, pas de nouvelle physique

- **Decision**: le joueur et les PNJ gardent leur physique actuelle sur le rail (x, y, gravité, sol `FLOOR_Y = 624`). La profondeur `z` est une coordonnée supplémentaire, bornée par le sol praticable de la salle, utilisée pour les collisions au sol (emprises), le filtrage des interactions et le rendu.
- **Rationale**: le hub repose sur ~25 mixins (circulation, échelles, ascenseurs, portes, conduits, annexes, crises) qui supposent un plan de marche unique. En gardant x/y inchangés, tous ces systèmes continuent de fonctionner et la sauvegarde de position reste compatible.
- **Alternatives considered**: refaire un moteur de déplacement en (x, z) pour le hangar (rejeté : duplique la physique, casse portes, ascenseurs et conduits) ; vraie projection perspective (rejetée par le propriétaire : pas de mise à l'échelle).

## R2 — Correspondance profondeur → écran

- **Decision (révisée après relevé du hangar)**: `pied à l'écran = FLOOR_Y − z`, 1 px par unité, `z ∈ [−80, 0]`. `z = 0` est le rail existant le long du mur (portes, échelles, pupitres) et la limite du fond. `z < 0` vient vers la caméra, sur la bande de sol déjà dessinée en perspective sous le rail (V116). Le sol praticable couvre y 624–704.
- **Rationale**: le rail porte déjà les portes et les échelles. Un sol « derrière le rail » aurait recouvert les portes et contredit l'architecture visible (règle de niveau d'AGENTS.md). La version initiale `[−56, +96]` est abandonnée pour cette raison.
- **Alternatives considered**: profondeur seulement vers l'avant (rejetée : pas de place pour passer derrière le dropship) ; facteur < 1 (profondeur trop peu visible).

## R3 — Occultation : objets du sol, puis passe masquée

- **Decision (révisée à l'implémentation)**: le dropship (retiré du décor arrière) et les caisses sont dessinés juste après le sol, sous les personnages, dont l'ordre de dessin existant est conservé. Pour chaque objet ayant un personnage derrière lui, l'objet est redessiné sur un calque hors écran, limité aux boîtes de ces personnages moins celles des personnages placés devant, puis composé par-dessus. Le joueur masqué garde un contour en pointillé.
- **Rationale**: les surcharges existantes de `drawPlayer` et le dessin des PNJ (code en ligne de `drawWorld`) restent intacts. Le surcoût n'existe que lorsqu'un personnage est derrière un objet.
- **Alternatives considered**: passe triée qui redessine les PNJ (rejetée : dessin en ligne non réutilisable) ; décalage seul de `y` (rejeté : mauvaise occultation).
- **Limite**: entre personnages, l'ordre reste PNJ puis joueur ; un PNJ placé devant le joueur ne le masque pas encore.

## R4 — Le dropship devient un obstacle en profondeur

- **Decision (révisée)**: le dropship avance à `z = −30` (30 px vers la caméra), dessiné avec les objets du sol. Son emprise couvre les patins et le bas de la coque, x 300–780, `z ∈ [−40, −20]`. On passe derrière lui par une allée le long du mur (`z > −20`), ou devant (`z < −40`). On passe aussi sous la queue (x < 300) et sous le nez (x > 780).
- **Rationale**: elle donne la décision de jeu centrale (contourner par l'avant ou par l'arrière). La porte, les échelles et les pupitres restent sur le rail. L'emprise resserrée laisse Orlov rejoindre son poste devant le nez.
- **Alternatives considered**: dropship en arrière (version initiale, abandonnée avec le sol « derrière le rail ») ; emprise sur toute la longueur x 190–850 (rejetée : PNJ coincés derrière la coque).

## R5 — Caisses et chariots

- **Decision**: trois piles de caisses et un chariot, dessinés en primitives (placeholders, pas de génération d'image), avec leurs emprises au sol, placés pour créer deux passages (avant et arrière) et un recoin derrière le dropship.
- **Rationale**: US1 demande de contourner au moins un obstacle par l'avant et un par l'arrière.

## R6 — Commandes

- **Decision**: en salle profondeur, les actions « monter » et « descendre » (KeyW/KeyS, flèches, après traduction du remappage V188) déplacent `z` (vitesse 0,6 × la vitesse horizontale). `useLift` déclenché par W/S est neutralisé dans la salle. E au pied de l'ascenseur, à `|z| ≤ 20`, l'appelle (vers le haut depuis le pont ingénierie). Sur une échelle, une fois accrochée avec E, W/S retrouvent la montée et la descente. Tactile : les boutons « monter » et « descendre » deviennent la profondeur dans la salle. Manette : l'axe vertical, comme pour les flèches.
- **Rationale**: décision du propriétaire (2) ; le remappage V188 traduit les codes en amont, donc la profondeur suit les touches remappées.

## R7 — Entrée, sortie et annonce

- **Decision**: le hub défile en continu, il n'y a donc pas de coupure à l'entrée. À l'approche de l'accès (x ∈ [1280, 1480] sur le pont ingénierie), l'invite de statut annonce « SALLE EN PROFONDEUR · W/S : AVANCER / RECULER » (FR/EN). Le sol de profondeur apparaît en fondu à l'approche. Le passage par la porte n'est possible que près du rail (`|z| ≤ 20`) ; ailleurs, le bord de la salle bloque. À l'entrée, `z = 0`.
- **Rationale**: FR-006 et FR-007 sans saut sec. La porte correspond à l'architecture visible (règle de niveau d'AGENTS.md).

## R8 — PNJ du hangar

- **Decision**: chaque PNJ du hangar reçoit une profondeur de poste déterministe (table par identifiant d'équipage, ou valeur par défaut issue d'un hachage dans une plage libre). Il revient sur le rail (`z → 0`) pour circuler, puis rejoint sa profondeur de poste à l'arrêt, en ralentissant (amortissement exponentiel). Les profondeurs de poste évitent les emprises. L'interaction E exige `|z_joueur − z_pnj| ≤ 24`.
- **Rationale**: leurs routines existantes (x seulement) restent la source de leurs déplacements (hypothèse de la spec) ; la profondeur s'y superpose sans les réécrire.

## R9 — Sauvegarde

- **Decision**: `hub.depthV188 = { roomId, z }`, écrit par `persist()` quand le joueur est dans une salle profondeur, sinon `null`. Restauré au démarrage si `roomId` correspond. `save.js` le normalise (`z` borné, `roomId` valide). Une sauvegarde sans ce champ donne `z = 0`.
- **Rationale**: FR-011 et SC-004 ; champ additif.

## R10 — Tir futur (consigné, non réalisé)

- **Decision**: fonction pure `depthShotHitsV188(shooterZ, targetZ, band = 22)`, plus un recalage du tireur de 30 % vers la cible. Elle est documentée et testée, mais non branchée tant que le hangar n'a pas de combat.
- **Rationale**: FR-014 ; décision du propriétaire (3).

## R11 — Mesure de performance

- **Decision**: mesurer le temps moyen d'image dans le hangar sur 300 images, avant et après, même scène et même résolution, avec Chromium sans affichage. Le résultat est rapporté tel quel.
