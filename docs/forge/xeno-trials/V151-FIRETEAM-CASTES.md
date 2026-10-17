# Xeno Trials V151 — quatre profils Fireteam

Base : `d9bb2ebcf9d9dede3de7c775f85cf984397db139` (V150). Cette passe reste sur la PR nº 9, sans fusion sur main. Application **143.0.0**, sauvegardes **52**, dépendances inchangées. V151 est le numéro du lot, pas une migration des parties.

## Ce qui devient jouable

| Identité exacte | Signature | Limite de production |
|---|---|---|
| `prowler` / `castes-game_afe_prowler` | Bond du rôdeur : bond physique annoncé, direction verrouillée, une collision, préparation interruptible. | Pas encore de prise articulée ni d’immobilisation au sol complète. |
| `drive-v123-afe-runner` / `pose-v123-drive-afe-runner` | Balayage caudal bas : sans translation de charge, esquivable en passant au-dessus de la zone physique. | Tracé indicatif, pas de nouvelle animation de queue. Le Runner du film n’est pas modifié. |
| `drive-v123-afe-spitter` / `pose-v123-drive-afe-spitter` | Un crachat acide ajusté à la cible observée à l’émission, vitesse ensuite constante, sans poursuite. | Le Spitter ACM conserve son contrat ; pas de mare persistante ajoutée. |
| `burster` / `castes-game_afe_burster` | Assaut de contact, sans le crachat générique hérité. À sa mort : projection acide radiale, une fois. | Projection instantanée adaptée au versus, pas la mare persistante complète de l’œuvre. |

Le registre V147 délègue ces quatre couples ID/profil au module V151. Sa liste historique de cinq entrées reste inchangée. Les **189 IDs**, **5 supers**, anciennes signatures, cues d’arènes et commandes V150 restent présents. **180 autres contrats** light/heavy/special restent inchangés ; aucune variante ou famille n’hérite implicitement d’une nouvelle capacité. Les tests des listes de compatibilité sont ajustés à ce périmètre explicite, sans retrait des assertions portant sur le reste du roster.

## Résolution du Burster

La projection est résolue **après les impacts du pas de simulation et avant le verdict**. Le moteur conserve la propriété des dégâts, statistiques et paiements. Chaque acteur nouvellement mort ne peut l’émettre qu’une fois. La distance est mesurée entre le centre de la projection et le point le plus proche de la boîte physique de la cible ; l’éloignement ou une hauteur suffisante évitent l’impact. Une garde frontale ne neutralise pas cette exposition acide dans les règles de cette simulation.

Un attaquant peut tuer le Burster puis être tué par la projection dans le même pas : le verdict est alors un double KO. Deux Bursters peuvent produire deux projections bornées, y compris si le second est tué par la première. Pas de dégâts sur une cible déjà morte, de gonflement des statistiques par overkill ou de paiement en double. Les effets et drapeaux sont reconstruits à la manche suivante.

Le mode **sans spécial** neutralise les quatre actions L et le trait de mort. Le verrou temporaire initial concerne les commandes actives : il ne suspend pas le trait passif de mort. Le coût de l’assaut est réglé à son départ ; la mort ne simule pas un second achat d’attaque. Les essais de règlements utilisent le ticket existant et la déduplication par match, sans changer la formule de récompense.

## IA, interface et rendu

Les quatre CPU utilisent les mêmes commandes et dépenses que le joueur. Le Burster se rapproche au lieu de se placer pour cracher. Les portées maximales des nouvelles projections sont bornées par leur contrat réel plutôt que par une distance d’attente générique. Le balayage utilise une zone verticale basse et son tracé reste dans cette zone. Le flash acide de mort est distinct des explosions synthétiques et visible même sur la première image terminale, sans réactiver une boucle de rendu après le résultat.

Les labels, descriptions, anticipations et snapshots passent par le registre déjà raccordé à la sélection et au contrôleur. Aucun menu de développement ou bouton de victoire n’est ajouté. Le nouveau module est présent une fois dans le shell hors ligne ; les documents sont autorisés par chemins exacts seulement dans les sources, jamais dans la distribution construite.

## Références et fidélité

- Source d’origine attribuée : [IGN First / Cold Iron Studios, six types Fireteam, mars 2021](https://www.ign.com/articles/aliens-fireteam-meet-6-new-xenomorph-types-ign-first). **Accès direct bloqué pendant cette passe.**
- Texte consulté : [reproduction des descriptions attribuées, AVP Galaxy, 9 mars 2021](https://www.avpgalaxy.net/2021/03/09/our-first-look-at-six-types-of-xenomorphs-in-aliens-fireteam/), le 17 octobre 2026. Repères : paragraphes Prowler, Runner, Spitter et Burster. Le niveau de provenance est inscrit dans le code, le JSON et l’Excel.

Les descriptions donnent un motif de capacité, pas un relevé de frames, de hitboxes ou de timings. Coûts, dégâts, rayon, trajectoires 2D, immunités de règles et temps sont des choix originaux de cette simulation. Aucun clip, costume ou kit n’est déclaré **certifié 1:1**. Les ressources graphiques dédiées existantes restent utilisées.

## Vérification

`npm run test:trials:castes` exécute **44 tests comportementaux et un contrôle documentaire**. Les mêmes 44 cas donnent localement **15 réussites / 29 échecs avant**, puis **44/44 après** ; plusieurs variantes testent la même cause, pas 29 bugs indépendants. Les fixtures unitaires de limites ajustent explicitement positions et santé. Ce ne sont pas des parties intégrales.

Les anciens tests de signatures, supers, feedback, commandes et cycle de vie restent exécutés. La copie locale partielle ne contient pas certains suivis V147/V149/V150 : leurs vérifications documentaires nécessitent le dépôt complet utilisé dans la CI. Aucun résultat global n’est présumé réussi à partir de la seule recette locale.

Le parcours `qa-xeno-trials-signatures-v147.py` couvre désormais **neuf CPU** depuis les menus réels, en gardant les cinq scénarios existants. Il attend les projectiles/bonds/coups acceptés et vérifie pause, mouvement réduit et abandon. Aucune santé, ressource, position, horloge, victoire ou sauvegarde n’est injectée dans ce parcours. La mort du Burster est isolée dans les tests de frontière, pas présentée comme filmée en partie réelle. Le rapport de la PR indique le résultat du commit testé.

## Excel et suite

`XENO_TRIALS_SUIVI_V151.xlsx` comprend sept onglets : synthèse, quatre castes, roster, règles, références, production ouverte et recette. Les huit compteurs sont calculés : **189 / 4 / 9 / 5 / 0 / 0 / 44 / 28**. Huit formules en cache vérifiées sans erreur, aperçu de synthèse inspecté. L’empreinte exacte est dans `progress-v151.json`. Les suivis V146–V150 ne sont pas remplacés.

Les **28 lots artistiques des quatre identités** restent ouverts : références image/page/timecode, rig, locomotion, combat complet, intros/outros/poses R1 réversibles, finitions par anatomie et revue. Les 35 lots pilotes antérieurs ne sont pas clôturés non plus. Pas de nouveau finisher, super, stage dangereux ou campagne complète dans cette passe.
