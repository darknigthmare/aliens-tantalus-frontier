# Covenant v0.10.0 — règles de continuation

Continuer cette source, ne pas la remplacer par un prototype neuf. Module autonome local, pas Tantalus cumulatif. L’objectif 1:1 est explicite, mais non atteint : ne pas confondre un mapping documentaire avec un asset exact ou une interaction.

## Contrats spécifiques de cette passe
- 315 références suivies ; film/bonus/invention séparés ; verified1to1=false tant qu’aucune vérification adaptée n’existe. Les données source ne doivent pas devenir « vérifiées » par simple copie.
- Un seuil doit être porté par un mur, un chemin, un sol ou une rampe cohérente. Pas de porte métallique flottant en plein paysage. Recapturer les extrémités modifiées et tester leur vrai contact.
- La pièce blanche est un tableau indépendant et n’écrit pas dans la campagne. Un raccord géographique vers le vaisseau est interdit. Les tableaux ne gonflent pas le nombre de lieux interconnectés.
- Les trois pièces du lander respectent sa destruction ; Origae-6 reste non visitable ; ne pas transformer un bonus en scène du montage cinéma.
- Les quatre armes ont des chargeurs indépendants et une réserve abstraite partagée. Y ne donne aucune munition. Les SL40, Inox et EAA visuels ne sont pas des armes utilisables supplémentaires.
- La révélation du nom de David ne change pas sa tenue de Walter. Les poses spéciales doivent conserver le profil courant. Pas de prétention de ressemblance faciale exacte.
- Documents et QA se reconstruisent depuis la même source. Les journaux historiques ne doivent pas être additionnés aux résultats actuels. Tests actuels sous qa/v10, sources antérieures sous history.

## Contrats
1. Conserver les 56 espaces physiques + le tableau séparé, les 86 actions dont42 obligatoires, les67 liaisons physiques et134 seuils, les44 réserves,19 relevés,18 présences/32 sujets et154 dossiers. Les cotes du film ne sont pas certifiées.
2. x/z, projection, pieds, tir, collision, caméra et carte concordent. Props non solides sauf déclaration explicite. Quatre rotors et la dalle sont des barrières dynamiques qui ne disparaissent pas parce que leurs dessins ne sont pas des solides ordinaires.
3. Un seul xeno-cargo sur cargo/corridor/stores/relay/filterduct/freightduct. Aucun doublon par caméra ou seuil. Pas de traque à coolantduct/cryostase/ruines. La vision directe prime l’appel sonore. Neo-basin est une unique rencontre locale finie, pas une nouvelle horde.
4. Portes partagées et stress conservé. Une route acoustique n’a pas le droit de forcer la porte ; une sortie réellement vue peut entraîner un forçage. Le retour reliquary-return est stonegate, pas une porte métallique de coursive.
5. Grue et éjection requièrent préparatifs et présence réelle de l’intrus dans leur zone. Aucune éjection à distance depuis une gaine ; les balles ne finissent pas ces deux confrontations.
6. Soins/relevés/rotations/consignations/travaux ont leurs interruptions. Fermer une modale efface les entrées. Le réseau U reste vivant ; une blessure le ferme sans effacer les dégâts. Les menus ordinaires sont en pause.
7. Les galeries rampantes limitent le joueur104/s et l’adulte110/s. Sans saut, course ou arme ; aucun consommable retiré sur refus. Quatre rotors consignés en1,8s, ralentis en2,4s, collision si spin>0,08. Les deux sectionneurs partagent le même état. Pas de redémarrage sous un corps.
8. Les couronnes sont physiques :1,2s par cran, indices0–3, fraction partielle conservée ; commandes explicites après import. Les trois signes cibles sont Source/Chute/Vasque (indices1/3/0), toutes commencent sur0. La troisième est déjà juste. Une mauvaise combinaison ne réinitialise ni bagage ni réglages. N collecte les trois indices, sans être obligatoire pour l’observation.
9. Levier distinct, cycle5,5s+3,2s autonome non protecteur. Le même elapsed produit eau, jauge, contrepoids, dalle et collision. Fin de course avec tolérance pour atteindre exactement ouvert. La dalle bloque saut et adversaire. Aucun budget du Covenant ne commande ce mécanisme.
10. Format externe1,révision10,clé Covenant inchangée. État ET checkpoint validés avant remplacement. Copier les anciens octets avant écriture. Refus de copie=source intacte, reprise/export possibles. Les actions manuelles ne redémarrent pas à l’import ; le cycle déjà lancé continue. Les positions dans une dalle/rotor sont réparées.
11. Mort=checkpoint d’entrée, pas conservation magique de toutes les actions postérieures. Rejouer un chapitre est une nouvelle tentative ; mécanismes/stock réinitialisés, découvertes achevées selon les règles existantes. Exporter avant une branche destructive.

12. Trois lieux planétaires optionnels après les préparatifs du champ dans les deux sens. Aucun nouvel ennemi ; aucune obligation de détecteur sur la route principale. Les massifs sont dangereux sans être solides. Garder les contacts et arrivées hors des noyaux.
13. `atmosphere.js` est pur : cœur permanent, bruit/visibilité admissibles, avertissement0,65s, émission6,75s, récupération14s ; vent32s. Le dessin et les sondes utilisent exactement les champs du modèle, jamais une autre géométrie. Hors champ le temps continue, pause le fige. Aucun postulat médical/canonique ajouté.
14. K exige la collecte windfall-a1. Trois sondes instantanées0/150/300, aucune lecture d’ennemis. Les parois retournent inconnu plutôt que zéro. Le détecteur est transitoire ; le nuage/cooldown est sauvegardé. Interventions, soins, blessures, menus et changements de pièce rangent le boîtier. Pas de sprint, tir ou consommation de matériel en cas de refus.
15. `hazardContrast` et `reduceFX` ne changent jamais les dégâts ou collisions. Le bandeau de sondes demeure hors Canvas. Préserver les anciens états avant migration v9→v10 et tester l’échec de copie de sécurité.

16. Les trois charges du fret ont un état `freight` unique. Rails à z fixe, P à la poignée, 68/s et effort 10/s seulement en mouvement. Pas de crush, inertie, nouvelle récompense ou objectif. L’intrus reste actif. Aucune action incompatible ne dépense sa ressource. Les parcages sont réversibles, les dossiers dédupliqués.
17. `solidProps(room,state)` inclut les charges. Ne jamais utiliser directement `room.props` pour un nouveau test de collision, de tir ou de visibilité sans traiter les obstacles dynamiques. La caméra utilise le renderer le plus dérivé via façade read-only, pas une instance limitée à une ancienne extension.
18. Le segment exact évite le saut d’une paroi mince. Le bond vérifie la vue avant les dégâts ; conserver la fixture qui échoue dans le vrai v0.8 et réussit ici. Les corps importés sont corrigés selon le fichier entrant et pas la partie en mémoire. `grip` n’est jamais importé.

## Architecture
19 modules : content, ship-systems, maintenance, archaeology, atmosphere, freight, fidelity, core, renderer, art-direction, threshold-art, field-art, network-art, maintenance-art, archaeology-art, atmosphere-art, freight-art, fidelity-art, app. Ne pas simuler depuis un renderer. Le bridge facultatif reste hors gameplay.

## Validation actuelle
npm run check ; node qa/release-playthrough-v10.cjs ; python qa/browser-v10.py ; python qa/storage-v10.py ; python qa/capture-v10.py ; python tools/write-docs.py. 401 tests, 38+9 contrôles navigateur, 15 parcours. Inspecter 57 entrées spatiales et 134 extrémités après une modification structurelle. Les positions de capture sont préparées ; aucune certification Windows ou partie humaine.
