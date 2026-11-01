# Continuation des Excel — 1er novembre 2026

La continuation part de la PR #25, tête `ec099872d3fc59465c6d17e30b577629b462f139`, et conserve les dix-neuf classeurs historiques. Le [nouveau suivi](CLOTURE_EXCEL_20261101.xlsx) et ses [données](EXCEL_CLOSURE_20261101.json) recensent les lignes à poursuivre, leurs références exactes et leurs critères de clôture.

## Corrections initiales et portée de validation

- **Idris, montre 05h → 09h :** la dépendance d’un passager éloigné renvoyait `false` comme obligation de service et annulait sa vraie montre. Le corps du réacteur était alors remplacé par un poste échantillonné dans l’annexe, sans voyage observé. Le moteur délègue maintenant à la montre héritée lorsque le passage local n’est pas occupé. Le même corps, son origine et ses compteurs sont conservés ; les voyageurs réellement présents gardent leur priorité physique.
- **Asha, retour de Jun :** l’observateur exigeait une immobilité pendant tout le voyage inter-ponts de Jun. Depuis la réservation du couloir physique V198/V201, Asha peut marcher à 27 px/s dans le refuge jusqu’au joueur qui occupe le seuil. L’observateur vérifie cette marche, son temps, sa distance, les appuis et le dégagement de 12 px. Il refuse les téléportations, les changements de propriétaire, les traversées prématurées et les faux reçus de retour de Jun. Le moteur d’Asha n’est pas modifié.
- **Retours d’Idris et de Leila :** la réservation d’Idris est bornée à sa véritable approche de porte et au retour ouest qui doit encore traverser son couloir. Une cabine éloignée n’immobilise plus le service ; le retour de Maksim conserve sa priorité jusqu’au dégagement physique. La cuisine conserve Leila à son poste pendant le passage réel de Jun sur le sol du mess. La recette dégage ensuite le joueur au clavier au-delà des deux trajets, en conservant les collisions et le délai de 240 secondes.
- **Arrivées au poste :** les compteurs d’arrivées ne sont pas des compteurs de traversées. Une véritable reprise de service peut augmenter ce compteur sans quitter l’annexe. Les deux observateurs vérifient les transitions effectivement observées `walking → service`, le vrai but atteint, la vitesse nulle et un incrément exact de un. Les deux traversées, l’origine, les appuis et le retour natif restent exigés ; un compteur inventé ou un propriétaire perdu prématurément est refusé.
- **Relais Rook et Tamsin :** le workflow séparé `Native station relays V166` exécute les deux pilotes existants qui observent leur départ et leur retour à la station réelle. Les boucles locales V165 ne suffisent pas à prouver ce trajet complet. Chaque route conserve son propre résultat et ses captures ; aucun statut de réussite n’est déduit de la seule configuration du workflow.

## Lecture du suivi

L’inventaire analyse 1 178 lignes dans les 26 tables Trials et 1 503 lignes dans les 17 onglets Arsenal. Il rapproche les dossiers d’armes des CSV versionnés : 71 identités cataloguées et 129 propositions de recherche, avec 57 recettes. Les sorties de Trials sont rattachées aux fiches roster ; les affectations historiques et les références sont conservées dans les sources sans créer de nouveaux travaux fictifs.

Le classeur externe costumes V190 a été retrouvé et lu via sa projection CSV : 31 costumes, 114 pièces, 288 scénarios et sept critères d’admission. Après rapprochement de deux identités déjà présentes, le suivi comporte 1 022 fiches par domaine et portée. Un chantier ou une priorité peut regrouper plusieurs fiches : leur total n’est pas un pourcentage de jeu terminé. Le suivi conserve explicitement les sept routes, les tâches d’art, les recettes, les opérations partielles et les propositions non admises. Les exigences anciennes de l’arsenal qui demandent une réconciliation avec le moteur actuel restent marquées ainsi ; elles ne sont ni déclarées absentes ni artificiellement terminées.

Une clôture technique décrit le parcours réellement vérifié. Elle ne ferme pas la fidélité artistique, les sources de mouvement ou les limites de contenu. Aucun costume ni aucune arme n’est nouvellement certifié 1:1. Les classeurs externes V173/V174/V177 ne sont pas présents dans ce checkout. Les métadonnées du cumulatif V198 sont retrouvées, mais son contenu reste non réconcilié : lecture textuelle interrompue (`Transport closed`) et transfert binaire HTTP 403. L’inventaire global courant des Excel externes n’est donc pas établi. Les archives Blackout/Earth, l’encyclopédie brute et V10 restent à récupérer dans les sources de travail suivies.

La recherche documentaire du 1er novembre précise ce dernier point : quatre dossiers Drive, treize listings et huit documents ont été inspectés ; quinze vrais fichiers d’archives sont identifiés par leurs métadonnées, principalement V1/V15/V16 et héros V3. Les sous-dossiers Blackout et Earth inspectés sont vides ; le classeur brut de 2 363 entités et V10 ne sont pas retrouvés dans ce périmètre. Aucun ZIP/RAR n’est téléchargé, aucun contenu ou CRC binaire n’est réconcilié. Ces observations bornées ne prouvent pas une absence globale dans Drive et ne substituent pas ces collections aux sources recherchées.

## Anciennes PR et concepts

La demande de vérification couvre les deux jeux. L’onglet « Anciennes PR » contient les 27 PR Tantalus et les 64 PR Yautja, avec les promesses, les réalisations observées, les limites et les sources. L’ascendance est vérifiée : 23 PR Tantalus sont fusionnées dans `main` `4676a78`, quatre brouillons restent hors `main` ; Yautja compte 28 fusions dans `main` `f1856f6`, 34 PR ouvertes et deux PR fermées sans fusion (#32/#35), consolidées vers #31/#34.

L’audit est documentaire et structurel. Il ne constitue pas une relecture exhaustive du code des 91 PR ni une nouvelle recette de tous leurs concepts. Les 80 concepts détaillés de Tantalus, les CI consultées et les limites de Yautja figurent dans les données de continuation. Sept classeurs Yautja sont relus par ZIP/XML ; leurs états gelés et les cellules sont distingués des manques actuels à réconcilier avec les descendants. Les comptes historiques de 56 exigences, 354 cibles artistiques et 2 682 variantes ne sont pas additionnés comme de nouvelles absences actuelles. Les chaînes concurrentes de planètes, RTS, gauntlets et quatre modes demandent encore une réconciliation avant intégration. Aucune fusion ni clôture de PR n’est effectuée par cet audit.

## Validation

Le JSON de continuation indique le commit, le résultat et les limites de chaque preuve. Les résultats de la base sont conservés comme historiques : 3 882 tests Node réussis, zéro échec et un test facultatif ignoré sur 3 883 tests ; Forge et Gameplay réussis ; Excel avec quatorze jobs réussis et `crew-lifts` en échec ; release en échec sur l’origine d’Idris. Ces résultats ne sont pas transférés au nouveau candidat.

Le premier candidat `13292ca6d8284fdab607dbc0cd3c31cb68112441` passe 3 886 tests dans 205 fichiers, zéro échec, un test facultatif ignoré. Ses recettes natives joueur/alliés passent 25 contrôles et 43 captures ; services du vaisseau : 121 contrôles et 20 captures. Sa recette Asha échoue sur la constante d’arrivées, conservée comme preuve avant correction. Les succès de ce premier candidat ne sont pas transférés automatiquement au lot combiné suivant.

Le lot combiné V204 `3fb2ad87605a8eb57eb765b4985182ca8ace961c` passe 3 893 tests dans 205 fichiers, zéro échec, un test facultatif ignoré ; sources, build et distribution sont vérifiés. La recette complète Idris + Leila passe 39 contrôles et 24 captures, sans erreur navigateur/réseau, avec sources inchangées et identité HTTP des modules comparée aux fichiers. Les retours, sauvegardes/reprises de porte, traversées couvertes et arrivées au poste sont observés sur ce même build. Ces deux parcours techniques sont clos pour cette recette bornée ; le chantier global de sept services et les limites artistiques restent ouverts.

V205 ajoute une courtoisie ciblée à la véritable factory de route d’Asha : lorsqu’un joueur vivant, immobile et appuyé se tient entièrement dans l’ouverture côté refuge, Asha recule vers son poste à la vitesse existante. La réservation n’est libérée qu’après dégagement de son corps ; les priorités de soins, mission, crise et transitions restent actives. Aucun état durable ou déplacement du joueur n’est ajouté. Les tests isolés de deux corps, d’admission et de priorités passent ; la sortie native par E et le nouveau candidat combiné exigent leur propre recette. Aucune réussite V204 n’est transférée à V205.

V205 publié `b58f0f3883cb1c6ae80a3501e29881dd3684ba0a` passe ensuite 3 896 tests, zéro échec, un test facultatif ignoré, ainsi que sources, build et distribution. Le parcours Asha isolé observe Jun, la vraie sortie E, l’occupation de destination et le retour au domicile avec deux traversées ; son rapport reste **échoué**, car sa dernière assertion exigeait deux arrivées alors qu’une reprise réelle du poste conduit à trois. Ce parcours échoué n’est pas transformé en recette réussie.

V206 modifie seulement l’observateur et ses tests : depuis le compteur réellement observé à l’ouverture occupée, il exige exactement une arrivée supplémentaire au véritable domicile, avec une unique transition de service, appuis et traversée couverte. Le cas historique 1 → 2 reste accepté ; le vrai cas 2 → 3 et les 1 188 observations du run V205 sont vérifiés, tandis que les compteurs et buts inventés sont rejetés. Soixante-six tests ciblés et 37 contrôles audit/cumulatif passent avant la recette finale. Les 59 constantes historiques sont préservées ; le moteur V205 n’est pas modifié. Ces contrôles préparatoires sont distincts de la recette suivante.

### Recette finale V206 et clôtures techniques

Le commit figé **`68023b0b014e57c26bb4ad2726507902323bf44e`** passe **3 898 tests dans 205 fichiers**, zéro échec, un test facultatif du pack physique V175 ignoré, puis les contrôles des sources, la construction et la distribution. Les deux processus navigateur se terminent normalement avec code 0 :

| Recette native | Parcours | Contrôles | Captures |
| --- | --- | ---: | ---: |
| Services V161 | Idris et Leila | 39 | 22 |
| Service V163 | Asha avec prérequis Jun, sortie E et arrivée occupée | 28 | 17 |

Les sources, les modules HTTP et l’identité du build restent identiques avant/après chaque recette, avec zéro erreur navigateur, requête ou HTTP. Jun revient réellement à 3158/532 avec deux traversées, deux voyages en ascenseur et 496 unités verticales. Asha sort par E, respecte l’arrivée réellement occupée puis rejoint son domicile 561 avec une seule arrivée supplémentaire 2 → 3. Les retours Idris 1 → 2 et Leila 1 → 3 sont eux aussi observés ; leurs portails et leurs arrivées au poste sont contrôlés séparément.

Les **trois sous-parcours techniques** `IDRIS-WATCH`, `LEILA-RETURN` et `ASHA-JUN` sont donc clos dans l’onglet « Clôture » pour ces recettes et ce commit. Leurs liens remontent à `21_ChantiersV161!A8` et `23_ChantiersV163!A7` ; cela ne ferme pas tous les huit circuits de cette dernière ligne ni le chantier global `C165-ROUTES`. Les sept services complexes, les autres protocoles, les sources non récupérées et la fidélité artistique restent explicitement ouverts. Les recettes sont automatisées avec fixtures initiales déclarées, pas des validations humaines ou artistiques 1:1. Les preuves et empreintes figurent dans `evidence.v206` du JSON.

Le commit de clôture `760e7aa8eeeceaf2af43d218bbc4b6471b60bc13` ne modifie que le classeur, ses données et ce document. Les résultats ci-dessus restent attribués au commit réellement testé ; les CI de publication sont appréciées séparément sur leur tête exacte.

### CI760 terminée et sept services partiels

Les cinq workflows de cette tête ont désormais un verdict final. Release complète, Gameplay, Forge et relais station réussissent ; [Excel V163](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/41261301088) termine avec douze jobs réussis et trois échecs. Le checkout CI `9cd715408dc2e709c5303281c0521b55d06269d2` et la tête demandée ont le même arbre `5ba83bce900493f55ff998df1e57f79a1dee7543` ; leurs SHA restent distincts. La release confirme 3 898 tests Node réussis, zéro échec et un facultatif ignoré, puis les 39 contrôles Idris/Leila. Les commandes Node répétées dans les autres jobs ne sont pas additionnées.

Les trois échecs sont conservés : Trials perd l'observation au sol du WY-Commando avant d'atteindre Guardian ; Inez réussit l'aller et le service mais reste bloquée au retour dans le réacteur ; Asha n'obtient pas son prérequis de retour Jun dans le budget imparti. Le journal ne publie pas le reçu détaillé de ce dernier cas : sa cause ne peut pas être déduite du seul délai. Le téléchargement de l'artefact Trials est refusé par le proxy ; ses PNG et son rapport CI ne sont pas présentés comme lus.

Les lignes `Travaux ouverts!B581:B587` sont actualisées, toutes **PARTIEL** :

| Service | Preuve retenue | Portée qui reste ouverte |
| --- | --- | --- |
| Rook | Boucle locale V165 et relais station V166 séparés ; 23 contrôles station | Autres contextes, cabine occupée et qualifications distinctes |
| Tamsin | Boucle locale V165 et relais station V166 séparés ; 23 contrôles station | Autres contextes, cabine occupée et priorités spécifiques |
| Cal | CI et recette locale 22 contrôles ; vraie montée/descente, reprise d'échelle | Le handoff ultérieur porte `observedTravel:false` ; interruptions natives distinctes |
| David | Nominal CI et variante locale de cabine occupée réparée | Origine CIC, interruptions et qualification globale |
| Inez | Échec retour CI760 conservé ; successeur local complet vérifié | Autre origine, cabine occupée et nouvelle CI du successeur |
| Maksim | Recette nominale CI passée | Briefing/bridge, cabine occupée et autres priorités |
| Jun | Nominal CI, deux recettes locales et contrôles post-parcours séparés | Autres origines, interruptions et prérequis Asha dans l'environnement CI |

Le pilote interdeck760 ne vérifie pas directement deck/y dans sa dernière assertion, ni les 496 unités verticales au retour de Jun. Ces champs sont contrôlés séparément sur les reçus locaux ; la version207 les impose explicitement. Ils ne sont pas rétroattribués aux anciennes assertions CI. Les boucles locales Rook/Tamsin totalisent 52 contrôles dans leur job commun, distincts des deux relais station. Un seul profil ne certifie pas toutes les conditions d'un service.

### Correctifs207 vérifiés localement

- **David, observateur :** la cible clavier5074 dépassait la borne native5052. La cible dérive maintenant du monde, du corps et de toute la voie d'arrivée ; marche, collision, tolérance et délai120s restent inchangés. Une vraie occupation maintient la cabine fermée pendant une avance positive de simulation, puis le joueur dégage au clavier. Le retour vérifie crew/room/x/y/deck, deux ascenseurs et deux portails, ainsi que496 pour Jun. Sur build760 avec harnais `5895c4b`, la variante passe20 contrôles/16 captures. Les rejeux de deux reçus Jun et vingt corruptions n'ajoutent aucun parcours natif.
- **Trials, observateur :** une latence de transport déclarée700ms reproduit l'erreur avant correction. Le RAF du startup accepté arme maintenant le premier sol lié au même événement ; la pause publique reste au tick observé, sur le même maintien. Moteur, délais et assertions restent inchangés. Le pilote `5f9bd229` passe les six duels locaux,68 contrôles, sur build760 ; suite capture23/23. Guardian est vérifié localement, pas dans le run CI760 qui s'arrête avant lui.
- **Inez, moteur :** le corps natif1680.77 rencontre Idris1736.77 au sol532 avec12px de dégagement. Le joueur est derrière, sans obstacle statique au point. Inez marche vers la baie réelle1622 jusqu'au passage couvert d'Idris, puis reprend sa cabine. Aucun état durable, snap ou exemption de collision n'est ajouté. Le successeur `be3d1cdf` passe43 tests interdeck et la recette native22 contrôles/18 captures, avec retour exact quarantine/deck2/643/532. Le natif montre une attente préventive66 frames ; le recul depuis l'ancien blocage est prouvé en fixture moteur et reste étiqueté ainsi.

Les trois nouveaux correctifs sont marqués **CORRECTIF VALIDÉ (LOCAL)**, avec un compteur séparé des trois clôtures initiales. Cela ne ferme aucune des sept lignes de service ni aucun art1:1. Les paires build/harnais et les répétitions CI/local restent explicites dans les données.

Le quatrième changement renforce uniquement le **diagnostic Jun/Asha** : reçu complet conservé avant l'assertion et état compact imprimé dans les logs ; critères et budgets inchangés. Une exploration locale `all` sur runtime760 passe les cinq profils,119 contrôles/89 captures ; le delta final d'ack est testé et rejoué sur ce reçu sans nouvelle marche. Local utilise Chromium154/Playwright1.62, CI utilise143/1.57. Le navigateur143 est absent localement et son CDN avait déjà refusé le téléchargement : aucun nouvel essai ni contournement. La cause du rouge initial demeure inconnue ; aucune correction moteur de ce cas n'est revendiquée. Une nouvelle CI du candidat intégré reste nécessaire.

Les preuves locales de ce lot, les trois échecs CI760 et leurs empreintes sont consignés dans `evidence.ci760Final` et `evidence.localFollowup`. Le reçu diagnostic Jun/Asha est conservé séparément avec SHA256 `6c4f94e6cd996b33864e749fcd3862509013f11702935e9e75acd921347f074c`. Les 1 022 identifiants, les trois premières actions680, les91 PR et les21 repères historiques sont inchangés ; seules sept lignes de portée sont actualisées et quatre actions bornées ajoutées. Les deux compteurs réagissent chacun3→2→3, zéro erreur de formule est trouvé et les quatre feuilles sont conservées.

Les dix-neuf classeurs antérieurs sont préservés. Le nouveau classeur dispose de formules recalculées et d’un test de réaction du compteur de régressions à une modification temporaire de statut. Il est inspecté et rendu avant livraison. Les documents de développement et le classeur restent exclus de la distribution jouable.

Cette branche de continuation est destinée à une PR brouillon dépendant de #25. Elle ne fusionne ni #24, ni #25, ni #26, et n’effectue aucun déploiement.
