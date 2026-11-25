# Alignement inter-DLC — périmètre V106

Il s’agit d’une adaptation de règles effectivement lues, **pas d’une copie intégrale de code** issue des ZIP indisponibles et pas d’une parité artistique finale.

| Référence consultée | Règle retenue | Application livrée | Limite |
|---|---|---|---|
| Nostromo V109, ALIGNEMENT_INTER_DLC_V109.html | Portes, carte, chemins et contacts interrogent le même état réel. Attaque engagée non omnisciente. | Registre spatial unique, portes qui bloquent, route révisée après manœuvre, visée figée pendant la préparation. | Quatre secteurs de validation ; pas les 64 salles natives raccordées. |
| Alien3, ALIEN3_LEVEL_DESIGN_CODEX_V103.md | Machines sur un support nommé, décor indépendant du saut ; seule la masse lointaine reçoit la parallaxe. | Supports décrits dans les plans ; renderer lié aux coordonnées de salle, parallax limitée au fond. | Pas de nouvel ascenseur, étage natif ou traversée d’échelle importé. |
| Résurrection V116, README_V116.md | Validation avant mutation, import en pause, origine de campagne préservée ; statut des preuves explicite. | Whitelist des données, rejet atomique ; l’adaptateur conserve l’enveloppe native et refuse une reprise spatiale sans mapping. | Aucun Replay/Director de campagne reconstruit ; les essais de validation n’attribuent pas de score. |
| Romulus Appuis v0.11, HTML autonome | Menus hors de la scène, carte observée, prise en compte des appuis et passages ; actions non gratuites à distance. | Bande HUD hors canvas, menus remplacent la scène, nœuds visités, commandes à portée. | Pas de câble EVA, apesanteur ou fluide cryogénique ajouté à Aliens. |
| Aliens 1986, DLC_CONTENT_MANIFEST_V105.json | Préserver les 64 fiches et 17 archétypes, ne pas mélanger inventaire, pratique et campagne. | Inventaire V105 conservé et 64 fiches de recette dans le codex. | 294 couvertures/196 passages/116 barrières/63 secrets sont des chiffres hérités, non vérifiés dans le jeu natif. |

## Faits de récupération

Le manifeste V105 a été récupéré par texte : le bloc `roomByRoomV105` commence à la ligne 14374. La liste récupérée décrit les quantités, modes et vocabulaires de 64 salles, sans leurs volumes exacts. Les empreintes ont été assemblées à partir des deux segments du manifeste de fichiers. Les noms de sources et leurs versions ne sont pas remplacés par une référence de même thème.

Le texte de l’aperçu Résurrection V116 a été matérialisé pour examen ; aucun de ses modules, sprites ou dialogues n’est copié dans V106. Les textes Nostromo, Romulus et Alien3 ont servi de références de contrats. Le jeu Aliens complet n’a pas été obtenu via cette récupération.

## À ne pas confondre

- Fonction programmée et vérifiée : noyau spatial V106 + quatre secteurs de validation.
- Source V105 retrouvée : inventaire et empreintes ; pas les octets du ZIP ni tout le moteur.
- Adaptateur fourni : API de raccord à mapping explicite ; pas intégration native activée.
- Capture réelle : rendu du HTML V106 exécuté dans Chromium ; pas capture du site Vercel.
- Fidélité au film : inspiration et nomenclature de lieux ; aucun relevé 1:1 ni certification artistique.
