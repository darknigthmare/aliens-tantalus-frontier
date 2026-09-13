# V86 — objets posables physiques, premier périmètre

## Source et statut

Conversation « Créer items gameplay posables », `6a9e045a-917c-83ed-bea1-f95506cdeb19`. L’export disponible est tronqué à 20 000 caractères : sections 1–8 disponibles, section 9 incomplète. Voir `references/V86_CHATGPT_PLACEABLES_SOURCE_TRUNCATED.md`. Cette livraison ne clôt pas la conversation ni le jeu.

## Périmètre implémenté

Les quatre familles déjà présentes (Portable Sentry, Cryo Mine, Electroshock Trap, Portable Quarantine) utilisent maintenant un registre d’instances physiques. Les 12 IDs base/Field/Military sont autorisés explicitement ; aucune propriété `utility` cyclique ni correspondance floue ne crée d’objet. Quatre images dédiées existantes sont raccordées au monde, avec échelle uniforme, contact au sol propre à chaque état et orientation native corrigée localement.

Sélection → aperçu de l’empreinte et du secteur → confirmation → installation temporisée. Le support doit couvrir toute la largeur ; porte même ouverte, accès, obstacle, vide et position trop éloignée produisent un refus. J1/J2 réservent chacun une instance. Pendant l’installation/repli, le combat de l’opérateur est suspendu ; déplacement et impact interrompent l’action. Pause et chargement ne font pas avancer la tâche.

Une instance possède son identité, son propriétaire, sa position, ses PV, ses munitions, son armement et sa durée restante. Le repli ne rend pas une charge globale : il transporte le même exemplaire, sans le réparer ni le ravitailler. Le snapshot omet tâches et aperçus ; arrêt et reprise les annulent. Seuls les objets commis reprennent. Les anciens déploiements V72 gardent leur chargeur historique, tandis qu’un ancien usage sans preuve physique reste consommé.

Le dock garde J1 par défaut avant la construction des personnages, puis respecte le choix explicite J1/J2. Un boîtier consommé reste récupérable s’il est au sol, non détruit, à portée et visible ; aucune récupération ne réarme un piège. Les événements persistants de mission écrivent le nouveau snapshot sur un clone du profil : en cas de quota, l’ancien snapshot et les octets déjà stockés sont conservés, la boucle du jeu continue et un avertissement français est limité à un toast par dix secondes. Cette protection ne certifie pas les chemins séparés de fin de mission ou d’ouverture des archives.

Le dock occupe une rangée hors du canvas et les longues listes défilent dans une zone bornée. Il ne recouvre plus les visées souris/tactiles ; sans équipement il est masqué hors pause. Pendant la pause, « Sauvegarder la mission » reste accessible et partage le handler de sauvegarde de la barre principale. Quota, récupération et mauvais propriétaire refusent cette action sans faux message de réussite.

La sentinelle couvre un secteur limité avec LOS et projectiles réels. Sa dotation neuve de 150 coups, sa cadence de 5 coups/s et ses durées 2,5 s/2 s viennent des valeurs de prototype de la source. Les PV et empreintes sont un équilibrage Tantalus, pas des nombres canoniques. Les objets sont vulnérables aux projectiles hostiles et aux attaques de proximité dédiées. Ils ne sont pas présentés comme des barricades bloquant le passage.

## Art : aucune fausse certification

La sentinelle et la cryomine conservent des vues trois-quarts d’inventaire ; corriger orientation/ancre ne les transforme pas en nouvelles vues orthographiques. Les quatre cellules existantes sont des états, pas une animation de pose fluide. Aucun autre personnage n’est substitué pour l’interaction. Audit exact : `V86_PLACEABLE_ASSET_AUDIT.md`.

Une nouvelle plaque B03 a été produite avec ImageGen intégré, sans API/CLI. Elle reste une candidate hors runtime sous `references/v86-art-candidates/`, exclue du site : son arrivée ne signifie ni collision de barricade, ni mouvement poussé, ni animation validée. L’édition utilisant un fichier Windows reste indisponible ; pas de contournement payant. L’exclusion du site ne rend pas un fichier confidentiel s’il est ensuite publié dans un dépôt GitHub public.

## Contrats encore ouverts

- T01 : rechargement manuel 3 s avec réserve finie compatible, modes veille/priorités/ordre désigné, entretien et ravitaillement. Pas de remplissage implicite en attendant.
- T02–T07 : vrais mécanismes et plaques dédiées ; un affût occupé n’est pas une sentinelle automatique.
- M01–M08 : variantes, canaux de détonation, dégâts alliés, résistance aux interruptions et pièges muraux. La cryomine existante n’est pas rebaptisée mine explosive.
- B01–B07 : obstacles physiques partagés, franchissement/contournement/destruction et, pour B03, transport/poussée/verrouillage. Une plaque candidate ne remplace pas ces systèmes.
- S01–S06, R01–R06, U01–U06 : consommables logistiques, visibilité, capteurs, exploration et points compatibles, sans contournement des verrous metroidvania.
- Ordres logistiques IA, affinités/aptitudes de déploiement, animation complète des opérateurs et support des plates-formes mobiles restent à livrer.
- La fin du message source, indisponible, reste à vérifier avant toute déclaration d’exhaustivité.

## Vérification et publication

Les résultats effectifs sont consignés séparément dans `VALIDATION_V86.md` à la fin de la passe. Le gate HTTP V86 conserve les 52 fichiers critiques antérieurs et ajoute les cinq intégrations posables ; il vérifie 16 assets exacts, les MIME et l’exclusion des preuves privées. Les rapports candidats/QA V86 sont exclus du build et de Vercel. Aucune publication GitHub/Vercel n’est impliquée par une validation locale.
