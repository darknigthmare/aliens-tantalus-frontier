# V66 — audit de référence `enemy-042-combat-synthetic`

Date : 2026-09-01. Statut : phase de référence terminée localement, verrou non fusionné, `canonExact=false`, aucune génération ImageGen, aucune normalisation, aucune acceptation et aucune intégration runtime.

## Conclusion

`Combat Synthetic` est une **adaptation originale de Tantalus**, pas le nom établi d'un modèle canonique unique. Les sources officielles ou licenciées inspectées permettent de retenir un archétype Alien cohérent : des synthétiques peuvent être des adversaires Weyland-Yutani, servir dans une unité d'opérations spéciales, posséder une capacité physique supérieure et laisser apparaître un fluide blanc lorsqu'ils sont endommagés. Elles ne définissent pas l'armure céramique sombre, l'optique unique, la carabine compacte, la silhouette latérale ni les cinq animations exactes de ce profil.

Le verrou positif vient donc de la plaque OpenAI historique appartenant au projet et de son prompt V47.1. Le nouveau profil reste un humanoïde mécanique de taille humaine, à deux bras et deux jambes, plus large qu'un Working Joe à cause de ses plaques segmentées, portant une seule carabine originale inchangée. Rien dans cette livraison ne revendique une reproduction 1:1.

## Frontière canon / Tantalus

| Élément | Appui externe vérifié | Décision de production |
|---|---|---|
| Synthétiques hostiles | Le site officiel *Aliens: Fireteam Elite* mentionne des adversaires synthétiques Weyland-Yutani. | Archétype compatible avec Alien; ne fixe aucun modèle précis. |
| Famille de synthétiques | Les notes officielles emploient `Maintenance Synths`, `Synth Wardens` et `Elite Synthetics`. | Ne pas fusionner ces catégories en un supposé modèle canonique « Combat Synthetic ». |
| Opérations spéciales synthétiques | Les pages officielles Marvel d'*Alien* (2022) #2 et #3 qualifient Steel Team de `Synthetic Special Operations team`. | Justifie un rôle de combat général; aucune apparence, arme ou marque de Steel Team n'est copiée. |
| Blessure synthétique | Le PDF officiel *ALIEN RPG — Chariot of the Gods* indique qu'un androïde exposé saigne blanc et non rouge. | Fluide blanc très contenu autorisé dans `death`; sang rouge interdit. |
| Diversité des modèles et fonctions | La page officielle d'Esther 1089-12/A7 documente un modèle Weyland-Yutani affecté à un bataillon de Marines. | Confirme la diversité des rôles; Esther n'est ni une référence visuelle ni le sujet du profil. |
| Armure, tête, optique et carabine exactes | Aucun modèle externe direct inspecté. | Éléments entièrement originaux Tantalus, verrouillés depuis la provenance OpenAI V47.1; `canonExact=false`. |

## Sources et portée exacte

- [Cold Iron / 20th Century — Aliens: Fireteam Elite](https://www.aliensfireteamelite.com/en/) : page officielle récupérée le 1er septembre 2026; elle confirme les adversaires synthétiques Weyland-Yutani, sans nommer un modèle unique `Combat Synthetic`.
- [Cold Iron / 20th Century — release notes](https://www.aliensfireteamelite.com/en/releasenotes/) : page officielle récupérée; `Maintenance Synths`, `Synth Wardens` et `Elite Synthetics` y sont des catégories distinctes. Les améliorations d'Alpha et Beta attestent aussi des capacités offensives, défensives et de soutien de synthétiques, pas du design de notre ennemi.
- [Marvel — Alien (2022) #2](https://www.marvel.com/comics/issue/103779/alien_2022_2) et [#3](https://www.marvel.com/comics/issue/103780/alien_2022_3) : métadonnées officielles indexées; l'accès automatisé direct répondait 403. Les descriptions officielles servent uniquement à confirmer Steel Team comme unité synthétique d'opérations spéciales et sa mission de combat. Aucune couverture n'a été téléchargée.
- [Free League / 20th Century — ALIEN RPG, Chariot of the Gods](https://freeleaguepublishing.com/wp-content/uploads/2023/09/ALIEN_CHARIOT_OF_THE_GODS_AGENDAS_PRINT.pdf) : PDF officiel de quatre pages récupéré; la page imprimée 3 établit le fluide blanc et la capacité physique accrue de l'androïde exposé.
- [Cold Iron / 20th Century — Esther 1089-12/A7](https://www.aliensfireteamelite.com/en/community/meet-the-crew-esther/) : page officielle récupérée; elle documente un modèle fabriqué par Weyland-Yutani et intégré à un bataillon Colonial Marine, sans fournir de design pour le profil 042.

La recherche négative reste bornée aux pages ci-dessus : elle n'affirme pas avoir épuisé toutes les publications Alien. Elle suffit en revanche à interdire une fausse attribution canonique au modèle Tantalus.

## Contrat exact de la file

Le profil est `biology=synthetic`, `caste=assault`, `animationFamily=armed`, `batch-003`, ordinal 41, état initial `pending-reference`. La file conserve `reference=null`, `referenceLockSha256=null` et un placeholder `BLOCKED` dans chacun de ses prompts. Le fragment JSON joint capture le contrat mais ne modifie pas la file.

| Clip | FPS | Boucle | Frames atlas | Mouvement obligatoire | Source future attendue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | alerte subtile, huit poses au sol | `assets/openai/sprites/frames/v66/batch-003/enemy-042-combat-synthetic/idle.png` |
| `move` | 12 | oui | 8–15 | cycle complet contact / charge / passage / récupération, sans translation de cellule | `assets/openai/sprites/frames/v66/batch-003/enemy-042-combat-synthetic/move.png` |
| `attack` | 12 | non | 16–23 | épauler, viser, tirer, reculer, récupérer avec l'arme verrouillée | `assets/openai/sprites/frames/v66/batch-003/enemy-042-combat-synthetic/attack.png` |
| `death` | 10 | non | 24–31 | impact létal, perte d'appui, chute, corps terminal | `assets/openai/sprites/frames/v66/batch-003/enemy-042-combat-synthetic/death.png` |
| `reload` | 10 | non | 32–39 | retirer le chargeur, insérer le remplacement, opérer l'action, revenir prêt | `assets/openai/sprites/frames/v66/batch-003/enemy-042-combat-synthetic/reload.png` |

Chaque source future doit être une planche 2:1, grille invisible 4×2, huit poses distinctes en ordre ligne-majeure, sujet complet dans chaque cellule, profil droit strict. La cible normalisée reste 4×10 cellules de 256×256 avec garde 16 et pivot candidat `(128,240)`, à revoir manuellement.

## Prédécesseur local vérifié

`assets/openai/synthetic-android-animation-sheet.png` est une plaque OpenAI appartenant au projet, RGBA 1024×1024, SHA-256 `8b8da47dd0d58a54ae624d3ff6997d1fd20fb93d1a66cb9d6c5ac73101f486a4`. Son prompt exact figure dans `docs/ART_PROVENANCE_V47_1.md`, SHA-256 `3b6377493075babd45602ebbbaf94cd5092fe31bdd3ea689203ed8f84e495376`.

La ligne d'index zéro 2 contient seulement quatre poses de marche. Mesures alpha locales, bornes exclusives :

| Pose | Bbox `x0,y0,x1,y1` | Taille | Dernier y opaque | Pixels non transparents |
|---:|---|---|---:|---:|
| 0 | `[62,8,204,249]` | 142×241 | 248 | 14 641 |
| 1 | `[64,8,203,230]` | 139×222 | 229 | 14 547 |
| 2 | `[45,8,190,230]` | 145×222 | 229 | 14 312 |
| 3 | `[44,8,185,230]` | 141×222 | 229 | 14 077 |

La première pose termine 19 pixels plus bas que les trois autres : l'ancienne ligne n'établit ni ancre physique ni ligne de sol V66. Elle partage aussi son atlas avec trois autres synthétiques et ne possède aucun idle, tir visé, rechargement causal ou décès complet. Elle sert uniquement d'identité Tantalus, de palette et de grammaire d'équipement. Le fallback historique `synthetic:row2` était rendu à 84×112.

## Verrou visuel et mécanique

- Un seul synthétique humanoïde de taille humaine, exactement deux bras, deux jambes et une tête compacte blindée; aucune peau, chevelure ou face humaine visible.
- Une seule petite optique blanc froid. Pas d'yeux rouges de Working Joe, de bandeaux lumineux ou de noyau néon.
- Plaques céramiques segmentées charbon et gunmetal, usure discrète, articulations mécaniques lisibles aux épaules, coudes, taille, genoux et chevilles. La silhouette est plus large qu'un Working Joe mais jamais celle d'un mecha, d'un power loader ou d'un humain dans un exosquelette.
- Une seule carabine originale : canon court et émoussé, boîtier rectangulaire, crosse compacte fixe, bloc de visée simple, prise avant et chargeur droit détachable devant la détente. Aucun profil de M41A, logo Weyland-Yutani, arme réelle reconnaissable, texte ou numéro.
- L'arme, les plaques, l'optique, les proportions et l'asymétrie restent identiques sur les 40 poses. Elle demeure tenue à deux mains hors changements de prise nécessaires au rechargement; durant la mort, elle reste reliée ou appuyée contre le corps et ne disparaît pas.
- Le fluide blanc est optionnel, limité à une couture endommagée pendant `death`, sans éclaboussure détachée. Aucun sang rouge ni acide vert.

## Chronologie des cinq clips

`idle`, 6 fps boucle : low-ready neutre; tassement d'épaule; scan optique; transfert minime au pied arrière; alerte maximale; retour optique; recentrage; fermeture proche de la pose initiale.

`move`, 12 fps boucle : contact talon proche; prise de charge; passage jambe éloignée; portée du pied éloigné; contact éloigné; prise de charge éloignée; passage jambe proche; réalignement. Pas de sprint, goose-step, glissement du bassin ou arme flottante.

`attack`, 12 fps : anticipation; montée de crosse; alignement optique/visée; pré-tir; impulsion; recul maximum; tassement; retour low-ready. Un seul tir lisible, sans projectile, tracer ou flash détaché.

`death`, 10 fps : impact létal; recul; perte d'un genou; descente du bassin; perte du second appui; impact; tassement membres/arme; corps terminal. Aucun hurt recyclé, démembrement, explosion, dissolution ou récupération.

`reload`, 10 fps : prêt; canon abaissé et main au chargeur; déverrouillage; ancien chargeur retiré; remplacement tiré de la poche fixe; alignement et insertion; action opérée; prise à deux mains restaurée. Interdits : deux chargeurs simultanément engagés, nouvelle géométrie d'arme, main surnuméraire ou pièces téléportées.

## Échelle, collision et racine

La cible proposée est `npc-standing` : `(x=88, y=34, width=80, height=206)`. Le corps reste proche de la stature du Working Joe historique (88×116 au rendu) mais gagne de la largeur visuelle par l'armure; la portée du canon ne change ni l'échelle ni la hitbox.

Les comparaisons inter-clips doivent mesurer la hauteur crâne blindé → anneau de cou et la largeur couture → couture des plaques d'épaule sur au moins deux poses debout comparables, avec contrôle hanche → épaule. La portée de l'arme, le recul, le chargeur, les bornes globales de pose et la largeur du cadavre sont interdits comme métriques.

La racine physique est la projection du bassin sur le plan d'appui chargé. Ni le canon, ni le chargeur, ni l'optique, ni une plaque extrême ne deviennent l'ancre. Le pivot `(128,240)` est seulement un candidat hérité de la file; il doit être revu sur les 40 poses avant toute normalisation.

## Provenance, droits et état réel

Aucune image en ligne, capture officielle, couverture Marvel, modèle, texture, logo, insigne ou arme licenciée n'a été téléchargé, copié, tracé ou intégré. Aucun appel ImageGen n'a été effectué. Les cinq sources V66, les clips normalisés, previews, atlas et métadonnées restent absents; les cinq entrées d'audit demeurent `missing-source`.

Livrable fusionnable : `docs/references/V66_WORKLOT_001_COMBAT_SYNTHETIC_REFERENCE.json`, dont `profiles.enemy-042-combat-synthetic` correspond au schéma minimal du registre global. La fusion éventuelle, l'écriture des cinq prompts finaux, la génération idle-first, les audits d'anatomie/arme/chronologie, la calibration d'échelle, les racines physiques, la normalisation, l'acceptation et l'intégration runtime sont des portes séparées.

Ce travail ne modifie ni `V66_ENEMY_BATCH_QUEUE.json`, ni `V66_ENEMY_BATCH_STATE.json`, ni `V66_ENEMY_BATCH_REFERENCES.json`, ni les métadonnées, ni les assets normalisés, ni le runtime, ni Git, ni aucun autre profil.
