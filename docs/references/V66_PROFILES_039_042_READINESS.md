# V66 — readiness des profils 039 à 042

Date de vérification : 2026-09-01. Périmètre : `batch-003`, profils `enemy-039` à `enemy-042`. Ce document est un audit de préparation uniquement : aucune référence globale, file, état, source, métadonnée ou ressource runtime n'a été modifiée.

## Compte exact

| Profil | Famille | Clips requis | Planches / poses requises | Planches V66 présentes | Nouvelles planches nécessaires |
|---|---|---|---:|---:|---:|
| `enemy-039-abomination` | pathogen / brute | idle 6 fps boucle; move 12 fps boucle; attack 12 fps; death 10 fps | 4 / 32 | 0 | **4 / 32 poses** |
| `enemy-040-pathogen-mimic` | pathogen / adaptive | idle 6 fps boucle; move 12 fps boucle; attack 12 fps; death 10 fps | 4 / 32 | 0 | **4 / 32 poses** |
| `enemy-041-working-joe` | synthetic / security | idle 6 fps boucle; move 12 fps boucle; attack 12 fps; death 10 fps; hurt 10 fps | 5 / 40 | 5 | **0** |
| `enemy-042-combat-synthetic` | synthetic / assault, armé | idle 6 fps boucle; move 12 fps boucle; attack 12 fps; death 10 fps; reload 10 fps | 5 / 40 | 0 | **5 / 40 poses** |
| **Total** |  | 18 clips | **18 planches / 144 poses** | **5 / 40** | **13 planches / 104 poses** |

Chaque nouvelle planche doit être une source 2:1, grille invisible 4×2, huit poses distinctes en ordre chronologique, sujet complet dans chaque cellule et profil droit strict. La cible normalisée reste une cellule 256×256 avec garde de 16 px, pivot `(128,240)` et aucune acceptation automatique.

## 039 — Abomination

**État réel.** La file indique `pending-reference`; les quatre sources, les quatre clips normalisés, les aperçus, l'atlas et les métadonnées V66 sont absents. L'audit source du batch confirme quatre `missing-source` et aucun reçu de génération.

**Autorité visuelle.** Le nom interne est une adaptation du **Pathogen Brute**, pas l'Abomination Predalien d'AVP. La source primaire [Cold Iron — Pathogen Deep Dive](https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/) décrit un Xénomorphe muté doté de deux énormes excroissances en forme de poings et d'une frappe au sol produisant une onde de choc. Les [notes officielles](https://www.aliensfireteamelite.com/en/releasenotes/) confirment la terminologie Pathogen Brute. `canonExact` doit rester faux et l'homonyme Predalien doit être explicitement exclu.

**Prédécesseur local.** `assets/openai/sprites/normalized/enemies/abomination-pathogen-brute-action-sheet-v56.png`, RGBA 1024×1024, SHA-256 `0a85ccaa6f18c8e72eef25a0feb208be5c94b291934ffc621b524b6c86cfab58`, ne fournit que quatre poses par état. Son contrat runtime utilise `crusher-large` `(24,100,216,140)` et un rendu historique 190×132.

**Verrou.** Masse basse et très large; petite tête enchâssée; épaules et avant-bras hypertrophiés se terminant par deux masses anatomiques; chair pathogène pâle/grise, croûtes sombres et asymétrie organique; aucune queue, armure, arme, mandibule ou dreadlock Yautja. Le move est une marche lourde/knuckle-supported, l'attack un armement puis double slam, jamais le générique « inner-jaw strike ». Conserver la classe de collision `crusher-large`, le sol sous les appuis réels et mesurer entre clips la corde crânienne ainsi que le diamètre d'un poing-croissance; la portée du bras ne doit pas gonfler la hitbox.

## 040 — Pathogen Mimic

**État réel.** `pending-reference`; aucune source, sortie normalisée, preview, métadonnée, référence locale, prompt ou événement V66. Quatre `missing-source` sont confirmés.

**Autorité visuelle.** Aucun ennemi canonique nommé « Pathogen Mimic » n'apparaît dans le catalogue primaire du Pathogen Deep Dive (Runner, Blight, Brute et Queen). Le nom et la morphologie sont donc une adaptation du projet. La page officielle Pathogen ne sert que d'ancre de matériau : mutation brisée, douloureuse et organique; elle ne justifie aucune prétention 1:1.

**Prédécesseur local.** `assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png`, RGBA 1024×1024, SHA-256 `f5b8525e9c0f4d03c30e6c671d129b0e7147878de4ce9647ac78e5800ec631c2`. Son prompt V54 verrouille un torse humain dérivé étiré, chair fongique pâle, griffes asymétriques, côtes rompues, sacs pathogènes et locomotion rapide à demi redressée. Il ne fournit que quatre poses par état et ses anciennes variantes avaient traversé les cellules. Runtime historique : `pathogen-mimic-large` `(24,52,208,188)`, rendu 132×96.

**Conflit à lever avant ImageGen.** La file classe actuellement l'animation comme `biped` et emploie un texte générique de frappe xénomorphe; le prédécesseur est un poursuivant bas, traînant et demi-redressé. Le verrou de référence doit primer : exactement deux bras et deux jambes malgré les côtes/tendons saillants, pas de membres surnuméraires, pas de queue de Drone, pas de dôme biomécanique. Move = poursuite traînée mais rapide; attack = armement, slash/morsure, impact, recul; death = rupture pathogène puis corps terminal. Garder la classe `pathogen-mimic-large`, mesurer une corde rigide du crâne ou de la cage thoracique et placer la racine au bassin projeté sur l'appui chargé, jamais au bout d'une excroissance.

## 041 — Working Joe

**État réel.** Référence revue et cinq planches OpenAI présentes, toutes RGB 1774×887 : idle `c0fa426d…`, move `ce25ef5e…`, attack `732c1570…`, death `25ca0956…`, hurt `0f95a22d…`. Les cinq clips WebP, six GIF (cinq clips + global), l'atlas et la métadonnée existent. Atlas SHA-256 `cece641977c3d04d9de80a5bce7748060ca8d467458022a8a2b9aad052cc7836`; métadonnée SHA-256 `abef9f4752d8ee757db9cd1fc300b634edd78606ea5389abbe4e6479bd53b257`. Une ancienne planche move est conservée dans `rejected/`.

**Source canonique.** Le [site officiel SEGA d'Alien: Isolation](https://alienisolation.sega.jp/battle.html) nomme le Working Joe, le décrit comme un androïde d'assistance devenu meurtrier, doté d'une force et d'une résistance anormales. Le verrou local revu précise le Joe Seegson standard : crâne chauve et pâle moulé, expression vide, petits optiques rouges, uniforme de maintenance gris-brun/olive avec renforts ocre, mains pâles nues et bottes de travail. Ce n'est ni Samuels/Bishop, ni une combinaison dangereuse, ni le Combat Synthetic.

**QA restant, sans nouvelle planche.** La normalisation est `validated`, 40 poses sont distinctes et les findings d'atlas sont vides, mais `pending-visual-review`, `runtimeIntegrated=false`, `canonExact=false`. La calibration inter-clips est absente (facteurs provisoires tous à 1) et les 40 ancrages sont `pending-body-root-review`. L'audit source relève en plus six pixels au bord gauche de la cellule death frame 6 : faire une preuve d'ownership/safe-reassignment avant toute acceptation; régénérer uniquement si ce transfert est anatomiquement invalide. Référence d'échelle/hitbox : `npc-standing` `(88,34,80,206)`, ancien rendu 88×116; mesurer crown-to-chin sur 2–3 poses par clip, racine bassin→semelles, et ne jamais réduire le cadavre à cause de sa largeur.

## 042 — Combat Synthetic

**État réel.** `pending-reference`; cinq sources, clips, previews, atlas et métadonnées V66 absents. Cinq `missing-source`, aucun prompt ou événement dédié.

**Autorité visuelle.** [Aliens: Fireteam Elite](https://www.aliensfireteamelite.com/en/) confirme des adversaires synthétiques Weyland-Yutani et les [notes officielles](https://www.aliensfireteamelite.com/en/releasenotes/) emploient notamment les catégories Maintenance Synth, Synth Warden et Elite Synthetics. Elles ne définissent toutefois aucun modèle unique nommé « Combat Synthetic » correspondant au profil : il s'agit d'une adaptation originale, `canonExact=false`.

**Prédécesseur local.** La ligne indexée 2 de `assets/openai/synthetic-android-animation-sheet.png`, RGBA 1024×1024, SHA-256 `8b8da47dd0d58a54ae624d3ff6997d1fd20fb93d1a66cb9d6c5ac73101f486a4`, ne contient que quatre poses de marche et partage son atlas avec trois autres synthétiques. La dette de plaque dédiée est déjà consignée en V60/V65. Le fallback historique dessine la famille à 84×112.

**Verrou.** Humanoïde à exactement deux bras/deux jambes; armure fonctionnelle en céramique sombre segmentée; articulations mécaniques exposées; petit capteur optique blanc froid; carabine compacte identique, enregistrée aux deux mains dans tous les clips. Pas de silhouette de Marine humain, de Working Joe pâle, de mecha géant, d'exosquelette ou de redesign d'arme. Attack = épaulé/visée/tir/recul/récupération; reload = chargeur retiré, remplacé, action opérée, retour ready; death peut montrer un fluide synthétique blanc mais jamais du sang rouge. Profil droit strict. Cible collision recommandée : classe humanoïde `npc-standing`, racine bassin→semelles; l'arme et le recul ne modifient ni l'échelle corporelle ni la hitbox. Mesurer la hauteur crânienne ou la largeur rigide de plaque d'épaule, et garder une stature proche du Working Joe avec une largeur visuelle supérieure due à l'armure.

## Ordre de production vérifiable

1. Créer et faire revoir trois verrous locaux : 039 (alias Pathogen Brute), 040 (adaptation projet), 042 (synthétique original). Le 041 est déjà verrouillé.
2. Produire exactement **13** planches nouvelles : 039×4, 040×4, 042×5. Le 041 ne demande aucune nouvelle génération à ce stade.
3. Pour chaque profil, figer l'idle comme identité/échelle, générer les autres clips contre cet idle, puis auditer séparation 4×2, orientation droite, huit poses uniques et chronologie.
4. Faire les revues anatomiques d'échelle et les racines physiques avant normalisation. Pour 041, traiter d'abord l'ownership de death frame 6; aucune acceptation ou intégration runtime n'est incluse dans ce rapport.
