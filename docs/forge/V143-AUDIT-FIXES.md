# V143 — correctifs après audit et continuation profils/commandes

Base cumulative : V142 `bef6c3036519b4a24d8a489a47745f0f6ab8280f`, descendant du main V141 `cf3d35422ebcb4e30d662ec6b3e2f4c52b5e54e8`. Les correctifs de la PR 8 sont conservés ; aucune fusion automatique.

## Profils ouverts dans plusieurs onglets

Le SaveSystem compare les octets du profil avec ceux qu'il a effectivement chargés ou écrits. Un enregistrement, import, remplacement, fichier devenu illisible ou effacement extérieur ne peut plus être écrasé silencieusement par une session devenue ancienne. La comparaison ne repose pas sur l'horodatage. Lire la liste des profils ne vaut pas acceptation d'une nouvelle sauvegarde.

Le contrôle est effectué avant une écriture ordinaire, lors d'un événement `storage` concernant l'emplacement actif et au retour du focus. Les autres emplacements, le marqueur du profil sélectionné et les projets Forge ne provoquent pas de conflit artificiel. Les commandes de remplacement explicites restent distinctes.

Lorsqu'un conflit est détecté, l'application conserve une copie exportable de la session, incluant son checkpoint de mission ou sa position dans le vaisseau lorsqu'elle en est propriétaire. Elle invalide les propriétaires des callbacks avant de fermer les scènes. Elle ouvre ensuite les réglages avec les sauvegardes automatiques suspendues. `EXPORTER CETTE SESSION` et l'export du fichier original permettent de conserver séparément les deux versions. Un chargement ou import explicite est requis pour reprendre ; aucun assemblage automatique des deux parties n'est tenté.

**Limite : cette protection est optimiste.** localStorage n'offre pas de comparaison-écriture atomique entre processus. Le contrôle bloque les sessions observées comme anciennes et les changements séquentiels ; il ne promet pas un verrou distribué pour deux écritures parfaitement simultanées. Aucun protocole serveur ou compte réel n'est modifié.

Les données sérialisées après migration sont également validées avant leur écriture, y compris pour l'import conditionnel d'un profil inactif. Une écriture réussie ne doit pas produire une sauvegarde que le même lecteur refuserait au prochain lancement. Les erreurs de quota, lecture, sérialisation et suppression conservent le fichier précédent et ne publient pas un faux changement de profil. Le choix d'un fichier de plus de 16 Mio est refusé avant sa lecture dans l'interface.

## Commandes suspendues et coopération

Les nouvelles pressions clavier, tactiles et manette ne sont plus conservées pour un déclenchement ultérieur pendant le chargement des atlas. Les commandes tactiles d'une scène arrêtée ou en pause ne peuvent pas préparer un tir ou un déplacement pour la reprise. Les relâchements restent acceptés.

La manette est neutralisée pendant le chargement des castes et pour un acteur à terre. Elle doit revenir à une position neutre avant de réarmer ses entrées. Désactiver J2 libère uniquement ses touches, sa demande de saut et sa visée ; les entrées J1 ne sont pas effacées. Réactiver J2 ne rejoue pas un déplacement antérieur. Les actions de déplacement restent utilisables pour interrompre les travaux de terrain actifs.

## CQC et sauvegardes incompatibles — continuation précédente

La commande CQC utilise le contrat de l'arme de contact équipée, notamment la portée, les dégâts, la temporisation et l'étourdissement du bâton. Les acteurs dormants ne captent pas une mêlée contextuelle. Les chemins Neuro, véhicules et opérations spéciales restent distincts.

Les imports de schéma futur, mal formé, trop profond ou trop volumineux et les clés de contrôle de prototype sont refusés avant migration. Les limites sont 16 Mio UTF-8, 64 niveaux et 250 000 valeurs/structures. Le schéma de persistance reste 52, distinct de la version applicative 143.0.0.

## Cache, MIRE et publication

Le service worker ne traite que des ressources statiques explicitement admises de même origine. Requêtes authentifiées, API, paramètres, réponses privées/no-store, redirections et faux médias HTML restent hors cache. Le secours consulte uniquement le cache courant. Le nettoyage ne vise que les anciens caches `atf-`, sans toucher aux sauvegardes ni aux projets Forge. Les médias optionnels sont bornés à 256 entrées et les lots à 12 URLs. Une installation incomplète préserve la version précédente.

La mise à jour attend la fermeture des anciens onglets : pas de prise de contrôle forcée en cours d'opération. Après intégration, fermer les onglets du jeu puis rouvrir. Ne jamais effacer les données du site pour forcer cette mise à jour.

MIRE conserve les identifiants et paires. Douze sources ont une association explicite à un lieu existant, dont Aliens/LV-426, Resurrection/Auriga, Prometheus/LV-223 et Isolation/Sevastopol. Les 206 fiches comprennent 92 adaptations de cadre et 114 simulations originales. Ni le casting, ni la géométrie, ni les objectifs procéduraux ne constituent une reconstitution historique 1:1. Une opération déjà engagée conserve son monde, son manifeste et ses dépenses.

Le build inscrit le commit source, l'identifiant de publication, le cache et le manifeste SHA-256 des fichiers distribués. L'empreinte est un contrôle d'intégrité, pas une signature de confiance. Aucune dépendance n'est ajoutée par la continuation profils/commandes.

## Vérifications reproductibles

```sh
npm ci --ignore-scripts
node --test scripts/verify-save-lifecycle-v143.mjs scripts/verify-player-runtime-v124.mjs
npm run test:audit
npm run test:all
npm run check
npm run build
npm run check:built
```

La continuation ajoute 21 tests de sauvegarde et 5 tests de commandes aux fichiers déjà déclarés. Les tests de commandes reproduisaient cinq échecs avant le correctif. Les suites se chevauchent avec `test:all` : leurs nombres ne doivent pas être additionnés.

La CI sans filtres de chemins récupère les médias complets, teste les sources, construit et contrôle le paquet. Le parcours tactique existant reste intact. Un nouveau parcours `scripts/qa-save-profiles-v144.py` ouvre deux onglets Chromium sur le véritable paquet, introduit ses profils de test par le sélecteur de fichier, démarre le vaisseau, vérifie le conflit, les exports séparés et le rechargement explicite. Les évaluations navigateur lisent l'état sans l'injecter. Les scénarios restent isolés des données personnelles.

Les résultats d'exécution et les empreintes d'artefacts doivent être consultés dans la PR pour le commit exact : la présence d'un script n'en prouve pas la réussite. Les contrôles worker utilisent des réponses HTTP synthétiques, distinctement du parcours du jeu.

## Limites de livraison

Les copies issues des artefacts Forge possèdent des médias partiels ; un échec local ENOENT ne vaut pas défaut du jeu. Le navigateur local peut refuser la navigation par politique : aucun contournement n'est requis. La recette complète doit être vérifiée sur les médias complets en CI.

Cette continuation ne termine pas les campagnes partielles, les sprites et animations 1:1, toutes les IA spécifiques ou la Forge narrative. Elle ne valide pas les politiques d'une base cloud, une manette ou un appareil mobile physique. Aucun effacement de données personnelles, déploiement volontaire, changement d'offre ni modification des protections de branche n'est effectué.
