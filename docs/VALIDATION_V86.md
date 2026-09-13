# Validation V86 — objets posables, premier périmètre

Date : 13 septembre 2026. Branche locale : `codex/v52-physical-worlds`.

Cette passe prolonge la conversation « Créer items gameplay posables ». L’export disponible est explicitement tronqué à 20 000 caractères ; ni la conversation entière ni les quarante familles proposées ne sont déclarées terminées. Contrats et réserves : `V86_PLACEABLES_RUNTIME.md` et `V86_PLACEABLE_ASSET_AUDIT.md`.

## Livraison vérifiée

Quatre familles existantes, douze IDs explicitement autorisés : sentinelle portable, cryomine, piège électrochoc et quarantaine portable. Elles ont des instances identifiables, un aperçu soumis au terrain, une installation/reprise temporisée et un stock physique. J1 et J2 réservent des objets distincts. Replier puis reposer conserve PV, munitions, armement, batterie et identité : pas de réparation, de recharge ou de nouvel objet implicite.

La sentinelle neuve reçoit 150 coups, tire à 5 coups/s dans un secteur limité, avec LOS, vrais projectiles et propriétaire. Des projectiles hostiles et attaques de proximité dédiées peuvent endommager le matériel. Les tests de combat couvrent notamment la cadence à 30/60/120 Hz, les obstacles, les impacts balayés et la destruction. Ce matériel ne constitue pas encore une barricade physique bloquant le passage.

## Défauts identifiés et corrigés

- J2 était sélectionné par erreur au démarrage parce que les deux acteurs absents étaient comparés comme égaux. J1 reste maintenant le choix initial.
- Les boîtiers consommés encore au sol étaient absents de la liste de récupération. Ils sont proposés si non détruits, à portée et visibles, sans être réarmés.
- Une exception de stockage lors d’un événement persistant pouvait interrompre la boucle de jeu. Nouveau checkpoint préparé sur clone, publication après écriture seulement, ancien snapshot et octets conservés en cas d’échec ; boucle RAF poursuivie et avertissement français limité à dix secondes. Les chemins séparés de fin de mission et d’archives ne sont pas certifiés par cette correction.
- La sauvegarde manuelle de la barre principale était invisible en mission. Un bouton de pause partage désormais exactement son handler, avec refus des mauvais propriétaires, des profils en récupération, de Forge et de la création en cours. Aucun rendu du dock ne sauvegarde.
- Le dock interceptait les tirs tactiles en recouvrant le canvas, même sans équipement. Il occupe maintenant une rangée distincte, bornée et défilable. Sans équipement, il disparaît hors pause. Le test de combat inchangé passe après correction.
- Le harnais des sous-titres pouvait attendre indéfiniment le boot dans un onglet headless resté en arrière-plan. Il met désormais son propre onglet au premier plan, comme les autres parcours ; les assertions de disposition restent intactes.

## Tests et construction

Dernière suite complète `npm test` : **2 165 tests, 2 164 réussites, zéro échec, un test ignoré** pour l’autorisation Windows de création de liens symboliques. `npm run lint` : **430 modules**. Le build sur C réussit en **86.0.0**, avec **3 450 entrées de catalogue**. Ces entrées ne sont pas autant de sprites dédiés.

La suite `npm run qa` inclut également les contrôles d’art V64–V82, inventaires, manifestes, audio et BIOFORGE. Le journal final est conservé hors dépôt sous `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/qa-v86-release-full-final.log`. Un premier lancement a rencontré `ModuleNotFoundError: PIL` avec le Python système ; le lanceur `.qa-bin-v81/py.cmd` déjà présent dirige la validation vers le runtime local équipé de Pillow 12.3.0, sans installation système.

Un essai de reconstruction a utilisé par erreur la variable `BUILD_OUTPUT_DIR`, non reconnue, et saturé D avec un `dist` partiel. Seul ce répertoire généré a été supprimé après vérification de son chemin exact et de l’absence de jonction. La reconstruction utilise `ATF_BUILD_OUTPUT` vers `build-v86` sur C. Aucun fichier source ni ancienne plaque en cours de production n’a été nettoyé.

## Navigateur réel sur le build local

Chrome headless isolé, HTTP `127.0.0.1:4188`, aucun profil personnel ni sauvegarde utilisateur modifié. Le CLI agent-browser étant indisponible, les harnais CDP du projet ont été exécutés en série. Cinq rapports réussis, aucune erreur JavaScript/HTTP, **23 captures et cinq rapports archivés avec comparaison SHA-256** dans `references/v86-release-qa/` :

- `placeables-built/` : sélection réelle, approche au clavier avec saut, aperçu bitmap, déplacement annulant la pose sans débit, pause gelant le timer, installation, repli/repose du même objet à **37 PV / 0 munition**, sauvegarde par le bouton de pause, rechargement de page, reprise sans duplication, réservations J1/J2 distinctes. Mobile 390 × 844 : boutons d’au moins 44 px, pas de débordement horizontal ni recouvrement du canvas. Cinq captures.
- `combat-built/` : vraie visée clavier J1/J2, souris maintenue puis relâchée, tir tactile paysage et remise à zéro des touches lors de la pause. Quatre captures.
- `onboarding-built/` : création, annulation, réveil physique, marche cryo/CIC/briefing, dialogues, reprise et refus quota sans perte de campagne. Six captures.
- `captions-built/` : cinq tailles de 320 × 568 à 1280 × 720, sous-titres hors du terrain et des touches, long dialogue défilable. Cinq captures.
- `crew-built/` : quatre identités de recrues, trois contrats d’armes, passage IA/J2/IA, tirs, recharge, soin et état persistant. Uniforme partagé explicitement déclaré. Trois captures.

Limites de preuve : le scénario posables emploie une sauvegarde de test, retire le groupe initial d’ennemis une fois par lancement/reprise pour isoler l’interface et applique une seule fixture PV37/ammo0 à une sentinelle réellement posée. Il ne neutralise ni les obstacles ni les alliés et n’appelle pas les méthodes métier par JavaScript. Le combat est testé séparément. Ce scénario navigateur ne certifie pas les boîtiers `spent` ni le refus quota : ces cas ont leurs tests UI/état et vrais SaveSystem/GameEngine dédiés. Aucun parcours ne prouve une campagne complète ou une manette physique.

Les captures finale desktop/mobile ont été relues visuellement. La sentinelle garde une vue trois-quarts d’inventaire : son ancrage corrigé n’est pas une nouvelle perspective orthographique.

## ImageGen et limites artistiques

Choix de l’utilisateur respecté : **outil intégré uniquement, aucun appel API/CLI facturé**. Une plaque B03 originale de barricade mobile a réellement été générée : 1536 × 1024 RGBA, huit cellules, 65,089 % de pixels totalement transparents. Sa copie brute et le prompt sont dans `references/v86-art-candidates/`, avec SHA-256 et statut **CANDIDATE_NOT_RUNTIME**.

Une tentative d’édition intégrée a échoué sur la lecture Windows de référence (`apply deny-read ACLs`). Aucun résultat d’édition n’est inventé, aucun fallback API utilisé. Les quatre PNG d’équipements déjà existants sont réutilisés, pas comptés comme quatre nouvelles images. B03 n’a encore ni transport/poussée jouable, ni collision dédiée, ni animation certifiée. Les animations complètes de pose, réparation, recharge et destruction restent à produire.

## Gate et publication

Le gate V86 exige un SHA de commit explicite, compare **57 fichiers critiques et 16 assets exacts**, les MIME, la version et le cache `atf-v86-physical-placeables-shell-1`. Il contrôle également que les sources et preuves V81–V86 sont exclues du site. Ses neuf tests unitaires passent. Le contrôle HTTP local a réussi contre **`9b6815c06ea01b680415abc16d65861bc63f226c`** : 57 fichiers critiques et 16 assets conformes, version/cache corrects et **213 chemins de preuves répondant 404**. Rapport `references/v86-release-qa/local-build-http.json`, cible `local-build`, pas production Vercel. La dernière suite `npm run qa` a également terminé avec succès. Les deux espaces Markdown et la fin du verbatim ChatGPT sont volontairement préservés ; le contrôle de whitespace des autres fichiers est propre.

**Aucun push GitHub ni déploiement Vercel V86 effectué à ce stade.** L’utilisateur a explicitement refusé de publier l’historique actuel avec extraits ChatGPT, captures et rapports QA. Une publication distincte du jeu, assainie et sans parentage avec les nouveaux commits privés, est donc à préparer depuis le dernier commit déjà public. Le commit local V86 et ses preuves restent locaux. Une exclusion du build ne rendrait pas les documents confidentiels si leur historique était poussé dans un dépôt public.

La matrice des 26 conversations reste **0 DONE / 18 PARTIAL / 8 MISSING**. Les ennemis restent **14/571 intégrés et 557 non intégrés**. Ni fidélité graphique 1:1, ni toutes les promesses réalisées, ni jeu commercial complet ne sont revendiqués.
