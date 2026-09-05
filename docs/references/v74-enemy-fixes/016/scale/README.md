# V74 — Burster 016 : échelle mondiale complémentaire

Périmètre borné : comparaison des proportions et proposition de volume physique. Aucun registre, source, atlas, facteur anatomique ou contrat de combat modifié ici. Le contrôle d'explosion appartient à l'agent gameplay.

## Valeurs proposées à l'intégration centrale

- Rendu **256×256**, sans déformation ; cellule native256×256, facteur monde1.
- Corps physique **88×88**, centré au pivot source128/240 : boîte native x84,y152,width88,height88.
- Le volume englobe le thorax, l'abdomen et la zone d'appui des membres. Il exclut la grande queue levée, les extrémités des griffes et le bout projeté du crâne. C'est une boîte de gameplay constante, pas une mesure biologique de tous les appendices.
- Les sources/calibrations V73 sont conservées : ne pas réappliquer leurs facteurs1/1.047649/1.040246/1.052948 au rendu. Le seul facteur de dessin est1.

## Mesures réellement regardées

Atlas courant SHA-256 : `3ad1538aef3dd62354950f7cf7f63e875ff2cd6688bfb06c8f2fa9abf80ff3df`.

La planche idle entière et les deux images de ce dossier ont été affichées. Sur idle1, les repères manuels sont :

| Repère | Coordonnée native | Distance au plan d'appui y240 |
| --- | --- | ---: |
| Haut de la masse crânienne / poches, hors queue | environ168,141 | 99px |
| Dessus du thorax, hors queue | environ123,159 | 81px |
| Plus haut pixel alpha de l'ensemble | y114, queue levée | 126px, **pas hauteur du corps** |

Incertitude des repères manuels :±4px natifs. Les 32 boîtes alpha se trouvent dans `burster-scale-measurements.json`, avec distinction explicite entre hauteur alpha et anatomie. Les32 appuis alpha terminent à y240 sur l'atlas présent ; aucune nouvelle correction de racine n'a été appliquée.

Le vrai marine idle est rendu110×148 depuis une cellule256×256. Sa silhouette native est haute193px : hauteur visible111,578px. À256², le crâne du Burster atteint donc environ88,7% de cette hauteur, son thorax72,6%. Sa queue peut monter au-dessus du marine sans rendre le corps géant.

`burster-world-scale-proposals.png` montre224²,256² et288² face au même marine, puis la pose de pression7 à256². Le compromis256² conserve le quadrupède élancé olive/noir et ses poches jaune-vert, en cohérence de jeu avec la famille Runner, sans reprendre le rectangle ancien162×92 qui comprimait verticalement le dessin.

Cette échelle est **une décision de mise en jeu mesurée**, pas une hauteur canonique en mètres de Fireteam Elite. Les références de design et leur statut restent ceux de la revue V73 ; aucune fidélité1:1 ni nouvelle acceptation n'est certifiée par cette mesure.

## Reproduction et frontières

`py docs/references/v74-enemy-fixes/016/scale/measure-burster.py` produit uniquement ce contact, les repères et les mesures dans ce sous-dossier, à partir de l'atlas intact. Agrandissement du repère au plus proche voisin, sans redessin d'anatomie. Les quatre fichiers techniques plus ce rapport sont autonomes.

À intégrer et tester par leurs propriétaires : entrée256²/88² dans readylist/géométrie ; portée de compression/détonation et rendu du moteur réel. Aucun succès de ces recettes de combat n'est affirmé ici.
