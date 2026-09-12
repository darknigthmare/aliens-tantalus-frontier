# V85 — recrutement causal, identité et dotation individuelle

## Source et contrat

La conversation **Créer des marines uniques**, thread `6a9df801-9e7c-83ed-8104-244ed10c8587`, a été retrouvée intégralement et archivée dans `references/V85_CHATGPT_RECRUITMENT_SOURCE.md`. Son verbatim n'a pas été corrigé. Un addendum daté complète l'audit V83 : les huit aptitudes sont bien présentes dans la source complète, contrairement au résumé V76 précédemment disponible.

Les aptitudes sont Tir, Physique, Mobilité, Sang-froid, Technique, Secourisme, Perception et Cohésion. Le générateur construit activité et formation avant les valeurs et la dotation. Chaque valeur initiale conserve son calcul : socle 50 + allocation d'expérience + allocation de formation. Le nom, l'apparence et l'origine démographique n'ajoutent aucun bonus.

## Dossiers et renouvellement

- Les quatre exemples originaux du chat ouvrent le premier pool : Mara « Rivet » Voss, Nadia « Suture » Bensaïd, Jonas « Bastion » Reed et Jun « Balise » Seo. Leurs nombres indiqués sont reproduits, les autres aptitudes restent à 50 ; total initial 400.
- Les prochains lots utilisent 64 combinaisons activité/formation, quatre candidatures et une mémoire des 32 signatures structurelles récentes. Le nombre de tentatives est borné ; changer le nom ne compte pas comme une nouvelle structure.
- Chaque dossier et chaque objet possèdent un identifiant permanent. Lire, ouvrir une fiche, migrer ou recharger ne renouvelle pas le pool.
- Renouvellement explicite après 24 heures **de jeu**, pas de temps réel et pas d'attente facturée. Un recrutement retire exactement ce candidat ; le prochain écran ne le remplace pas par un nouveau tirage.

## Choix de conception V85, pas règles prétendument retrouvées

La source définit des budgets séparés, mais pas des prix, des identifiants techniques ou des formules moteur définitives. Les valeurs suivantes sont donc des règles de conception V85 : coût d'affectation 600 crédits, plafond 64 recrues, budget initial d'aptitudes 400, budget maximal de matériel 600 unités de valeur. Formation : 80 crédits + un ravitaillement, quatre heures de jeu et +2 à l'aptitude choisie, plafond 100. Toutes les aptitudes restent accessibles, y compris aux membres historiques sur un socle de simulation neutre, sans biographie inventée.

Les kits emploient une liste explicite d'objets existants ; ils n'utilisent pas les anciennes catégories `utility` calculées cycliquement du catalogue. Le stock fonctionnel comprend notamment fusil M41A, pistolet M4A3, pompe M37A2, outils de réparation, médical, protection, tracker, balise et munitions compatibles.

## Persistance et opérations

Le dossier initial `recruitV85` reste séparé de la formation, des objets actuellement possédés et de l'historique. Les transferts déplacent l'instance d'un objet sans débloquer une copie dans l'inventaire global. Une dotation devenue vide ne se remplit pas automatiquement avec le kit historique.

La migration ne reconstruit plus uniquement les seize identités fixes : elle conserve les recrues authentifiées et leurs références dans la sélection et le manifeste. L'identité de Mara Vega et celle du joueur restent distinctes. Les valeurs et objets individuels engagés sont figés dans `crewManifestV85`, puis restitués au moteur lors d'une reprise. Les modifications de personnel restent verrouillées pendant une opération ou le prologue.

Les actions d'interface travaillent sur une copie de la sauvegarde. Formation et simulation galactique sont calculées sur cette copie ; aucune nouvelle donnée n'est publiée en mémoire avant que l'écriture du candidat complet ait réussi. Les modales appartiennent à une chronologie et se ferment lors d'un changement de profil.

## Consommateurs moteur vérifiés par régressions

Le Tir règle l'écart déterministe des tirs IA ; Physique règle capacité de portage et récupération d'endurance ; Mobilité règle vitesse, accélération, saut et montée ; Sang-froid règle la montée et la récupération du stress. Technique et Secourisme règlent respectivement réparation et soin avec consommation de l'outil porté. Perception règle la portée et la durée de détection ; Cohésion intervient dans la récupération à proximité des équipiers. Les formules sont des choix V85, pas des constantes canoniques.

Les outils dépendent du matériel possédé, pas d'une classe verrouillée. Le M41A, le M4A3 et le M37A2 utilisent leur propre profil, chargeur, réserve et rechargement tactique. Les commandes IA/J2, les retours IA et les reprises conservent ces états. Les régressions ont également couvert les cooldowns d'outils J2, l'armure individuelle, les compteurs d'actions, les ordres Alpha/Bravo et les auras historiques après formation.

La revue indépendante a reproduit deux raccords oubliés : le J1 d'une ancienne sauvegarde sans identité V84 ne recevait pas sa dotation de recrue, et le ramassage global M41A pouvait donner 99 cartouches à un M37A2 personnel. Le J1 legacy reçoit désormais son contrat réel et le conserve à la reprise ; le ramassage incompatible reste au sol, sans créer ni consommer une dotation personnelle. Le joueur indépendant V84 conserve son contrat distinct.

L'essai navigateur a aussi montré que le mode coop sauvegardé dans une opération écrasait un changement explicite effectué dans Système. L'application restaure les acteurs puis applique le réglage courant ; une régression exécute cet ordre dans les deux sens, avec reprise native ou compatibilité.

## Interface Echo-9 et suivi vécu

Les vues Équipe active, Réserve et Candidats partagent un résolveur d'identité commun. Les fiches proposent les huit valeurs expliquées, une comparaison, les dotations actuelles, les formations et les transferts. Les points forts et limites apparaissent avant recrutement. Une fiche native défilante reste dans le viewport mobile et contient son focus ; les erreurs d'écriture restent visibles dans le dossier.

La QA réelle a fait corriger la grille portrait historique de 75 px héritée par les cartes, puis les sélecteurs de tenues imposés à 220 px qui élargissaient le viewport mobile de 390 à 421 px. Les contraintes sont corrigées sur les éléments concernés, sans masquer le débordement global. Tab/Maj-Tab restent dans le dossier ; Échap et retour au bouton d'origine sont conservés.

L'historique de service ne reprend pas la répartition artificielle du total de victimes entre membres. Les événements individuels enregistrent les participants et l'issue d'opérations réellement résolues, et les relations comptent les missions vécues ensemble. Aucune ancienne campagne importée ne reçoit d'exploits rétroactifs. Un archivage administratif V69 ne constitue pas une mission vécue.

## Limites maintenues

- Aucune nouvelle image n'a été générée : la tentative ImageGen intégrée avec référence Lurker a échoué avant production, même depuis une copie vérifiée sur C. L'utilisateur a demandé de rester sur l'outil intégré ; aucun appel API payant n'a été effectué. Receipt exact dans `references/v85-imagegen/lurker-reference-attempt.json`.
- L'uniforme commun réutilise le corpus Echo-9 existant et est déclaré comme tel. Ce n'est pas un portrait ni une apparence individuelle. Aucun changement de `crewId` vers Mara ne sert à obtenir un sprite.
- Les props absents du catalogue, notamment le harnais d'évacuation et les objets personnels physiques/casiers, ne sont pas inventés comme objets fonctionnels. Le dossier signale le matériel réellement fourni.
- Les dialogues réactifs, missions personnelles, souvenirs communs détaillés et exploits attribués action par action ne sont pas déclarés complets par ce lot.
- Les 571 profils ennemis ne sont pas couverts : 14 restent intégrés, 557 non intégrés. Lurker/Atarax rejetés restent exclus.
- Ce lot améliore la conversation #5 sans la fermer. Il ne prouve ni l'équilibrage de toutes les campagnes ni un jeu commercial complet.
