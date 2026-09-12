# Lurker V82 — revue des candidats d'attaque

Deux vraies sorties ImageGen conservées sans retouche. Aucun profil accepté ni intégré au runtime.

| Candidat | Poses | Contacts de bord alpha ≥16 | Décision |
| --- | ---: | --- | --- |
| R1 | 8/8 | [2, 3, 4] | rejected-visual-cutoff |
| R2 | 8/8 | [] | attack-candidate-pending-whole-profile-review |

R1 : les silhouettes touchent les frontières des cellules 2, 3 et 4. La pose 4 touche son bord gauche ; son bord droit conserve 6 px de marge. La mesure précise ainsi le soupçon visuel initial de débordement à droite. La planche reste rejetée pour défaut d'isolation des poses.

R2 : candidat uniquement. Les huit cellules sont isolées, mais les poses de récupération 6–8 restent 35–37 px au-dessus de la ligne initiale de référence, contre 0–1 px pour les poses 1–2. Le bond atteint 97 px de dégagement en pose 4. Ces décalages ne sont pas supprimés : la racine anatomique, l'atterrissage, l'identité face aux autres clips et la calibration de taille restent à contrôler.

Les sources sont RGBA 1774×887 en grille 4×2. Les GIF utilisent une cellule nominale fixe 444×444, complétée d'au plus un pixel transparent selon l'arrondi de grille. Aucune pose n'est déplacée, agrandie ou recalée par ses pieds : la garde au sol pendant le bond reste celle de la source. La ligne verte représente seulement l'étendue alpha la plus basse de la planche, pas une racine anatomique validée.

Le rythme des GIF sert à la revue : il ne valide pas le timing runtime, et leur répétition est un moyen d'inspection. Aucune image intermédiaire n'est inventée.

La référence officielle a été consultée visuellement mais n'a pas pu être lue par ImageGen à cause d'une erreur ACL. Les appels réussis étaient descriptifs. Fidélité 1:1 et conditionnement par cette image ne sont pas revendiqués.

Preuves : `technical-audit.json`, `source-receipts/`, les deux contacts JPEG et les deux GIF à origine fixe. Aucune donnée V66 ni aucun asset runtime n'est modifié.
