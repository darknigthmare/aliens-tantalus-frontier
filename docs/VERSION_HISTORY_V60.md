# ALIENS: TANTALUS FRONTIER — V60

Version applicative : 60.0.0. Date de validation locale : 28 août 2026.

État de publication : `READY_FOR_PUBLICATION`. La gate complète et le parcours navigateur local sont réussis. Le commit, le push et le déploiement Vercel V60 restent à consigner avant de passer cet état à `PUBLISHED`.

## Livrables V60 validés

- Le fallback procédural Canvas des véhicules non terrestres a été retiré. Les châssis prêts utilisent leur plaque, leur orientation, leur pivot et leur hitbox déclarés.
- M570, M292 baseline et AD‑19D, avec leurs 24 variantes, restent visibles au catalogue mais sont bloqués à la sélection, au manifeste d’opération et au pilotage tant que leur plaque canonique exacte manque. Les anciennes sauvegardes retombent sur le dernier véhicule réellement prêt sans perdre les IDs acquis.
- Le M577 conserve désormais l’altitude de son nœud auteur V52 quand le conducteur monte à bord ; il ne retombe plus sur le sol global du niveau.
- L’escouade attend la fin de la sécurisation joueur, approche la rampe, entre et sort un membre à la fois, respecte les sièges et la capacité, puis gère destruction, downed, checkpoint, hot‑join coop et reprise liée au bon véhicule.
- Les véhicules sans contrat d’accès V59 dédié, dont le M22A3, refusent proprement l’accès escouade ; le UD‑4L utilise le bas réel du craft et rejette une rampe verticalement inaccessible.
- Les seize salles du Tantalus possèdent un profil de traversée auteur distinct, fondé sur huit bitmaps de passerelle, plateforme, rebord, échelle, conduit et occlusion. Les sockets de portes viennent du graphe V58 ; Medical, Quarantine et Life Support n’inventent pas de porte intérieure et Science Lab conserve son ascenseur aft.
- Le hangar rend FAR, parallaxe, MID, UD‑4L, danger, acteurs et premier plan dans cet ordre. Le UD‑4L mesure environ 811 × 331 px, garde une rampe centrale praticable et son interaction physique reste prioritaire sur PNJ et ascenseur.

## Inventaire artistique confirmé

V60 n’ajoute aucun bitmap et conserve honnêtement le manifeste artistique `v59` :

- 182 plaques ;
- 2 564 cellules ;
- 364 chemins raw et normalisés ;
- zéro chemin absent ;
- 53 enemy, 29 equipment, 32 npc, 5 player, 37 vehicle et 26 weapon.

Le détail des réemplois et blocages se trouve dans `docs/references/V60_ASSET_COMPLETION_MATRIX.md`.

## Statut des lots

| Lot | État V60 | Preuve |
| --- | --- | --- |
| Embarquement/débarquement physique de l’escouade | `DONE_RUNTIME` | file séquencée, sièges, interruptions et reprise testés ; parcours navigateur réussi |
| Traversées différenciées des 16 salles | `DONE_RUNTIME` | 16 archétypes, huit bitmaps, endpoints et occlusions vérifiés |
| Sockets de portes et priorités d’interaction | `DONE_RUNTIME` | graphe V58, Science Lab, M577 et UD‑4L contrôlés dans Edge |
| Rendu véhicule sans faux Canvas | `DONE_RUNTIME` | six familles prêtes et 24 variantes bloquées couvertes |
| Quatre corrections de MID | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` | aucun transfert ImageGen des fichiers privés sans autorisation explicite |

Les quatre MID concernés sont Medical, Science Lab, Quarantine et Life Support. Les fichiers actuels restent présents ; seules leurs versions nettoyées sont bloquées.

## Validation locale du 28 août 2026

- manifeste : 182 atlas / 2 564 cellules ;
- contrôle alpha/pixels : 182 atlas RGBA, 80 cellules xénomorphes noires, 32 cellules chroma et quatre atlas d’accès de 16 cellules validés ;
- lint : 134 modules ;
- tests Node : 274/274 ;
- build : `60.0.0`, 3 443 entrées ;
- Edge local : 22 checkpoints, 30 captures, 16/16 salles, desktop 1 440 × 980, mobile 390 × 844 et PWA hors ligne ;
- résultat navigateur : zéro exception, zéro erreur console et zéro requête critique échouée.

La comparaison visuelle au même cadrage des salles Medical, Science Lab, Quarantine, Life Support et Dropship Hangar confirme l’ajout des traversées et occlusions V60. Elle ne transforme pas les quatre MID bloqués en livrables.

## Limites honnêtes

- Les 392 costumes n’ont pas de plaques dédiées ; leur rendu reste un traitement sur le marine générique.
- Quatorze familles d’armes restent sans plaque exacte.
- Trois châssis de base et 24 variantes sont volontairement non déployables faute de plaque canonique exacte.
- Les objets déployables restent dessinés par primitives malgré les plaques d’inventaire.
- La feuille de combat du joueur conserve une arme générique intégrée.
- Quatre overlays de fits sont prêts à être briefés mais non générés ; celui du M22A3 reste bloqué par sa trappe de référence.

## Publication restante

1. commit et push de la V60 ;
2. déploiement Vercel production ;
3. contrôle HTTP et parcours navigateur sur l’alias public ;
4. inscription du commit et du déploiement final dans ce document.
