# V87 — Noisette/Café et Tic/Tac

Date : 20 septembre 2026. Document de travail privé, exclu du dépôt public et du build distribué.

## Source et portée

Le paquet récupéré ATF_Animaux_USS_Conception_Codex_v1 contient une conception, pas des sprites livrés.
Ses fichiers individus_originaux.json, offres_auteurs.json, habitats.json, marchands.json et politique_navigation.json font autorité pour ce lot.
Deux contrats indivisibles : offer-noisette-cafe (260 crédits) et offer-tic-tac (240 crédits), vendeur colony-shelter.
Les quatre identités sont des créations Tantalus définies dans le texte source, pas les animaux personnels de l'utilisateur.
Le comptoir amarré est explicitement autorisé par la disponibilité only_after_real_location_or_docked_counter_exists.

La vérification fraîche des trois conversations ChatGPT connues ne fournit toujours aucun nouveau lien de fichier ; attachments reste vide.
L'onglet ChatGPT identifié reste sur « Un instant… ». Aucun challenge contourné, aucun ZIP inaccessible prétendu récupéré.
La fenêtre de tâches consultable n'atteste pas un inventaire exhaustif de tout le projet ChatGPT.

## Réalisation

- Quatre individus propres, deux dossiers par contrat, acquisition atomique, un débit et un reçu, deux réservations.
- Catalogue 3 / schéma 1 : migration des catalogues 1 et 2, maintien strict des trois anciens achats ; un stock courant absent ne se reconstitue pas gratuitement.
- Groupe transféré dans une seule caisse à deux compartiments ; partenaire référencé au leader canonique, pas deux routes susceptibles de diverger.
- Prise, dépôt, récupération, contrôle d'arrivée et acclimatation communs ; deux ancres distinctes à la résidence.
- Refus des transitions individuelles des duos, y compris après arrivée. Un déplacement public groupé arbitraire ne peut pas remplacer les routines d'enclos.
- Deux parcs installables de capacité 2, aucune propriété ou installation créée par défaut. Total : cinq habitats / sept places / sept individus disponibles.
- Parcs séparés par famille, volumes fermés derrière la voie humaine. Aucun faux collider traversé dans le couloir ; aucun accès libre aux quartiers, portes ou conduits.
- Observation physique sans caresse à travers la paroi, sans bonus de combat, sans modification de besoins en temps réel hors jeu.
- Port seul élargi à 2560 px ; rencontres historiques Moka990 / Brume1435 / Luciole1705 conservées. Accueil animalier maintenu à 1920 px.

## Art et taille

Outil intégré OpenAI ImageGen uniquement. Huit appels : quatre premières planches, un atlas d'équipement, trois nouvelles versions espacées.
Fichiers livrables sélectionnés dans assets/openai/ship-animals/v87 :

- noisette-atlas-v2.png : 32 poses isolées, échelle monde 0.20.
- cafe-atlas.png : 32 poses isolées, échelle 0.17.
- tic-atlas-v2.png : 32 poses isolées, échelle 0.10.
- tac-atlas-v2.png : 32 poses isolées, échelle 0.105.
- enclosure-props.png : fonds de deux parcs, façades transparentes, caisse double et accessoires séparés.

Les PNG sont inchangés ; alpha original conservé. Découpes mesurées sur les composantes alpha >=8, hash et points de contact vérifiés.
Les trois premières variantes avec voisins débordants sont conservées dans docs/references/v87-bonded-rejected, jamais distribuées.
Les prompts complets et mesures se trouvent dans docs/references/v87-bonded-generation.json.
Le rendu découpe les plinthes pour aligner le sol visible des parcs et les pattes à y612, au-dessus du sol humain y624.
Ordre : fond du parc, résidents captifs, grille, résidents libres, Marine ; caisse portée après le Marine.
Les sept individus conservent leur propre atlas et une échelle constante entre poses.

## Preuves et corrections

- Contrôles PNG : 40 tests verts, dont silhouettes entières, absence de voisin, transparence des grilles, échelles et ancres.
- Gestionnaire réel app : refus d'installation si atlas d'enclos absent, mauvais chemin ou chargement incomplet ; deux régressions vertes.
- Relecture indépendante : a trouvé puis fait corriger installation sans atlas et transition individuelle d'un duo résident vers une autre salle.
- Suite complète : 2880 tests, 2879 réussis, zéro échec, un ignoré car l'hôte ne permet pas de créer le lien symbolique requis.
- Lint : 501 modules validés, journal lint-final.log.
- Démarrage navigateur local : écran d'accueil puis REFUGE, quatre étapes, aucune erreur console/réseau.
- Parcours Noisette/Café privé03 : 30 jalons réussis, aucune erreur console/HTTP/runtime, santé 100, un débit de 260, un reçu, deux identités, caisse double suivie sur 2037 frames, réception puis rechargement réussi.
- Parcours Tic/Tac privé01 : 30 jalons réussis, aucune erreur, santé 100, un débit de 240, deux identités après rechargement ; caisse suivie sur 2353 frames et deux corps distincts mesurés sur 495 frames.
- Parcours Noisette/Café sur build public : 30 jalons réussis, 2167 frames de caisse double, 499 frames des deux corps ensemble, aucune erreur. Les contrôles utilisent une fixture initiale explicite puis clavier/souris et RAF normale, sans téléportation après départ.
- Les deux premiers échecs du nouveau harnais concernaient un champ optionnel non protégé puis un point d'approche d'échelle incorrect. Ces erreurs de test ont été corrigées sans retirer les obstacles ni téléporter le joueur.
- Build public : 925 fichiers source, 738 assets ; 914 fichiers distribués. Parité et absence de documents privés relues indépendamment. Snapshot et build sur E:, captures QA sur I:.
- HTTP public local : 94 fichiers critiques conformes au commit, 12 PNG animaliers contrôlés, 251 chemins privés inaccessibles. Cache hors ligne shell-11 : 219 chemins, 25 modules structurels, 12 planches animalières et décors REFUGE validés. Toutes les missions hors ligne ne sont pas certifiées.
- Non-régression Brume sur build public : 26 jalons, 2059 frames de caisse dont 1525 mobiles, aucune erreur, réception et sauvegarde conservées.
- Commit public 4f318e43c2b5ed61d2be644f0cd9588ff8435ed9 poussé uniquement sur main et codex/v86-public-release. Branche privée non poussée.
- Vercel dpl_3TGxcV93XosNkRuAmxF15RrrmojE : READY sur main / SHA exact, build 25.115 secondes, alias aliens-tantalus-frontier.vercel.app affecté sans erreur.
- HTTP production : mêmes 94 fichiers critiques et 251 probes privés validés, octets conformes au commit public. PWA production shell-11 : 219 chemins, aucun document privé mis en cache.
- Journaux Vercel error/fatal du déploiement : aucun résultat dans la fenêtre interrogée de 15 minutes. Ce contrôle ponctuel ne certifie pas l'absence globale de bugs.
- Parcours Tic/Tac directement en production : 30 jalons réussis, zéro erreur, deux identités après rechargement ; une seule caisse mesurée sur 2345 frames dont 1828 mobiles, deux corps sur 494 frames, aucun décalage vertical ni changement de largeur. Observation « au repos » en français confirmée.

Preuves de cette livraison : E:/CodexQA/AliensTantalus/v87-bonded-20260920/public-preparation-report.json ; I:/CodexQA/AliensTantalus/v87-bonded-20260920 contient les journaux, les deux rapports PWA et e2e/private-noisette-03, private-tic-01, public-noisette-01, public-brume-regression-01, production-tic-01.
Les rapports HTTP restent sous privateoutput/v87/public-bonded-local-20260920.json et public-bonded-production-20260920.json dans le workspace nominal C:.
L'ancien public-release-v86/dist (884 fichiers, 590516607 octets) a été déplacé, sans suppression, vers E:/CodexQA/AliensTantalus/v87-bonded-20260920/previous-public-dist pour libérer C:.

## Limites encore ouvertes

Ce lot ne termine ni le projet global ni toutes les promesses V1–V87.
Neuf individus du paquet ne sont pas encore intégrés : Rivet, Suie, Boulon, Sable, M-17, ARC-4, Bip, Clé, Mica.
Les 178 clips proposés dans le manifeste source ne sont pas certifiés réalisés ; ce manifeste ne livre pas de bible de clips lapins/rats.
Chaque nouvelle planche expose marche/bond, repos debout, assise, repas, sommeil et toilette. La routine active utilise marche/bond, repos, repas et sommeil ; assise et toilette restent des clips disponibles, pas de nouvelles activités persistantes certifiées.
Aucune certification de fluidité ou de fidélité 1:1 à une planche officielle n'est déclarée.
Escalade des rats non implémentée : aucun support invisible ou escalade fictive. Animation humaine de portage dédiée encore manquante.
La quête source « Deux places, pas une » inspire le contrat physique mais n'est pas marquée comme quête scénarisée intégralement produite.
Pension/restitution, totalité des routines/soins/familles, campagne PALISADE et paquet dense joueur demeurent des chantiers distincts.
