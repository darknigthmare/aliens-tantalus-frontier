# Xeno Trials — protocoles ARBITER et animations V191

Ce lot part du commit public `07f9525c18c9b55cf21ae93fe758209f64ed8ff4`. Il remplit deux manques après l’enquête AB-40 : les quatre arènes ne possédaient pas leurs propres programmes de horde et d’objectifs, et aucun spécial du suivi des dix actions ne disposait encore de poses dessinées.

## Quarante dossiers réellement jouables

Les archives contiennent vingt hordes et vingt opérations, réparties entre la chambre d’arbitrage, le transit des spécimens, la galerie des mandataires et les archives sous scellés. Chaque lieu possède cinq pressions de horde, puis une escorte, un relais, une purge, des balises et une extraction. Ce sont quarante programmes, pas quarante nouveaux niveaux ou illustrations. Les quatre atlas et douze plans V190 restent inchangés.

Les contacts ordinaires possèdent 15 à 35 PV, trois à huit adversaires pouvant être présents. Les quatre hordes de niveau cinq ajoutent une finale annoncée : Chrysalis, Xeno-Brute, Smasher et Defender. Les PV de ces contacts majeurs sont distingués des PV des troupes. Les vingt opérations reprennent les vrais contrôleurs de chariot, charge, purge, synchronisation et transport V188 ; leurs pressions ne comportent pas de finale majeure cachée.

Quatre profils de machines sont ajoutés exclusivement pour ces opérations : vapeur, cryogénie, débris et arc électrique. Ils utilisent les avertissements, collisions, dégâts et validations de checkpoint existants. Ces dangers physiques restent distincts des événements d’arrière-plan V190, qui ne causent aucun dégât. Les tableaux historiques de 80 hordes, 40 opérations et 40 dangers restent inchangés ; les getters admettent les ajouts exacts, portant les catalogues jouables à 100 hordes, 60 opérations et 44 profils de danger.

Le nouveau répertoire **ARCHIVES ARBITER** consulte les six retours ordonnés et normalisés de la campagne. Avant leur extraction, ses quarante cartes restent consultables et verrouillées. La transaction de création refuse les nouveaux IDs sans ces preuves, avant toute consommation de numéro ou changement économique. Les anciens programmes restent accessibles comme auparavant.

Le répertoire est un état d’interface : les tickets conservent leur branche native `horde` ou `operations`, leur graine, leur stage et leur identité. Les reprises n’ont donc pas besoin d’un nouveau schéma. Les pages restent bornées à douze programmes ; les quarante dossiers occupent quatre pages. Le roster conserve ses cinq pages de quarante pour 189 identités.

Il n’y a aucun coût d’entrée ajouté. Les primes de première validation restent uniques ; une partie rejouée conserve les règles ordinaires de gain de match, sans payer une seconde prime de programme. Ouvrir une carte, lire le dossier ou changer de filtre ne crée aucun ticket ni récompense.

## Deux lots de quarante poses

Defender, Chrysalis, Smasher et Xeno-Brute reçoivent chacun dix poses de combat : attente, deux appuis, préparation/contact/récupération du coup primaire, garde, recul, chute et corps couché. Les poses respectent les quatre références visuelles admises, dont le facing natif négatif du Brute. Leurs attaques, collisions, HP, dégâts et stature restent possédés par le moteur.

Warrior, Runner, Prowler et Spitter reçoivent chacun dix poses de spécial : trois anticipations, trois contacts et quatre récupérations. Warrior utilise le fouet caudal ; Runner la ruée rasante existante ; seul le Prowler possède la véritable impulsion aérienne du style `leap` ; Spitter dessine la posture de projection sans incorporer son projectile dans le corps. La sélection suit l’attaque réellement acceptée et ses phases natives. Les portions incompatibles avec l’état physique conservent le fallback ; aucun dessin ne crée une impulsion ou un dégât supplémentaire.

Les huit nouveaux PNG apportent **80 poses et 11 618 259 octets**. Les quatre combats et deux spéciaux utilisent un canvas de 1983 × 793 ; les spéciaux Warrior et Spitter utilisent leurs dimensions réellement générées de 1774 × 887. Aucun bitmap n’a été redimensionné ou nettoyé par un script. Les seuils d’admission précédents restent inchangés : silhouette à alpha 16, supports à 128, bord de coupe à 1 maximum et masse d’alpha faible inférieure à 0,008.

Le suivi V191 conserve le rapport V189 comme archive. Sur ses dix actions, il compte 21 profils avec des gestes dessinés, douze KO au sol dessinés, quatre spéciaux dessinés et 240 poses admises, dont 200 propres aux atlas Trials. Les 27 poses de capture V163 restent hors de ce décompte. Aucun de ces nombres ne signifie que les 189 movesets sont complets ; `fullyAnimated` et `canonExact` restent nuls.

Les [dossiers combat](sprite-combat-production-v191.json), [spécial](sprite-special-production-v191.json) et [couverture](animation-coverage-v191.json) distinguent source, génération, mesures, admission et observation réelle. Les planches Canvas ne sont pas des victoires de partie. Les anciens PNG et plaques natives conservent leurs octets.

## Préparations, preuves et intégration

La priorité reste : capture et présentation actives, réaction native, pose dessinée admissible puis fallback existant. Le runtime ne joint plus un tampon de préparation mesh V163 quand le dessin réellement soumis provient de V191. Le nouveau reçu contient sa propre image, son SHA, son crop, sa phase, son attaque et le tick de rendu ; l’outil d’observation peut reconnaître cette preuve sous un type distinct. Aucun ancien verdict de mesh n’est transféré au nouveau dessin.

Les captures actives V163 gardent leur chorégraphie et leurs gardes. Les contrôleurs d’acquisition, entrées, délais, pause et horloges des outils d’observation restent inchangés. Le parcours Chromium final a observé le témoin indépendant du Prowler sous son nouveau type, en conservant les gardes natives et la priorité des captures V163.

## Vérification et limites

Les preuves sont conservées hors dépôt dans `/workspace/tantalus-inventory/reprise-v191/`. La recette distingue profils réellement joués et exportés, fixtures de crédits, tests Node sous doublures d’hôte, captures de composition et parties natives. Elle observe les poses effectivement dessinées, sans assimiler toutes les poses admises à des poses rencontrées en partie.

La suite officielle de **268 fichiers uniques** termine avec **5 551 tests réussis, zéro échec et une fixture optionnelle ignorée**. Les 54 chemins du gel sont inchangés. L’audit V191 vérifie 27 successeurs, 26 nouvelles entrées et douze plaques ; sa relecture indépendante confirme également cinq blocs historiques conservés et aucune reprise de verdict antérieur.

La recette Chromium finale compte **78 contrôles et 40 captures** : seize screenshots de l’interface et vingt-quatre copies des pixels Canvas des trois phases par sujet. Ses 611 sources sont inchangées et ses 24 chemins partagés correspondent au gel de la suite globale. Les 26 réponses HTTP vérifiées comprennent les huit nouveaux PNG. Elle ne signale aucune erreur JavaScript, HTTP ou de requête.

Cette recette réimporte le vrai profil de six retours acquis et exporté pendant la préparation de campagne ; elle ne prétend pas avoir rejoué ces six missions dans la passe finale. Elle gagne une horde de douze contacts et deux opérations, vérifie trois paiements uniques après rechargement et restaure exactement le checkpoint d’escorte en pause. Elle observe un contact de vapeur de six PV puis l’esquive d’une fenêtre complète, ainsi que les contrôles tactiles, le mouvement réduit et les répertoires FR/EN. Les vingt opérations sous doublures d’hôte Node produisent dix-sept victoires et trois défaites par KO naturel, distinctes de ces trois victoires navigateur.

Les reçus natifs ont montré **77 poses distinctes sur les 80 admises** : les quarante poses de spécial et trente-sept de combat. Seuls les appuis `walk-b` de Chrysalis, Defender et Xeno-Brute n’ont pas été rencontrés. Les quatre sujets de combat montrent garde, coup en trois phases, recul après dégâts réels, chute et corps au sol ; les quatre spéciaux montrent leurs phases, dont le vol physique du Prowler. Les duels d’animation s’arrêtent après un KO de première manche ou une séquence partielle, puis sont abandonnés par l’interface ; ils ne sont pas comptés comme huit victoires supplémentaires.

L’admission source passe avec 2 636 fichiers, 1 455 assets et zéro document privé. Le build vérifié contient 2 056 fichiers et 664 entrées shell ; son estampille de commit est régénérée après le commit public et consignée dans le reçu externe. Le schéma principal reste 52 et le schéma des tickets reste 96. Les descriptions et traductions restent des adaptations originales du projet, sans certification canonique 1:1.

Le reçu du commit public, le build estampillé et le statut réel du site sont consignés séparément. Le délai de déploiement Vercel reçu précédemment reste respecté, sans requête de création avant son expiration ni modification de facturation ou de protection.

Restent ouverts les movesets complets des autres identités, les attaques aériennes dessinées, les supers, les chorégraphies intégrales et les références primaires mesurées pour une fidélité 1:1.
