# HADAL — contrôle du scaphandre modulaire

Document source uniquement, exclu de la distribution publique. Base de cette continuation : `a3634de7c294ae82554d899057fab96088ccf769`, qui publie la Matriarche de Soute et la coque MANTA-6. Les vérifications de release et de CI sont attribuées séparément au commit exact dans la PR #49.

## Art produit et raccord réel

Trois PNG RGBA de 1254 × 1254, soit **3 235 815 octets**, sont copiés sans modification de pixels ni réencodage. Le rig utilise les fenêtres mesurées de chaque composant, pas les cellules nominales de la grille.

| Source | Pièces disponibles | Octets |
| --- | ---: | ---: |
| `assets/abyss/v188/hadal-upper-parts.png` | Trois torses, quatre pièces de bras/gants proches et quatre éloignées : 11 | 1 085 136 |
| `assets/abyss/v188/hadal-leg-parts.png` | Bassin, deux cuisses, deux tibias et deux bottes : 7 | 942 075 |
| `assets/abyss/v188/hadal-helmet.png` | Casque fermé avec joint cervical : 1 | 1 208 604 |

Une pose courante dessine 15 des 19 pièces. Le casque, les gants et les vêtements sont fermés ; aucune peau ni arme n'est peinte dans les sources. Les fenêtres conservent les bords connectés et une marge de deux pixels. Les rares résidus hors fenêtres ont un alpha de 1 ; le torse compact et le bassin traversent les cellules nominales et demandent leur fenêtre mesurée propre.

Les références sont les atlas humains modulaires et le prop de combinaison pressurisée du projet. Tissu anthracite, plaques olive usées, bagues en laiton terne et visière opaque forment une identité HADAL originale. La bible ne définit pas de modèle canonique individuel à reproduire exactement. Les trois prompts, références, mesures, SHA et paramètres finaux sont consignés dans la [provenance](HADAL_ART_PROVENANCE_20261117.json).

## Contrat de présentation, tir et physique

Le contexte appartient uniquement au véritable joueur admissible du chapitre local Abysse Noir, hors MANTA. Le propriétaire est transmis explicitement quand le calcul du tir emploie une copie de présentation. Les autres acteurs, le neuro, les armures incompatibles et les contextes étrangers conservent leur chemin natif. Aucune nouvelle tenue persistante n'est créée.

Thorax, cou, épaules, bras et arme partagent une posture calculée indépendamment des images. Le casque reste attaché au col ; le raccord ne déplace pas la tête seule. Un petit volume mesuré dans le verre opaque est placé dans la sonde d'oxygène existante de 6 × 12. Il représente une zone visuelle fermée, pas la position prétendue d'une bouche invisible. Les règles d'O2, la pression, les vitesses, les modes et le gabarit physique de 42 × 92 sont inchangés.

Le point de tir peut différer de celui des anciennes poses aériennes. Ce changement est assumé : projectile admis, mains et arme dessinée partagent la même géométrie finale, que zéro, une partie ou les trois images HADAL soient prêtes. Les transits à contacts imposés conservent leur géométrie native ; les fixtures de compatibilité ne créent pas d'échelle ou de conduit jouable dans Abysse Noir.

## Chargement, repli et surcouche

Le kit est atomique : les trois chemins doivent appartenir aux bonnes sources, être entièrement chargés, avoir les dimensions attendues et contenir toutes les fenêtres. Sinon aucune pièce HADAL n'est utilisée. Le repli garde toutes les pièces natives avec la même posture recalée. **L'identité des pixels avec le parent n'est pas revendiquée dans ce contexte actif** ; les cas partiels sont comparés au repli natif du candidat.

Le cache d'apparence garde son plafond de 16 images. Les corps, armes et outils natifs nécessaires restent prioritaires ; les trois images optionnelles sont refusées ensemble si elles ne tiennent pas dans ce budget. Les demandes prêtes ou en cours sont partagées, les callbacks obsolètes restent inoffensifs et aucune nouvelle boucle RAF n'est introduite.

L'ancien cadre et la bande cyan Legacy disparaissent seulement après un dessin HADAL réussi dans la passe courante. Un reçu ancien à la même horloge ne suffit pas. La perte d'une source restaure la surcouche du repli. Le shell passe de 728 à **729** avec le seul module du scaphandre ; les PNG sont chargés à la demande. Les quatre preuves de ce lot restent source uniquement, sans précache ni distribution publique.

## Correctif médical révélé par la recette

Le déplacement spécialisé Legacy contournait l'avance des manipulations natives : un soin admis restait à zéro seconde, même après du temps actif. Un seul appel à `advanceFieldActionV124` est ajouté après la physique et le tir de cette branche. Les branches qui passent déjà par `super` ne reçoivent pas de second tick. Le propriétaire `src/player-field-actions-v124.js` reste inchangé.

La régression utilise le vrai `update(dt)` : le soin progresse à une seconde, se termine après 2,2 secondes actives, fait passer la santé de 30 à 78 et les kits de deux à un, avec une seule fin d'action. La pause ne le fait pas avancer. Impact, annulation publique et restauration empêchent la consommation ; les branches d'acteur invalide ne dépensent pas de kit. Le mutant retirant le seul appel d'avance reproduit l'immobilité initiale.

Le correctif n'ajoute pas l'annulation par intention clavier dans Legacy et ne promet pas une annulation instantanée dans chaque retour anticipé invalide. La logique de soin, les quantités, le coût, la pause et la sauvegarde restent sous leurs propriétaires natifs.

## Revue de stature et rendu final

Le premier candidat avait passé ses 150 tests ciblés, mais la comparaison native révélait un appui trop accroupi : hanches environ 14,19 px plus basses que le parent, genoux proches de 90°. Cette version est rejetée. Une première correction remettait la hanche au niveau du parent au prix d'un torse trop court et d'un soin presque jambes verrouillées ; elle est également rejetée.

La variante retenue garde un casque à échelle uniforme de **18,5 px**, une référence thoracique uniformément ajustée à 75 % et un raccord de bassin mesuré. Elle conserve un appui prêt légèrement fléchi : hanche environ **3,95 px** sous le parent et genou à **128,64°** dans la condition indépendante d'appui. Cette pose n'est pas décrite comme identique à l'ancien personnage ni comme des jambes parfaitement droites. Le service et la suspension restent distincts. Le casque, le col et le volume vitré restent joints ; aucun PNG n'est étiré pour corriger le défaut.

La boîte opaque du dessin natif, arme comprise, mesure **88 px de haut en appui**, **80 px en suspension neutre** et **89 px pendant le soin** au seuil alpha 128. Dans ces trois vues, l'arme ne définit ni le haut ni le bas. Ces mesures décrivent les captures sélectionnées ; la référence interne du rig à 96,5 px n'est pas réutilisée comme une hauteur visible. La boîte du casque incliné pendant le service peut dépasser 18,5 px en hauteur sans changer son échelle.

La QA finale comprend **59 conditions et 107 rasters natifs** : 59 captures du candidat et 48 références de la base. Les **1 069 contrôles passent**, sans erreur de préparation, de chargement ou de dessin. Le code de production et les vrais PNG sont utilisés sous Canvas natif, avec chargeur d'images de forme navigateur, polices, DOM/événements et RAF inerte déclarés. Les positions de fixture, temps d'observation, commandes et ressources sont explicites. Deux vues emploient le dessin complet du monde ; les autres isolent le personnage pour mesurer son assemblage. Ce n'est pas un parcours Chromium.

| Contrôle observé | Résultat |
| --- | --- |
| Modes neutre, lesté et magnétique ; montée, relâchement et descente ; deux directions | Corps complet et contexte maintenu ; la dérive native des modes lesté/magnétique n'est pas appelée vol stationnaire |
| Visée, tir réellement accepté, recharge, soin, fin de soin et mêlée | Requêtes natives admises ; les états d'action ne sont pas fabriqués pour la capture |
| Casque, col, épaules, mains, bassin, jambes et semelles | Quinze pièces composées ; erreur maximale de joint lue dans Canvas ≈0,0000562 px |
| Arme et projectile | Muzzle natif du projectile et pose calculée identiques ; accord du dessin contrôlé séparément à la précision du Canvas |
| Huit combinaisons de disponibilité des trois PNG | Les sept combinaisons incomplètes ont exactement le même raster de repli ; seul le kit complet dessine HADAL |
| Image perdue à la même horloge | Reçu ancien refusé, surcouche de repli restaurée, zéro différence avec le repli attendu |
| Six exclusions, dont conducteur MANTA et autre costume | Zéro pixel changé face au parent, même lorsque les trois images HADAL sont disponibles |
| Débarquement de MANTA | Retour au contexte HADAL admissible |
| État pendant le dessin | Physique, ressources et reprise préservées ; le gain de santé/consommation voulu appartient à l'avance native du soin, pas au rendu |
| État Canvas | Piles, matrice et alpha restaurés |

Le journal conserve **694 observations de transformation sur la base, 741 sur le candidat et 559 ajustements anatomiques contextuels**. Ce n'est pas un résultat « zéro transformation non uniforme » : les membres gardent les ajustements anatomiques natifs. La correction du thorax et l'échelle du casque sont uniformes. L'erreur maximale entre matrice déclarée et matrice Canvas observée est d'environ **0,0000456 px**, dans une tolérance de lecture de 0,0001 px.

### Harnais et contrôles causaux

Trois problèmes du premier harnais ont été qualifiés séparément du défaut de stature : précision finie des matrices Canvas ; attente du décodage du costume Nostromo ; ordre d'observation après le snapshot Legacy qui synchronise sa liste d'acteurs. Le dernier effet existe aussi sur le parent et n'est pas attribué au dessin. Les anciennes captures et erreurs restent conservées dans l'historique du reçu ; aucun correctif de jeu ni assouplissement du garde public n'a été ajouté pour ces trois points.

La suite comportementale finale passe **151/151**, aucun échec ni test ignoré, en **19,769 s**. Elle reprend les suites natives Legacy, corps, arme, apparence, transits et locomotion et les onze tests dédiés. L'ancienne exécution 150/150 appartient au candidat rejeté et n'est pas additionnée ni réattribuée à la version finale. Le contrôle de distribution/cache passe **77/77** sur les quatre fichiers de distribution demeurés inchangés pendant la correction de posture ; la suite release finale vérifie ensuite l'ensemble sur le commit exact.

Les trois mutants causaux retirent en mémoire une seule opération, avec API, images et propriétaires conservés : recalage sur la sonde, avance médicale, ajustement uniforme du thorax. Les rouges du recalage et du soin appartiennent au premier raccord ; celui de la stature porte sur la variante finale et fait retomber le rapport d'extension en appui d'environ **0,9071 à 0,7928**. Ces échecs attendus restent distincts de la suite verte intégrale rejouée sur les octets finaux. Une revue indépendante du code puis du delta de posture confirme l'idempotence, le propriétaire réel du tir, le repli atomique, le budget de cache, le reçu de passe et l'absence de double tick médical.

Empreintes des journaux et revues :

| Preuve | SHA-256 |
| --- | --- |
| Suite finale 151/151 | `07e1fbf895961103c4beeb8004c8b47dddcb0eb11172a3d9898ebd159048265a` |
| Matrice native détaillée finale | `8c0edd94fdc54dc5b10066d1a05ea95193362a00d9cfb41f56654581f7371f45` |
| Régression verte de stature | `073d80f8a832964d52c7ae626c4d11c370b44ec11275ac2bd7352cc29ca9f03c` |
| Mutant rouge de stature | `c0b78b9a8c70e8d8e5f0448f9449b0ef0dab4d254f5b277184fcc6af10e20fdf` |
| Revue indépendante du delta final | `a05f9c846c8b49e0d56ba2e06606cb1bae9d7fccfa57356874d225d178b310a6` |

Les validations de succession, contrôle source, suite complète, build et contrôle du build sont consignées sur le commit final dans la PR #49. Les résultats CI du parent Cargo, notamment son pilote de titre, restent attribués à ce parent et ne remplacent pas la CI d'HADAL.


## Périmètre restant ouvert

Les poses utilisent les animations natives de support, suspension, montée/descente, visée, tir, recharge et service. Ce raccord n'écrit pas un nouveau cycle de battement de nage, des animations de trappe/propulsion du MANTA, les dix castes aquatiques, un second boss ni les actes de Nacre-7. Le chapitre Abysse reste partiel et sa dette combinée reste ouverte ; le registre demeure à **21 jouables, 19 partiels et deux effectifs**, toutes les valeurs `canonExact` étant fausses.

La [planche intégrée](HADAL_ART_OVERVIEW_20261117.png) et le [reçu de rendu](HADAL_ART_RENDER_RECEIPT_20261117.json) donnent les conditions, mesures, sources et limites de la preuve native. Les captures Canvas ne sont pas présentées comme un nouveau parcours Chromium ou une campagne entièrement jouée.


### Qualification CI des pilotes précédents

Les cinq workflows du parent Cargo `a3634de7` sont désormais réussis : Forge, Alien_base, Gameplay V162, [Full release](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44126735894) et [Excel V163](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44126735899), ce dernier avec ses 15 jobs. Le [job titre](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/44126735899/job/134192459856) confirme le correctif d'attente de l'introduction : **128 contrôles, 18 configurations et zéro erreur de page/requête/HTTP**. Ses 36 captures sont déclarées dans l'artefact distant ; aucun de ces PNG n'est téléchargé dans ce travail.

Le rapport conservé a pour SHA-256 `9ea43a9e11f4c761a2f2e88613e255b766afc15a4ce69e86b7797b439e4f5933`. L'identité du build reste `143.0.0+f23c5a2a16f5` avant/après ; ce merge a C pour parent et son arbre est exactement `3b1f99dd9e695542197ba11844250117a634de38`, celui de C. La trace mobile avec mouvement réduit envoie Entrée après le retrait réel de l'introduction puis atteint le menu. Cela qualifie T040 et clôt le suivi T028, en complément des preuves Trials, Forge, campagne et Cocon de R. **Ce succès est attribué à C ; il ne remplace pas les contrôles ou la CI du nouveau commit HADAL.** Vercel reste distinct : le quota de déploiements empêche encore de confirmer un nouvel aperçu web.
