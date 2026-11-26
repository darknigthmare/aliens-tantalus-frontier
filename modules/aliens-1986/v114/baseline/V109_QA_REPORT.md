# QA — ALIENS V109 Logistique sous pression / RC1

## Résultat local et portée

**260 tests Node passent : 180 tests hérités + 80 nouveaux. 103 contrôles navigateur passent : 64 contrôles précédents réexécutés + 39 nouveaux.** Six contextes de recette, aucune erreur JavaScript ou console observée. Quatre opérations locales complètes sont terminées ; un exercice supplémentaire conserve les deux passages ennemis de poursuite.

Ces chiffres concernent le HTML et les modules autonomes livrés. Ce n’est pas une certification des 64 salles du moteur Tantalus, un test sur GPU cible, un appareil mobile physique ou une fusion native.

## Provenance

Source : `ALIENS_1986_V108_CONTACT_PERSISTANT_RC1.zip`. SHA-256 : `177c499560ed77fc17af96341b1c1026478e28f65d16c181f2343b01f0a5fec8`.
Treize sources/tests hérités sont comparés octet pour octet dans `baseline/SOURCES_PRESERVEES_V108.json`. Les nouveaux modules 109 étendent ce socle. Contrat courant : `bace7a01`.

## Catalogue

8 inspections, 7 lieux connectés, 2 nouveaux lieux, 8 liaisons réciproques, 16 seuils dérivés, 5 objectifs locaux ordonnés conservés. 47 emprises fixes, 9 portes intérieures, 42 instances de props, 30 points d’observation, 11 ennemis de catalogue et 1 sentinelle. Il s’agit du catalogue de la branche, pas de sprites uniques ni de la campagne native.

Les trois caches contiennent au total 3 lots personnels, 2 trousses et 1 cartouche de sentinelle. La seule sirène a un point émetteur libre en plus de sa commande. Les volumes des stocks bloquent mouvement et balles ; l’interaction ne contourne que son propre support.

## Tests dirigés

La suite contrôle les liaisons et arrivées, les stocks uniques, les durées, les plafonds, la consommation à la fin du geste, les pauses, annulations, changements d’ordre, cibles absentes, Newt, les refus de résurrection, les sentinelles, l’émission sonore et sa coupure par les sas. Elle vérifie la conservation des ressources, les gestes incomplets, les champs inconnus, la duplication, les quantités négatives, les alarmes invalides et les migrations V108/V107/V106.

Les tests dirigés utilisent des états préparés pour isoler des règles ; ils ne sont pas présentés comme des parcours. Les 180 tests historiques restent exécutés, et non simplement recopiés comme preuve.

## Quatre parcours complets automatisés

Les scripts utilisent les entrées publiques de mouvement, tir, interaction, ordres, actions de terrain et progression du temps. Ils lisent le chemin calculé ; ils ne réécrivent ni positions, HP, munitions, réserves, portes ou objectifs. La blessure du parcours logistique provient d’une attaque réelle. Les rechargements emploient les exports validés du même module et reprennent en pause.

### direct

Terminé : True. 3231 entrées/sous-pas ; 8 transferts d’équipe ; 80.78 secondes simulées. Ce temps n’est pas une estimation de durée pour un joueur humain.

| Membre | PV finaux | Munitions finales |
| --- | ---: | ---: |
| ripley | 100 | 7 |
| hicks | 100 | 24 |
| hudson | 100 | 24 |
| newt | 100 | 0 |

### service-link-reloads

Terminé : True. 2738 entrées/sous-pas ; 7 transferts d’équipe ; 68.45 secondes simulées. Ce temps n’est pas une estimation de durée pour un joueur humain.

| Membre | PV finaux | Munitions finales |
| --- | ---: | ---: |
| ripley | 100 | 7 |
| hicks | 100 | 24 |
| hudson | 86 | 24 |
| newt | 100 | 0 |

### supply-loop

Terminé : True. 3698 entrées/sous-pas ; 9 transferts d’équipe ; 92.45 secondes simulées. Ce temps n’est pas une estimation de durée pour un joueur humain.

| Membre | PV finaux | Munitions finales |
| --- | ---: | ---: |
| ripley | 86 | 21 |
| hicks | 100 | 23 |
| hudson | 100 | 23 |
| newt | 100 | 0 |

Inventaire final : 2 lots personnels, 1 trousse, 0 cartouche de sentinelle. Un exemplaire de chaque ressource utilisé, 3 stocks ouverts, boucle visitée et diagnostic activé une fois. Le joueur a été soigné puis a subi un nouveau coup : la vie finale n’est pas artificiellement remise à 100.

### supply-loop-reloads

Terminé : True. 3697 entrées/sous-pas ; 9 transferts d’équipe ; 92.43 secondes simulées. Ce temps n’est pas une estimation de durée pour un joueur humain.

| Membre | PV finaux | Munitions finales |
| --- | ---: | ---: |
| ripley | 86 | 21 |
| hicks | 100 | 23 |
| hudson | 100 | 23 |
| newt | 100 | 0 |

Inventaire final : 2 lots personnels, 1 trousse, 0 cartouche de sentinelle. Un exemplaire de chaque ressource utilisé, 3 stocks ouverts, boucle visitée et diagnostic activé une fois. Le joueur a été soigné puis a subi un nouveau coup : la vie finale n’est pas artificiellement remise à 100.

## Exercice de poursuite hérité réexécuté

`qa/drive-pursuit-v109.mjs` part de l’insertion, laisse les contacts de Hadley vivants, franchit le raccord avec l’équipe, laisse la poursuite atteindre Operations, utilise le détecteur, réplique et isole le sas. Résultat : 2 passages ennemis, 1067 entrées/sous-pas. Aucune identité nouvelle n’est créée par le pilote.

## Recette navigateur

Le document distribué est exécuté via Playwright/Chromium à partir de ses octets autorisés par `set_content`. Son chargeur Blob habituel est inchangé ; aucun accès QA ni fonction d’édition d’état n’est ajouté à la page. Les téléchargements et le contrôle d’import de fichier sont réels. Le premier raccord Hadley → Operations est joué au clavier et à la souris. Les étapes tardives repartent d’exports non modifiés des pilotes, puis les soins, tirs, pauses, ordres, manœuvres et réapprovisionnements sont effectués dans Chromium.

Les nouveaux contrôles vérifient collecte non renouvelable, B et bouton de ravitaillement, soin réel, interruption F, reprise à mi-geste, import refusé sans mutation, sirène persistante, recharge finie de sentinelle, Newt non armée, carte observée, bilan et migration V108 sans ressources offertes.

| Recette | Contrôles réussis |
| --- | ---: |
| Interface / progression initiale | 17 |
| Reprises / fin / écran | 11 |
| Contacts / poursuite | 15 |
| Sas / isolement | 11 |
| Tactile émulé | 10 |
| Logistique nouvelle | 39 |
| **Total gameplay** | **103** |

Aucune requête externe nécessaire au gameplay dans les recettes qui les observent ; son synthétique facultatif, désactivé par défaut. Les tests 844 × 390 et 390 × 844 sont des viewports émulés, pas des téléphones physiques. Aucun défaut observé n’est une garantie universelle d’absence de bugs.

## Captures

25 PNG directs de Chromium, non retouchés. 12 sont embarqués byte-for-byte dans le rapport illustré. Les origines exactes sont dans `report/browser-results-v109.json`. Elles distinguent manipulations UI et reprise d’exports de parcours. Ce ne sont pas des concepts générés ni des dessins Python à partir des coordonnées ; les schémas du Codex sont séparés et étiquetés comme plans.

## Défauts repérés et corrigés

Les types sonores des nouveaux gestes ont dû être ajoutés à la liste stricte du validateur. Le point d’émission d’alarme était initialement enfermé dans le volume du pupitre : il a été déplacé vers son face avant libre, sans bypass de propagation. Les stocks ont reçu des emprises partagées et le tracteur une représentation ancrée à son volume plutôt qu’une superposition de dessins. Ces changements font partie du HTML soumis à la recette finale.

## Limites explicites

Toujours aucune fusion native V105, aucun push/déploiement ni nouveau final Reine/P-5000. Les transferts entre pièces restent discrets, les tirs locaux, les contacts simulés seulement dans le réseau de l’opération ou la salle d’inspection. Rendu procédural stylisé, pas de sprites finalisés ni d’animations artistiques de soins. L’inventaire est collectif sans poids. Le validateur protège les invariants de fichier ; il ne signe pas cryptographiquement une partie et ne prétend pas être un anti-triche.

L’adaptateur V106 hérité reste inactif ; ses tests sur fixtures ne constituent pas un raccord V109 au moteur Tantalus. La version du dépôt, son service worker et ses sauvegardes natives ne sont pas modifiés.

## Reproduction

```text
npm run check
node tools/export-contracts-v109.mjs
npm run drive
python tools/build-preview.py
python qa/browser-v109.py
python tools/build-docs-v109.py
python qa/distribution-smoke-v109.py
python tools/release-check-v109.py
```

HTML contrôlé : `dd0228ae9027b840162eb437abc737b27eeb73957d1081e6027c472a8b9c7b13`.
Pour vérifier l’intégrité de la distribution d’origine : `python tools/verify-package.py`. Ce contrôle ne réécrit pas son manifeste. Les recettes de construction génèrent de nouvelles preuves et peuvent légitimement modifier les hashes.

## Contrôle de distribution séparé

20 contrôles supplémentaires passent, sans être ajoutés aux 103 contrôles de gameplay : démarrage du document exact, export réel schéma 109, inventaire initial vide, huit sas et huit lieux, absence de dépendance réseau, huit fiches Codex filtrables, deux nouvelles fiches, huit plans, layouts portrait, douze PNG embarqués et décodables, hash du jeu identique et aucune erreur JS observée.

Transport testé : octets du HTML via `set_content` et chargeur Blob normal. La navigation directe `file://` n’est pas retestée ni certifiée dans cet environnement ; aucune politique de sécurité du navigateur n’a été contournée pour la recette.
