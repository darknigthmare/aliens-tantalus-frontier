# V101 — lot de 50 combattants Xeno Trials

Ce lot ajoute 50 identités déjà admises dans la campagne et la Bioforge à l'écurie de Xeno Trials. Le catalogue passe de 53 à 103 combattants, dont 15 synthétiques. Les 53 entrées historiques, leurs identifiants, statistiques, prix et affectations aux factions restent inchangés. Aucun nouveau déblocage gratuit n'est accordé.

## Composition du lot

- 20 identités du premier pack utilisateur V95 : Antilope, Brute, Carrier chargé, Spiker, Warrior Red, Phantera Black, Rhino, Chameleon I/II, TRex King/Queen, Big Xeno et huit références terrestres.
- 13 poses V98 : six variantes blindées et sept variantes acides.
- 17 poses V99 : quinze xénomorphes Cryo, un Working Joe Cryo et un synthétique de combat Cryo.

Les 50 ajouts comprennent donc 48 xénomorphes et deux synthétiques, répartis dans les quatre factions simulées existantes. Ils sont compatibles avec les filtres, les achats, les sauvegardes et les six arènes. Le détail exact des identifiants figure dans le contrat `tests/xeno-trials-roster-v101.test.mjs`.

## Limites assumées

Les images sont les 50 PNG transparents déjà validés : **aucune nouvelle animation ni nouvelle espèce canonique n'est produite**. Le moteur de duel anime des poses fixes. Les statistiques et dimensions d'arène relèvent de la simulation ; elles ne sont pas des mesures biologiques canoniques. Les noms Carrier, Chameleon ou Spiker ne créent pas automatiquement de nouveaux pouvoirs : les techniques réutilisent les attaques existantes.

Ce lot n'admet ni œufs, ni parasites/juvéniles, ni humains/faune, ni combattants obligatoirement aquatiques ou volants. Il ne réadmet aucun candidat rejeté ou retenu. Les 108 dossiers V100 et leurs originaux/Altered sont conservés sans changement et restent à adapter individuellement au combat.

## Validation

Les tests V101 vérifient les 50 PNG (empreintes, alpha, dimensions et pivots), la préservation des anciennes entrées, les deux orientations aux limites de l'arène et au saut, 300 combinaisons combattant/arène sauvegardées et 50 duels de moteur avec règlement unique des récompenses. Les preuves navigateur, export de build et publication sont conservées séparément dans les reçus QA ; un test ou un build local ne constitue pas une publication Vercel.

La version du cache est renouvelée pour distribuer le nouveau catalogue après mise à jour. Les données de sauvegarde du joueur ne sont pas effacées.
