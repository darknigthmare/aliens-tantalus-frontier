# Colonie et équipage — images et intégration du 16 novembre 2026

Ce lot prolonge la demande du propriétaire de continuer le même travail et de générer les images manquantes. Il part du commit `f5ae9de64c36af1de6eda11f76902e8ba4e8412f` de la PR #49. Les anciennes décisions Q78/Q79 décrivent la phase de production en primitives ; ces primitives restent le secours de chargement.

## Livrable

**21 PNG utilisés par le jeu**, soit 51 082 971 octets : les 18 emplacements existants de `colony-crew-slots-v188.js` et les trois habitants nommés de Port-Méridien. Les 22 images du précédent lot insertion/soutes sont conservées. La PR contient ainsi 43 nouveaux PNG de jeu sur ces deux lots ; ce nombre ne compte ni les planches de contrôle ni les archives récupérées.

| Groupe | Images | Utilisation |
| --- | --- | --- |
| Habitants | Tomas Wren, Lucia Ferro, Adèle Sarrazin | Portraits de dialogue et vignettes des cinématiques ; trois fichiers RGBA de 1254 × 1254 |
| Colonie | Entrepôt du quai, processeur, dépistage, culte, carnets de Wren, balise, murs | Sept cartes panoramiques, affichées dans les scènes existantes |
| Quêtes de l'équipage | Sentinelle, M577, enregistreur de vol, carte de route, pas de tir, liste des colons, plaques, directive, registre, réacteur, conduits | Onze cartes panoramiques dans les quêtes déjà raccordées |

Les cartes sont des PNG RGB opaques d'environ 1890 × 832 pixels, adaptés au cadre de 640 × 280 par un recadrage uniforme borné. Les portraits conservent leurs proportions et leur transparence dans les cadres de dialogue de 384 pixels et de cinématique de 80 pixels. Les sorties sélectionnées de `image_gen.imagegen` ont été copiées octet pour octet, sans détourage, recoloration ni réencodage après génération. Une seconde génération de Wren a clarifié ses bandes réfléchissantes ; la première version n'est pas livrée au moteur.

Les fichiers, dimensions, empreintes, prompts complets et références sont dans [COLONY_ART_PROVENANCE_20261116.json](COLONY_ART_PROVENANCE_20261116.json). Les références effectivement fournies au générateur pour la sentinelle et le M577 sont distinguées des images simplement examinées pour établir le style. Les portraits sont des adaptations originales du projet ; leurs détails physiques restent marqués **[PROPOSÉ]** dans la bible.

## Comportement corrigé

Le dialogue de scène créait son chargeur et dessinait une primitive, mais ne demandait jamais l'image. Le fichier PNG seul ne pouvait donc pas apparaître. Le dialogue appelle maintenant le chargement du seul emplacement courant et s'abonne à son résultat. Le rappel redessine uniquement l'image : il ne déclenche aucun choix, ne déplace pas le focus et ne réannonce pas le paragraphe. Chaque changement de carte ou fermeture annule l'abonnement précédent ; un rappel tardif ne peut pas rétablir une ancienne scène. Les erreurs conservent la primitive et ne provoquent pas de boucle de requêtes.

Les portraits passent par les caches existants des dialogues et des cinématiques. La résolution des noms conserve les accents, alias et identifiants antérieurs. Les sources de l'équipage gardent la priorité ; un portrait de colonie n'est admis qu'avec son chemin et ses dimensions attendus. Les primitives de Wren, Ferro et Sarrazin restent visibles pendant le chargement et après une erreur. La garde CSS des initiales exclut désormais ces primitives : les lettres ne les recouvrent plus pendant l'attente. Les seuls portraits de colonie utilisent le rééchantillonnage CSS normal ; le réglage pixelisé des sprites de l'équipage reste inchangé.

Le service worker admet le nouveau module et les trois portraits ; les dix-huit cartes restent chargées à la demande. Leurs dix-huit chemins exacts sont admis dans le cache runtime existant après consultation, ce qui permet leur relecture hors ligne tant qu'ils y sont conservés. Aucun préfixe général n'est élargi et aucune carte n'est ajoutée au précache. Les gardes de méthode, origine, en-têtes, confidentialité et type de réponse restent actives. Le nom du cache source devient `atf-v143-colony-art-20261116`.

## Les preuves narratives restent du texte et de la géométrie Canvas

La génération fournit le décor, les objets et les surfaces vierges. Les sept cartes ci-dessous reçoivent leurs informations dans le code, en français et en anglais, avec le même rendu exact sur l'image et sur la primitive de secours.

| Carte | Données conservées |
| --- | --- |
| Carnets de Wren | Deux bordereaux QZ17, matériel de forage, heures notées sans inventer d'horaires, second bordereau sous scellé, priorité fret |
| Enregistreur Kappa | 900 m, créneau de 22 minutes entre 02:14 et 02:36 |
| Route des fermes | Port, fermes, rivière, pont, sentier de maintenance et contacts sur la crête |
| Liste des colons | Famille Okonjo, ferme 12, trois personnes, trois appels retenus six jours derrière le fret puis effacés |
| Directive de BISHOP-9 | Intitulé de préservation et ligne masquée ; aucun contenu secret inventé |
| Registre de Reyes | 13:58 : trois signaux civils coupés du groupe ; 14:01 : ordre de fermer l'accès ; 14:02 : charge de Reyes |
| Réacteur | Charge relative de 100 à 104 %, chaque nuit entre 01:00 et 05:00 |

Les cinq autres noms d'Echo-8 ne sont pas inventés dans l'image du pas de tir. Dario Kessler reste le seul nom établi par le contenu actuel.

## Contrôles des images et de leur affichage

Les reçus détaillés sont réunis dans [COLONY_ART_RENDER_RECEIPT_20261116.json](COLONY_ART_RENDER_RECEIPT_20261116.json). Les planches [scènes et quêtes](COLONY_ART_OVERVIEW_20261116.png) et [portraits](COLONY_PORTRAITS_OVERVIEW_20261116.png) présentent le résultat au format réellement utilisé.

- **54 captures de cartes** : 18 primitives, 18 versions françaises et 18 anglaises. Les dix-huit PNG sont effectivement dessinés, les recadrages sont bornés, les sorties sont opaques et aucune exception n'est relevée. Les callbacks ne déplacent pas le focus et ne rejouent pas les choix.
- **6 captures de cinématiques** : primitive puis portrait pour chacun des trois habitants, avec la fonction de dessin de production et des temps de plan fixes. Les portraits utilisent le cadre réel `(74, 540, 80, 80)` ; aucune exception n'est relevée.
- Les trois portraits ont été examinés à leur taille native, à 384 pixels et à 80 pixels. La planche présente aussi des simulations approximatives de déficiences de perception des couleurs. Ces matrices sRGB sont réservées au contrôle ; elles ne modifient ni les PNG livrés ni le filtre du jeu.
- Le contrôle local des bandes de Wren a motivé la seconde génération : le minimum mesuré sur les trois simulations passe de 1,43 à 5,29. Les mesures de Ferro (2,58) et Sarrazin (1,87) concernent de petites zones texturées ; elles ne constituent pas une certification de contraste de tous les contours. Les silhouettes, coiffures et signes vestimentaires restent également distincts.

Ces 60 captures utilisent **Canvas natif dans un hôte déclaré, pas Chromium**. Pour les cartes, le DOM et l'hôte Image sont des doubles explicites ; Pillow décode les PNG en pixels RGBA pour contourner une erreur du décodeur Image de cet environnement. Les fichiers de production restent intacts. Les portraits sont décodés directement par Canvas natif. Les polices peuvent varier par rapport au navigateur. Ce contrôle ne qualifie pas une partie complète, la mise en page CSS ou le repli mobile.

## Régressions et publication

- Le groupe portraits, primitives, cadrages de l'équipage et cinématiques passe **28/28** tests avec les trois fichiers finaux.
- Le groupe colonie, scènes de contenu et fins de l'Acte V passe **54/54** tests. Il couvre notamment le chargement différé, les erreurs, les rappels tardifs, la fermeture et les textes FR/EN.
- Le groupe ciblé du service worker passe **35/35** tests. Trois nouveaux cas couvrent la relecture des dix-huit cartes après une interruption réseau simulée, quatorze types de requêtes refusées et sept réponses invalides retirant une ancienne copie. Le vrai worker s'exécute dans son hôte VM existant ; le réseau et Cache Storage sont des doubles déclarés.
- Les empreintes de succession sont actualisées pour les seuls fichiers réellement modifiés ; les empreintes historiques restent inchangées.
- La suite complète de priorités passe **527/527** tests, sans cas ignoré. Le contrôle de source passe avec 3400 fichiers et 1510 assets. Le build et son contrôle passent avec **2144 fichiers et 723 entrées de cache** ; le schéma de sauvegarde reste 52.
- Les vingt et un PNG du build sont identiques octet pour octet à leurs sources, soit 51 082 971 octets. Les documents de contrôle et les archives récupérées sont absents de la distribution. Ce build est réalisé avant le commit définitif ; le reçu distingue le SHA local utilisé dans son identifiant de l'arbre de travail contenant les derniers ajustements effectivement contrôlés.

Sur la base `f5ae9de`, les vrais parcours Chromium de la CI ont déjà réussi pour l'audio (19/19), C-12/Cocon (34/34) et la continuité des épreuves, dont Broodstorm (47/47). Ces résultats ne sont pas attribués aux nouvelles images. La même base présente des échecs dans les anciens pilotes du titre, de l'ascenseur, de QZ18, de Cocon V158 et des PNJ Forge. Les corrections de ces pilotes et leurs preuves sont décrites dans le reçu de continuation ; leur prochain passage en CI reste distinct des contrôles natifs ci-dessus.

### Cinq pilotes QA adaptés au jeu actuel

| Pilote | Correction et preuve locale |
| --- | --- |
| Titre V163 | Le canvas des effets planétaires V188 est observé séparément avec un contrat exact ; toutes les autres couches restent strictement contrôlées. 22 cas positifs et 14 mutations invalides vérifiés. |
| Ascenseur V163 | Le scénario de midi vérifie désormais l'espace dégagé par les postes V188 de Tamsin et Pablo. Départ déclaré dans la vraie cabine, planning et PNJ inchangés, quatre phases, un transfert, puis contrôle rendu à 30 et 60 Hz. Les douze helpers communs restent identiques. |
| QZ18 V160 et Cocon V158 | Le pilote utilise le bouton public PASSER lorsque l'insertion le présente, puis attend le contrôle réel. Budget total inchangé de 30 ou 45 secondes ; 29 cas de qualification. Les 28 assertions QZ18 et le parcours Cocon hors préparation restent identiques. |
| PNJ Forge V158 | Après reprise, attente de l'admission native de l'entrée, du PNJ `b-npc` et du focus, puis une seule frappe E dans le budget de 30 secondes. Les 21 assertions restent identiques ; six cas de budget et huit états natifs sont qualifiés. |

Les suites natives associées passent **95/95** tests (66 puis 29). Elles utilisent des hôtes déclarés et ne remplacent pas la prochaine exécution Chromium. Pour Forge, le probe démontre qu'une frappe peut expirer pendant un chargement et fonctionner après admission ; l'ancien artefact CI ne contient pas les flags à l'instant de la frappe. Cette explication de l'échec CI reste donc **inférée**. Aucun des cinq changements ne modifie le moteur du jeu, les sauvegardes, les récompenses ou les délais admissibles.

## Périmètre restant

Ce lot complète les vingt et un emplacements identifiés ci-dessus. Il ne crée pas les niveaux dédiés de la colonie, les animations physiques de ses habitants, les poses supplémentaires de l'équipage, les six cartes distinctes du lot Asphodèle, ni tout l'art manquant des autres campagnes. Les missions et quêtes restent raccordées aux parcours qui existaient avant ce lot.
