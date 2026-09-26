# V96 — Xeno Trials et poses dédiées

État local du 26 septembre 2026. Extension de contenu du runtime V86 ; pas une nouvelle version publiée.

Note historique : les réglages, compteurs et état Git ci-dessous sont ceux de V96. La suite V97 est décrite dans [le bilan du 27 septembre](V97_TRIALS_DEPTH_BATCH_20260927.md).

## Module jouable

La navigation du vaisseau propose **WY / Xeno Trials**, une simulation originale de combat 2D contre IA. Ce programme, ses doctrines, récompenses et statistiques sont une adaptation du projet, pas un événement canonique de la franchise.

- 14 combattants : Warrior, Runner, Arachnoid, Defender, Grid, Spitter, Prowler, Razor Claws, Chrysalis, Smasher, Predalien Primal Hunt, Xenoborg, Royal Guard, Reine mobile.
- Arachnoid Grey et Purple partagent leur identité et leurs statistiques, mais utilisent deux PNG distincts. Defender possède son propre profil défensif.
- Quatre cellules adverses simulées : Confinement, Poursuite, Laboratoire rival, Ruche. Trois décors : confinement, réacteur, ruche.
- Déplacement, saut, garde avec endurance, attaque rapide, coup lourd, spécial (bond, charge, queue, lacération, acide ou impulsion selon le combattant).
- Deux manches gagnantes, 75 secondes par manche ; plafond de cinq manches pour éviter une boucle d'égalités. L'IA a trois difficultés.
- Progression par profil : crédits de simulation, XP, déblocages, victoires par doctrine, journal des 50 derniers résultats. L'économie de campagne n'est pas débitée.

Clavier : Q/A ou flèche gauche, D ou flèche droite ; Z/W, flèche haute ou Espace pour sauter ; S/flèche basse pour la garde ; J/K/L pour les attaques ; P/Échap pour la pause. Des boutons tactiles et accessibles au clavier sont également présents. La perte de focus met en pause, sans reprise automatique.

Un ticket est sauvegardé avant le duel et consommé une seule fois au résultat. Une erreur de stockage n'accorde pas de gain non enregistré. En quittant le module ou après rechargement, le ticket peut être recommencé **depuis la première manche**, ou annulé sans récompense. Il ne s'agit pas d'une sauvegarde de la position exacte du combat. La validation est locale, pas un dispositif anti-triche serveur.

## Six PNG natifs intégrés

Trois profils historiques reçoivent chacun un visuel propre, sans changer leurs comportements ou collisions : **Armored Working Joe, Armored Combat Synthetic, Armored Weyland-Yutani Commando**. Ils restent des variantes du projet.

Trois identités nouvelles sont accessibles dans le bestiaire et la Bioforge : **Hammerpede, Mantis Alien et Queen Facehugger Kenner/NECA**. Elles ne sont pas encore distribuées dans les rencontres automatiques de campagne. Leur combat de laboratoire reste générique ; aucune constriction, saisie ou implantation spécialisée n'est annoncée.

Ces images originales ont été guidées par les références existantes et, pour les nouvelles identités, des photos du fabricant licencié NECA : [Hammerpede / Prometheus](https://store.necaonline.com/blogs/news/174242631-shipping-now-prometheus-series-2-figures-check-out-the-action-shots), [Mantis et Queen Facehugger / Series 10](https://store.necaonline.com/blogs/behind-the-scenes/closer-look-aliens-series-10-kenner-tribute-action-figures). Les personnages Kenner restent identifiés comme figurines, pas comme castes de film ; le contenu des mini-comics ne se déduit pas de leur emballage.

Les PNG natifs conservent leurs octets et leur transparence : pas de découpage en fausses frames, recoloriage ou détourage secondaire. Dimensions, SHA256, pivots et mise à l'échelle sont contrôlés. Certaines marges sont serrées et certains corps ont un alpha maximal de 254/255 ; ces limites sont conservées et documentées. Le rendu a été contrôlé sur fond clair/sombre et dans les moteurs réels. La fidélité anatomique exacte 1:1 n'est pas certifiée.

## Ce qui reste ouvert

Le roster compte toujours **571 profils historiques**, plus **103 identités statiques distinctes** dans le catalogue étendu. Trois des 515 profils historiques qui partageaient leur visuel disposent désormais d'une pose dédiée : **512 restent à traiter pour un visuel propre**. Les **515 tâches d'animation restent ouvertes** : les nouvelles images sont des poses fixes. Le budget recensé de 2220 planches n'est pas un nombre de planches livrées.

La recherche films/jeux/comics n'est pas exhaustive. Les nouveaux synthétiques AFE en recherche n'ont pas encore de PNG admis. Les 17 sources précédemment retenues restent exclues. Les personnages s'affrontent avec des poses fixes et une simulation de déplacements/collisions ; ce lot ne comprend ni animations de combat complètes, ni multijoueur réseau, ni tournoi narratif inter-factions.

## Vérification et distribution

Les tests couvrent moteur déterministe, contacts, garde, projectiles, manches, configuration, progression, refus des résultats incompatibles, écritures atomiques, propriétaires de sauvegarde, arrêt des écouteurs et chargements asynchrones. Une session réelle Chrome a validé un duel complet au clavier, la sauvegarde unique, le rechargement, la sortie du module, l'annulation et la disposition mobile. Les preuves de rendu des nouveaux ennemis sont des scènes QA ciblées utilisant les vrais moteurs, pas des campagnes entières jouées.

Les preuves privées, prompts et captures de références restent hors du build. Le cache applicatif inclut les nouveaux modules ; les grandes images se chargent à la demande. Un duel ne démarre pas si ses deux images n'ont pas pu être chargées. Aucun commit, push ou déploiement n'est effectué par ce lot.
