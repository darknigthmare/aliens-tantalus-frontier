# Xeno Trials V200 · Les cinq supers natifs en poses dessinées

Les trois supers restants du registre V148 reçoivent des poses originales fondées sur leurs plaques exactes. Le Brute et la Reine Pathogen utilisent leurs douze poses du [lot V199](V199-PRIORITIES.md). Le sélecteur reconnaît désormais un « Super dessiné » pour les cinq combattants concernés.

| Combattant | Super | Rendu en jeu |
| --- | --- | --- |
| Warden | Barrage de contrôle | Six poses au sol accompagnent la préparation, les deux salves natives et la reprise d’appui. |
| Exploder | Rupture totale | Quatre poses accompagnent la préparation et la ruée jusqu’à la détonation du moteur. L’acteur est consommé au moment de l’effet. |
| Harbinger | Bond d’assaut | Six poses accompagnent la préparation, le bond, la retombée dans la fenêtre active et la récupération. L’état réel des appuis sélectionne l’image en vol ou au sol. |

Les trois PNG RGBA conservent leurs octets de production. Le build vérifie leurs dimensions, format et empreintes, ainsi que les empreintes des plaques de référence. Les seize poses utilisent des rectangles et appuis mesurés. Pour le bond, le pivot du bassin est projeté sur la ligne d’appui de référence. Le rendu de repli prend le relais si une pose aérienne passerait sous le plancher.

Les valeurs de jauge, les fenêtres d’attaque, les projectiles, les contacts et la détonation restent ceux du moteur natif. Les cinq supers ont un rendu dessiné, distinct des travaux sur les movesets complets. Le catalogue compte 28 combattants avec au moins un geste dessiné sur les 189 admis.

Les 105 tests ciblés passent, dont le rendu des seize poses sur le moteur natif avec jauge préparée et hôte Canvas déclaré. Ils observent les deux salves, la consommation de l’Exploder et la retombée effective du Harbinger, et vérifient que le rendu ne modifie pas l’état de combat. Les 270 contrôles d’audit passent sur les fichiers gelés.
