# V147 — Premiers pilotes de signatures et ambiance des arènes

Base de la continuation : `60dac906bbd50c421c586c8b2598defcf03ea3cd`, PR nº 9.
Application **143.0.0**, sauvegardes **52**, dépendances et IDs inchangés.

Le plan V146 est conservé intégralement comme photographie de préproduction.
`progress-v147.json` relie les cinq pilotes à leurs lots exacts du plan ; le
classeur compagnon `XENO_TRIALS_SUIVI_V147.xlsx` décrit la réalisation partielle.
**Aucun kit complet, clip articulé ou rendu 1:1 n'est déclaré terminé.**

## Signatures réalisées

| Identité exacte | Réalisation physique | Contre-jeu / limite |
|---|---|---|
| Pathogen Brute, pose Drive v123 | Après anticipation, deux fronts rasants se propagent de part et d'autre, sans transformer le coup en charge. | Saut au-dessus du front, retrait hors portée, interruption avant émission. Une seule touche par émission. |
| Pathogen Queen, pose Drive v123 | Trois projectiles acides divergents visent le centre observé de la cible à l'émission. | Esquive et interruption ; aucun suivi automatique après émission. Nombre de projectiles et paramètres originaux du versus. |
| Warden AFE2, import v106 | Un projectile acide visé ; coup lourd avec recul prolongé. | Ne s'applique ni au Synth Warden ni à une reine de film. Le renversement animé reste à produire. |
| Exploder AFE2, import v106 | Ruée courte puis détonation de proximité consommant le spécimen même en cas d'esquive. | Esquive, interruption de l'anticipation, double KO réellement résolu. Ce n'est pas une fatalité gratuite après résultat. |
| Harbinger AFE2, import v106 | Bond utilisant hauteur/vitesse/gravité du moteur, direction verrouillée, contact unique puis atterrissage. | Esquive, garde selon les règles natives, interruption. Le déplacement de la pose fixe n'est pas un nouveau clip. |

Seuls **cinq couples ID de combattant / ID de pose** autorisent ces signatures.
Les **184 autres combattants** conservent leurs trois contrats existants, et les
variantes ne gagnent pas automatiquement les pouvoirs d'un homonyme.
L'IA emploie les nouvelles portées, sait viser une petite cible depuis un grand
corps et utilise le contact lorsque les règles interdisent les spéciaux.
Toutes les signatures restent soumises au coût, à la pause, au verrouillage
initial, au relâchement de la commande et au sol avant départ.

Les tirs diagonaux utilisent une intersection balayée segment/rectangle, y
compris la verticale, pour éviter la traversée d'un petit corps ou une touche
incorrecte à un coin de sa boîte. Les projectiles sont bornés en nombre/durée,
s'arrêtent à la pause et sont supprimés au changement de manche.

## Animation et présentation : ce qui est réellement livré

Le moteur dessine une anticipation, les fronts d'onde et les tirs à leurs
positions physiques. Les poses statiques dédiées existantes sont conservées.
Aucun nouveau sprite de bras, de saut, de bouche, de victoire/défaite ou de
mutilation n'est créé. Les points d'émission sont calculés depuis les boîtes
corporelles, **pas depuis des ancrages anatomiques approuvés**.

Le rendu des attaques utilise le véritable temps actif de leur contrat, y
compris les boucliers synthétiques. Les tirs à distance ne reçoivent plus un
arc de frappe de contact générique. Le texte « GARDE BRISÉE » dépend maintenant
d'une rupture réelle de garde, pas simplement d'un étourdissement long.

Six habillages originaux de simulation animent l'arrière-plan : pression au
confinement, refroidissement au réacteur, gouttes de résine dans la ruche,
écrans de passerelle, câbles de soute, poussière de surface. Ils sont peints
avant les combattants et ne modifient ni collisions, ni dégâts, ni récompenses.
L'horloge est celle du duel, sans nouvelle boucle indépendante. Pause et option
de mouvements réduits figent ces habillages. Ce ne sont pas des reconstitutions
1:1 de lieux de films.

## Références primaires et portée

Consultées le **17 octobre 2026** :

- Cold Iron, *Pathogen Deep Dive*, 29 août 2022 : paragraphes Pathogen Brute et
  Pathogen Queen. Onde au sol du Brute et tirs acides groupés de la Reine.
  https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/
- Cold Iron, annonces Steam AFE2 : *Xenomorph Showcase* du 20 août 2026,
  entrées WARDEN, EXPLODER, HARBRINGER ; patch nº 2 du 17 septembre 2026,
  rubrique Harbinger. Acide/renversement, détonation de proximité et bond.
  https://steamcommunity.com/app/3448650/allnews/

Les capacités sont documentées, **pas les frames, timings, portées, hitboxes,
dégâts, nombre de projectiles ou trajectoires 2D**. Tous ces nombres sont des
choix de simulation explicitement inscrits dans le module et le classeur.
La carapace destructible complète de la Reine, les autres signatures de chaque
espèce et les interactions spécifiques à chaque victime ne sont pas produites.

## Contrôles

`npm run test:trials:signatures` : **44 tests ciblés** de contrats, cinq pilotes,
coûts, identités, interruptions physiques, IA, règles sans spécial, esquives,
portées, pause, double KO, tirs diagonaux, nettoyage de manches, rendu et six
habillages. Les sorties à 30/60/120 Hz sont identiques ; cela teste la simulation,
pas les FPS d'un appareil. Un résidu flottant inférieur à la tolérance déjà
utilisée par le pas fixe est remis à zéro avant sérialisation.

`npm run test:trials` : les **30 tests historiques** restent requis.
`npm run test:trials:plan` : les **10 contrôles V146** restent requis.
Le premier test des signatures vérifie aussi le lien des IDs avec le suivi et
les empreintes du classeur et des données de plan, sans modifier le snapshot V146.
Les unités utilisent les hôtes DOM/images/RAF simulés documentés dans les tests.

Le nouveau parcours `qa-xeno-trials-signatures-v147.py` est enregistré dans la
recette complète. Il utilise les menus du vrai paquet, un Warrior non modifié et
cinq adversaires IA choisis réellement. Les observations de santé, positions,
horloges, projectiles et sauvegardes sont en lecture seule. Chaque scène a un
profil navigateur isolé. Les erreurs restent bloquantes ; aucun autre parcours
n'est supprimé. **Le statut du dernier run GitHub fait foi**, pas la présence du
script dans le dépôt.

## Suite à produire

Relever les plans image par image, créer les articulations et ancrages dédiés,
puis compléter les mouvements ordinaires et signatures de ces pilotes avant
d'étendre aux variantes. Les supers, finitions terminales, intros/outros et poses
récupérables de première manche restent des lots ouverts du plan V146. Le dossier
documentaire et les classeurs restent exclus du paquet public du jeu.
