# V66 — audit de référence local — enemy-036-deacon-line

Statut : **verrou de référence local revu, non fusionné**. Aucun appel ImageGen, aucune plaque V66, aucune acceptation runtime et aucune modification de registre global ne font partie de cette phase.

## Conclusion

La plaque V56 constitue une bonne graine d’identité projet : créature organique bleu nuit, bipède, profil droit, sans queue ni tubes dorsaux. Elle ne doit toutefois pas devenir le master de production V66. Sa mitre est trop variable et se lit parfois comme une coiffe horizontale large. Le nouveau verrou doit rendre le point arrière/supérieur du crâne immédiatement reconnaissable, sans glisser vers l’Ultramorph conceptuel.

Le nom « Deacon Line » désigne une adaptation du projet : *Prometheus* ne montre qu’un Deacon nouveau-né. La population, la stature adulte et les cycles locomoteurs complets ne sont donc pas des faits d’écran.

## Hiérarchie des références

| Source | Autorité | Usage retenu |
|---|---|---|
| [20th Century Studios — Prometheus](https://www.20thcenturystudios.com/movies/prometheus) | Film / studio primaire | Ancre canonique : le résultat final visible à l’écran commande. |
| [D23 — Prometheus 10th Anniversary](https://d23.com/prometheus-10th-anniversary-celebration/) | Archive officielle | Contexte de production et provenance des effets pratiques conservés par les Walt Disney Archives. |
| [Den of Geek — rencontre des designers](https://www.denofgeek.com/movies/prometheus-we-meet-the-designers-behind-the-film/) | Entretien de production direct | Neal Scanlan y présente une marionnette Deacon bleutée et griffue ; preuve solide pour la couleur, les serres et la physicalité. |
| [AVP Galaxy — Carlos Huante](https://www.avpgalaxy.net/website/interviews/carlos-huante/) | Entretien direct de concept artist | Preuve d’exclusion : Huante précise que son Deacon n’est pas le design retenu à l’écran et distingue le travail Ultramorph antérieur. |
| [Monster Legacy — Prometheus creatures](https://monsterlegacy.net/2013/03/04/prometheus-trilobite-deacon-hammerpede-alien/) | Synthèse secondaire de production | Citations attribuées sur la mitre d’évêque, les proportions de poulain/girafe, la peau de placenta irisée et la mâchoire inspirée du requin-lutin. |

Règle d’arbitrage : l’écran final prime. Les concepts Ultramorph, Holloway et autres branches abandonnées ne servent que de contre-références. Ils ne doivent jamais fournir la silhouette positive de la plaque V66.

## Verrou d’identité

- Bipède grand, fin et gangly, torse organique étroit, membres longs et griffus, sans yeux visibles.
- Crâne long terminé par une pointe arrière/supérieure en mitre d’évêque. Ni dôme Big Chap, ni tête pâle et exagérée d’Ultramorph, ni couronne de Neomorph.
- Peau organique bleu nuit/navy, légèrement nacrée et irisée, humide et placentaire ; muscles et articulations naturels, sans carapace biomécanique noire.
- Mâchoire protrusive à logique de requin-lutin, lisible comme une extension anatomique et non comme une mandibule Predator.
- Aucune queue, aucun tube dorsal, aucune armure, aucun vêtement, aucun équipement, aucune technologie.
- Profil droit strict dans les 32 poses futures.

## Audit de la plaque V56

Fichiers inspectés :

- brut : `assets/openai/sprites/enemies/deacon-line-action-sheet-v56.png` — 1254 × 1254 RGBA — SHA-256 `3e9aae0e1bb05caff5ba8183839b77ba3cd65ef9f77757079bed3262288ff385` ;
- normalisé : `assets/openai/sprites/normalized/enemies/deacon-line-action-sheet-v56.png` — 1024 × 1024 RGBA — SHA-256 `b1de6bc249f8d3fbad6c808edebac0c850c160d92c601f3ffd549df75008c4c8`.

Constats d’identité :

- conforme : teinte bleu nuit, matière organique, bipédie, absence de queue/tubes, orientation droite ;
- réserve : la pointe en mitre n’est pas assez constante et devient parfois une coiffe large presque horizontale ;
- limite : le champ `identityVerified` de l’ancien manifeste atteste une décision runtime historique, pas une fidélité cinéma certifiée.

## Échelle et racines physiques V56

Mesures faites dans les cellules normalisées de 256 × 256 px. Le support visuel est commun à `y = 240` pour les poses actives.

| Clip | Hauteur alpha | Largeur alpha | Lecture |
|---|---:|---:|---|
| idle | 171–177 px | 57–71 px | Bonne stabilité interne ; respiration discrète. |
| move | 149–153 px | 130–161 px | Hauteur stable ; largeur accrue par la foulée. |
| attack | 151–161 px | 141–208 px | Extension horizontale cohérente avec la portée, mais sans étalon anatomique rigide. |
| death | 42–136 px | 99–224 px | Effondrement progressif attendu ; la bbox ne représente plus la stature. |

Ces boîtes ne peuvent pas certifier l’échelle inter-clips : la posture change. Pour V66, l’étalon sera une corde crânienne répétable allant de la charnière antérieure de mâchoire à la pointe terminale de la mitre, mesurée sur au moins deux poses lisibles par clip. Le hitbox V56 `xenomorph-standing` de 148 × 136 reste un héritage de gameplay, pas une donnée canonique.

## Audit animation V56 → exigence V66

Les quatre clips V56 comportent chacun quatre poses uniques : idle respire, move présente une foulée, attack passe de l’anticipation à l’extension, death s’affaisse jusqu’au sol. La continuité générale est exploitable comme intention, mais quatre poses ne suffisent pas au contrat V66 de huit poses chronologiques.

Le futur lot devra fournir :

- idle : huit variations discrètes, pieds ancrés et respiration sans saut d’échelle ;
- move : contact, abaissement, passage et élévation sur un cycle bipède complet, sans crawl quadrupède ;
- attack : anticipation, impact de griffe ou projection de mâchoire, suivi et récupération, jamais de frappe de queue ;
- death : perte d’appui, effondrement continu, pose terminale stable, sans dissolution ni explosion.

## Porte de production

Le profil est **prêt localement pour arbitrage/fusion du verrou de référence**, et reste **bloqué pour génération dans ce sous-lot**. Une phase ultérieure devra générer quatre plaques 4 × 2, puis vérifier identité, huit poses uniques, marges, orientation droite, corde crânienne, racines au sol et chronologie avant toute acceptation.
