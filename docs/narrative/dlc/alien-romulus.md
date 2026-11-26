# Alien: Romulus — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.20 — Convergences.** Module autonome ; dialogues et chorégraphies d'adaptation originaux, séquences temporelles distinguées des niveaux libres.

20 chapitres ; 53 états de scène ; 26 lieux persistants + 2 lieux temporels ; 60 manipulations ; 38 séquences + prologue ; 41 franchissements physiques ; 30 seuils partagés ; 30 entrées matériel ; 8 profils ; 10 écarts.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

ZIP récupéré et vérifié localement ; transfert GitHub des octets interrompu par l'indisponibilité de l'environnement. Intégration native non qualifiée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Chemin de publication prévu : `archives/dlc-source-recovery-20261126/alien-romulus/`. Ce chemin a été préparé localement ; aucun octet de ce ZIP n'a été publié. Voir le [reçu des sept archives](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D17`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Séquence Andy/Jackson's Star enrichie sans copier les dialogues du film.
- Capsules guidées vers le sas ; bâtis fixes conservés ; transfert complet vers Corbelan encore ellipse.
- Monte-charge Kay animé/sauvegardable ; course complète non prétendue.
- Couches pluie Navarro/Kay/Bjorn/Tyler, parka rouge Rain et tenue Andy séparées.

## Écarts concrets encore ouverts

- **ALIEN-ROMULUS-01** — Prologue exploratoire, foule complète et extensions Jackson's Star incomplets.
- **ALIEN-ROMULUS-02** — Trajet intégral capsules/Corbelan et course inter-ponts du monte-charge.
- **ALIEN-ROMULUS-03** — Lieu exact de l'injection Kay non certifié ; plans Renaissance/Corbelan non métriques.
- **ALIEN-ROMULUS-04** — Second F44 Tyler partiellement simulé ; vêtements/dommages/visages stylisés.
- **ALIEN-ROMULUS-05** — Couloir de sécurité coupé volontairement exclu, à ne pas inventer dans le montage cinéma.

## Reprise artistique et intégration

1. Comparer les manifests incarnation/concordance avant de produire des doublons.
2. Distinguer infrastructure fixe (berceau, monte-charge) et matériel attribuable à Rain.
3. Garder les ellipses déclarées tant qu'une référence ne justifie pas le trajet physique.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Priorités acceptées dans les discussions

Le 28 septembre 2026 à 23:20:31 UTC, quatre axes sont expressément acceptés (`D17`, preuve `CTX-R2-03`) : **laboratoire de référence, parcours complets sans diagnostic, raccords continus du Corbelan, performances et sons**. Chacun doit avoir un état de réalisation distinct ; un outil de diagnostic ne remplace pas le trajet joueur, un graphe ne prouve pas le passage physique et un son ajouté ne prouve pas un gain de performance.

La demande de 02:56:55 UTC du même jour vise les niveaux et connexions quasi exacts, les dialogues de référence disponibles et de nouveaux dialogues compatibles avec le lore. Les répliques nouvelles du projet demeurent identifiées comme originales ; aucun dialogue absent n’est prétendu cité. Les ellipses capsules/Corbelan et du monte-charge restent ouvertes tant que le trajet complet n’est pas démontré.

Le codex des castes demandé le 27 septembre 2026 inclut tadpole et cocon (`D21`, preuve `CTX-R2-07`). Le rapport de spécification distingue tadpole en récipient/laboratoire, cocon de maturation d’un individu et enveloppe de survie adulte de Big Chap ; il ne déclare pas ce système intégré. Préserver identité et provenance lors d’une transformation, perception limitée, attaques pouvant échouer et arrivées justifiées ; ne pas imposer une progression Drone→Warrior→Praetorian→Reine à chaque individu.

## Documents examinés

Archive : `ALIEN_ROMULUS_CONVERGENCES_v0.20.zip` ; SHA-256 `f36995586ebc169a6d36fd52d4e62e0d353f1c5228a46c37cd273dd081c51293` ; 47 349 199 octets. Les noms suivants sont relatifs à la racine extraite (préfixe ZIP non consigné) et rattachés à cette archive. Le [reçu de récupération](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees) conserve le statut de transfert.

- `README.md` — contenu lu.
- `docs/REGISTRE_CONVERGENCES_V20.json` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
