# V88 — intégration campagne, début jouable et menu

État local du 23 septembre 2026. Projet : D:/CodexWork/aliens-tantalus-frontier/project.
Base privée : dc1dbe23a149966e03e5620a1f7f6ae120452a20. Aucun commit, push ou déploiement de ce lot à ce stade.

## Réalisé

- Les 35 images utilisateur V87 ont des identités propres en campagne et dans l'encyclopédie, pas seulement dans BIOFORGE. Leurs fichiers restent inchangés ; les anciennes versions sont conservées sous les libellés Altered.
- Maximum deux contacts contextuels par opération ordinaire, en remplacement d'emplacements existants et dans des groupes de mondes explicites. Aucun mélange global aléatoire ni affirmation de continuité canonique entre les œuvres.
- 606 dossiers consultables. Observation et neutralisation sont enregistrées par profil/campagne ; la sauvegarde conserve les identités et les PV. Les poses fixes, animations absentes et comportements simplifiés sont signalés.
- Menu extérieur sans cadre de cockpit ni débris par défaut. Les exceptions demandent un contexte explicite de station ou d'événement/mission. Aucun contexte station réel n'est inventé à partir d'un simple nom de monde ou d'un état docked.
- Déplacement de présentation continu, indépendant du framerate, sans boucle visuellement cassée ; préférence de réduction des mouvements respectée.
- Sélection d'angles réellement dessinés prête côté code, mais registre vide : aucun candidat non conforme n'est activé.
- Suite de l'accueil V84 : couchette, dotation, qualification M41A au stand existant, relais interrompu, signal de Port-Méridien, fret médical ou énergétique unique, première opération existante. Il s'agit d'une continuation écrite pour le projet, pas d'un transcript récupéré ni de la campagne PALISADE complète.
- Reprise verticale optionnelle sur les passerelles, validée contre les limites et obstacles. Les sauvegardes historiques sans hauteur gardent leur règle de placement ; coordonnées d'annexe, de REFUGE et du vaisseau parent restent séparées.
- Les trois boucles hub/combat bornent désormais le temps écoulé à zéro : un premier callback rAF antérieur au démarrage ne déclenche plus de saut sans entrée.

## Vérifications

- Suite générale finale : 3 163 PASS, 1 ignoré, zéro échec sur 3 164 tests (journal tests-final-verified.log).
- Lint : 541 modules PASS. git diff --check PASS.
- Campagne navigateur finale : 35 fiches affichées, mission normale lancée par les contrôles de l'application, dégâts réels, découverte persistée via le vrai dispatch, identités et PV conservés après recharge. Neuf jalons, zéro erreur. Fixture initiale uniquement pour l'accès à cette campagne ; aucun acteur, PV, munitions ou découverte injectés ensuite.
- Menu navigateur : neuf jalons sur le build final, zéro erreur. Contrôle complémentaire des six vaisseaux, deux noms et deux formats mobiles. Le contexte station/événement est testé explicitement, pas présenté comme un voyage réel.
- Ouverture full-final-04 PASS : trajet physique, neuf tirs dans trois directions et recharge, réparation annulée puis réussie, signal sauvegardé/rechargé, trajet de maintenance, fret médical, reprise hangar immédiate Y268/grounded/santé100, première insertion, inventaire10 sauvegardé puis restauré à10, retraite et marqueur complete. Zéro erreur runtime/HTTP. Le profil initial est une fixture après le briefing V84 ; ce contrôle ne prétend pas rejouer la création du personnage. Branche énergie et issue succès contrôlées par tests, pas annoncées parcourues dans ce scénario navigateur.
- Build final réussi, daté 2026-09-23T06:06:33.956Z. Contrôle HTTP : 58 fichiers (23 fichiers runtime et les 35 PNG) répondent 200 avec SHA-256 identique à la source ; six chemins de candidats, prompts et rapports privés répondent 404. Total64 contrôles PASS. Le build intermédiaire divergent n'est pas celui livré.

Régressions effectivement trouvées puis corrigées : dégâts d'un ancien boss après reprise, propriété du profil pour les découvertes, champ openingV88 incohérent à la première sauvegarde, image cassée conservée au redémarrage, callbacks d'une ancienne mission, fret médical ignoré après rejet d'un checkpoint, contact hangar mal placé, hauteur perdue et delta négatif au premier rAF. Les découvertes dont l'écriture échoue restent en attente en mémoire et sont retentées toutes les deux secondes de simulation, avec un avertissement unique et contrôle profil/timeline/opération ; une fermeture tant que le stockage refuse toute écriture ne peut pas garantir leur conservation.

Preuves conservées :

- E:/CodexQA/AliensTantalus/v88-final-20260923/
- E:/CodexQA/AliensTantalus/v88-campaign-20260923/browser-private/run-04-discovery-retry/report.json
- E:/CodexQA/AliensTantalus/v88-final-20260923/browser-build-final/report.json
- E:/CodexQA/AliensTantalus/v88-final-20260923/http-build.json
- E:/CodexQA/AliensTantalus/v88-menu-20260923/runtime-final-02/report.json
- E:/CodexQA/AliensTantalus/v88-menu-20260923/options-final-02/report.json
- E:/CodexQA/AliensTantalus/v88-opening-20260923/full-final-04/opening-v88-browser.json

## Images et limites

Le générateur intégré OpenAI est le seul employé. Les deux premiers Sulaco sans référence exploitable sont rejetés. Le nouvel arrière guidé par les photographies du modèle est une reconstruction reconnaissable et techniquement détourée, mais des panneaux et appendices restent simplifiés ; il n'atteint donc pas le seuil strict demandé. L'œuf 1979, issu d'une référence de tournage du Science Museum, reste également un candidat. Aucun pourcentage absolu de fidélité n'est certifié.

Voir [références et prompts](v88-art-candidates/REFERENCES.md). Les candidats, prompts et preuves V87/V88 sont exclus du build ; les photos officielles n'ont pas été copiées dans les assets publics.

Il reste à compléter l'inventaire exhaustif films/jeux/comics et les poses manquantes, puis leurs animations et comportements spécialisés. Le total de 571 anciens profils ne signifie pas 571 créatures officielles distinctes. Aucune campagne complète Port-Méridien, nouvelle géométrie de carte PALISADE ou nouvelle vue 1:1 n'est annoncée livrée.
