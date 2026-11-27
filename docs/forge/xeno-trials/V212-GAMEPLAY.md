# Xeno Trials V212

V212 complète les actions conditionnelles et les interactions d’arène de la bible V146 depuis la version V211 publiée. Le mode intégré et l’édition autonome partagent les mêmes règles.

| Fiche | Ajouts en jeu |
| --- | --- |
| 05 Prises et résistances | Garde et frappe lourde déclenchent une prise au sol sur 34 profils et 548 appariements vérifiés. Le déclenchement vérifie la portée, la direction, la posture debout et la compatibilité des hauteurs. Un nouvel appui maintenu sur la garde permet à la cible de se dégager. Le temps de maintien et les contacts reprennent sur checkpoint. |
| 05 Appuis et déplacements | Dix profils peuvent frapper en descente avec leurs clés aériennes existantes. La chute après rupture et le redressement couvrent 15 profils. Six profils lourds supplémentaires pivotent sur six ticks. Crusher ACM et Defender disposent d’un franchissement au sol. |
| 08 et 12 Finitions | 43 nouveaux appariements relient un membre vérifié aux appuis du Ravager ou du Crusher ACM au sol. À proximité d’une balise, un gagnant doté d’un atlas de marche admis peut rejoindre le poste, isoler le secteur, puis reculer. Le verdict est fixé avant le choix. |
| 09 Présentations | Les cinq pilotes V197 peuvent reprendre une posture vigilante après le verdict signé. Les 1 890 identifiants de présentation sont associés aux séquences du moteur et à leurs conditions de rendu. Passer une séquence rend la main au Canvas au moment prévu. |
| 10 et 11 Interactions d’arène | Les opérations d’isolement de la pression et du refroidissement ont trois postes à activer. Les deux premiers désarment des zones indépendantes de vapeur ou de purge cryogénique. Le dernier valide l’opération. La coupure se conserve après reprise. |
| 14 Entraînement | Quatre nouveaux ateliers portent le total à 28. Ils couvrent la prise au sol, le dégagement, le contre-super hors de portée et le passage d’une zone de danger. |

Les prises sont des contrôles au sol. Le contrat de compatibilité continue de demander des zones de contact établies pour toute nouvelle paire. Les planches d’animation par identité et les comparaisons de référence par édition restent suivies dans les fiches de production.

`npm run test:trials:v212` vérifie le moteur et la continuité des sources. `npm run build:trials` construit les deux éditions, puis `npm run check:built` et `npm run check:trials:built` vérifient chaque distribution.
