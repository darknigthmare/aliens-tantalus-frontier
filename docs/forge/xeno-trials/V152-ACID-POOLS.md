# V152 — Reine Pathogen : résidu corrosif persistant

Base : V151 `28807a02d710a7156cbfca71420340651bfae0b3`, branche de PR9.
Application 143.0.0, schéma de sauvegarde 52 et dépendances inchangés.

## Portée et provenance

Cette continuation raccorde une capacité manquante à la signature et au super
existants de **Pathogen Queen**. Seul le couple
`drive-v123-fte-pathogen-queen-right-v13` /
`pose-v123-drive-fte-pathogen-queen-right-v13` est admis. Les 188 autres
identités ne reçoivent pas une capacité déduite de leur nom.

Source primaire consultée le 17 octobre 2026 :
<https://www.aliensfireteamelite.com/en/releasenotes/> — **Ruptured Cistern
1.0.5.105618, 6 décembre 2022, AUDIO**. Les notes évoquent explicitement les
dégâts des mares de projectiles de la Reine Pathogen et du Blight. Cette mention
établit la capacité, pas la chorégraphie ou ses paramètres. Les flaques de Blight,
Spitter et autres spécimens ne sont pas implémentées arbitrairement dans ce lot.

**Rayon, dégâts, temporalité, cadence, immunité du propriétaire et comportement
2D ci-dessous sont des adaptations originales au versus.** Aucun nouveau clip
articulé ni kit complet 1:1 n'est déclaré produit. Les poses dédiées existantes
restent employées et les sept postes artistiques de la Reine demeurent ouverts.

## Comportement intégré

Le projectile transmet son point d'impact balayé, de contact au sol ou de fin
de portée. Une seule retombée verticale part de ce point ; elle ne suit pas la
victime et ne cause aucun dégât en vol. À hauteur zéro elle devient une flaque,
jamais un danger suspendu. Sa position reste dans les limites du sol de l'arène.

Le contrat original utilise un rayon de **44 unités monde**, une bande de
**6 unités**, **4 PV** par exposition, **24 pas** d'avertissement et **48 pas**
entre expositions, à 120 Hz. La flaque expire au pas **360** (3 secondes), sans
coup au moment de l'expiration. Les retombées descendent à 380 unités/seconde.
Les collections sont plafonnées à 12 retombées et 12 flaques ; au-delà, la plus
ancienne disparaît. Les coûts et projectiles directs V147/V148 restent inchangés.

Une cadence commune à la cible empêche les flaques superposées de multiplier
instantanément les dégâts. Sortir puis rentrer ne remet pas le compteur à zéro.
Sauter au-dessus de la bande ou sortir de ses limites évite l'exposition. Le
camp propriétaire n'est pas touché ; cela ne prétend pas définir une immunité
biologique générale de la franchise.

L'acide traverse la garde mais ne l'annule pas, ne l'épuise pas artificiellement
et n'interrompt ni attaque acceptée ni horloge de stun existante. Les ticks ont
leur compteur `acidTicksV152` : les trois impacts d'une grappe restent trois
coups directs. Les dégâts sont bornés aux PV réels et alimentent les règles
existantes de jauge ; le résidu d'un super ne recharge pas son auteur.

## Résultat, règles et nettoyage

Le moteur résout les expositions après les impacts directs et avant les
réactions de mort V151 puis le verdict. Deux expositions simultanées peuvent
produire un double KO ; un Burster mort dans une flaque conserve sa réaction
acide unique avant le résultat. Le rendu ne change ni gagnant ni récompense.

La pause fige retombées, durée, dégâts, cadence et jauges. La fin de manche,
la manche suivante et un nouveau duel purgent les données de résidu. Aucun
état de flaque n'est ajouté à la sauvegarde du profil. Le ticket de résultat
existant reste réglé une seule fois. La règle « sans spécial » interdit aussi
le dépôt et l'exposition ; aucun délai de commande n'est contourné.

## IA et lisibilité

Le CPU lit les limites visibles des flaques et de son propre corps. Les zones
jointives sont regroupées pour choisir une sortie disponible, puis il émet les
commandes ordinaires du moteur. Un contrôle de son trajet jusqu'à la prochaine
décision évite la réentrée immédiate ; la projection au sol protège également
le placement d'un atterrissage. Aucun déplacement, PV ou entrée adverse futur
n'est injecté. Cette prudence n'est pas une garantie d'esquive parfaite de toute
nouvelle flaque ou attaque engagée.

Le rendu trace la bande physique, une bordure, une durée résiduelle et des
bulles procédurales. Le mouvement réduit retire les bulles mais conserve
l'avertissement et la durée. Les effets sont dessinés dans la transformation
monde des combattants, pas dans une couche HUD indépendante.

## Recette

`npm run test:trials:acid` exécute **38 cas comportementaux et un contrôle du
suivi Excel**. Les fixtures de frontières peuvent placer un résidu, ajuster des
PV ou une horloge ; elles sont distinguées des attaques natives et de l'hôte
runtime. Les tests couvrent admission, coût indirect, retombée, chevauchement,
garde, saut, pause, expirations, purge, doubles KO, réaction du Burster, jauges,
IA, framerate 30/60/120 Hz, dessin en mouvement réduit et règlement unique.

Le parcours Chromium existant des neuf adversaires est conservé et étendu pour
attendre les flaques et les dégâts réels de la Reine via les menus. Il capture
`queen-persistent-acid-v152.png` puis vérifie aussi leur gel en pause. Aucune
santé, position, horloge, jauge ou victoire n'est injectée dans ce parcours.
La réussite navigateur est rapportée séparément pour chaque commit de CI.

Le suivi `XENO_TRIALS_SUIVI_V152.xlsx` contient sept onglets et huit compteurs
calculés : **189 / 9 / 5 / 1 / 0 / 0 / 38 / 7**. `progress-v152.json` épingle
l'identité, les paramètres, les sources et l'empreinte du classeur. Les documents
V146–V151 sont conservés et les nouveaux restent hors de la distribution du jeu.
