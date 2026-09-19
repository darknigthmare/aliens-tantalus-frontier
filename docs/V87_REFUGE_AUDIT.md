# REFUGE V87 — pièce personnelle jouable et publication séparée

Date : 19 septembre 2026. Ce rapport est privé ; il ne fait pas partie du jeu public.

## Source réellement disponible

Contrat lu : conversation « Conception pièce hommage chat », réponse complète conservée dans `privateoutput/v87/memorial-2-1.json` du dossier de tâche. Cette passe implémente le texte, pas un ZIP prétendument reçu. Les trois conversations V87 ont été relues : aucun message nouveau, `attachments=[]`, `hasMore=false`, aucune URL de livrable exploitable. Le connecteur refuse `maxOutputCharsPerItem=60000` ; sa limite de 20 000 caractères ne permet pas de récupérer les fins tronquées par ce moyen.

Les paquets joueur V87, PALISADE et REFUGE annoncés restent absents. Les 79 JPG et le paquet de conception animaux précédemment récupérés ne les remplacent pas. Aucun nom, portrait, âge ou date personnelle n'a été inventé. Les anciens constats « aucune implémentation REFUGE » de `V87_SOURCE_COVERAGE_REFRESH.md` décrivent sa base historique, avant le présent lot.

## Réalisation

- Une treizième annexe physique de 1920 × 720, ouverte depuis les quartiers du pont Habitat. Porte parent x380..498, y520..624 ; porte indépendante dessinée sans étirement. La passerelle et la porte voisine de l'accueil animalier restent praticables.
- Cinq interactions de proximité, par E : portrait/nom/dédicace/photo locale ; lecture au terminal ; allumage/extinction de la lumière ; salutation de l'hologramme ; contemplation puis retour à la marche par E, Échap ou déplacement.
- Contrôleur, silhouette, hitbox et caméra du Marine conservés. Aucun tir, simulation d'ennemi, compagnon visible, coût, récompense ou effet sur le mémorial militaire dans cette pièce.
- Décor modulaire : bibliothèque, cadre vide, terminal, lumière, coussin, banquette, deux hublots et porte ; étoiles et planète séparées dans les ouvertures. Vue explicitement simulée, pas localisation de campagne présumée.
- Deux vraies générations par l'outil OpenAI ImageGen intégré, sans référence personnelle : planche de huit objets et planche de 32 poses félines génériques. Aucun appel API/CLI de génération. PNG originaux conservés, alpha réel, découpes et ancrages mesurés au runtime, pas de grille régulière supposée.

## Corrections de cohérence visuelle

La première capture a révélé le plafond hérité démesuré. La version finale recadre et réutilise les bitmaps : caisson de 72,45 px, conduit d'environ 35 px, sous-face à y334, parois retuilées à l'échelle .375. Les deux hublots ont été abaissés. Le Marine visible mesure environ 96,5 px ; la hauteur libre de 290 px et le saut maximal restent compatibles. Les proportions de bibliothèque, terminal, banquette et hologramme sont distinctes, et les légendes ne traversent plus les silhouettes ou le plafond.

Les images ne sont pas une photographie personnelle ni une reproduction certifiée 1:1. Les 32 poses sont toutes réellement raccordées et observées dans le canvas, sans erreur d'ancrage ou d'échelle mesurée ; cela ne vaut pas certification artistique exhaustive de fluidité. Le champ `fluidityCertified` reste honnêtement `false`.

## Sauvegarde et confidentialité

Les données personnelles sont isolées dans un stockage local par profil et partie, hors sauvegarde/export/snapshot de campagne. L'import accepte PNG/JPEG/WebP, décode et réencode localement en JPEG de 384 px maximum, sans métadonnées source. Échecs de quota, données corrompues/futures, concurrence de révision, changement de profil et rappels de décodage tardifs sont couverts.

L'ouverture du portrait ou du terminal suspend les contrôles ; la saisie ne déplace pas le Marine. La sauvegarde projette uniquement la pose sérialisée devant la porte des quartiers. Le joueur vivant reste dans REFUGE. Après rechargement, Continuer replace réellement le joueur devant cette porte. La sortie normale rend la pose parent précédente. Le correctif de capture de pose préserve également les coordonnées de retour des autres annexes.

## Vérification exécutée

Dossier QA isolé : `I:/CodexQA/AliensTantalus/v87-refuge-20260919/`.

- `browser-final-private/report.json` : parcours réel terminé, 16 jalons, zéro erreur JS/HTTP. Une seule fixture initiale (onboarding terminé, joueur dans les quartiers), puis clavier/souris et RAF normaux, sans téléportation de test.
- `browser-public-build/report.json` : même parcours terminé sur la distribution publique nettoyée. Les 32 découpes ont été observées sur plus de 1 100 dessins ; erreur de pivot nulle, erreur d'échelle limitée à l'arrondi flottant.
- Import d'une image de test synthétique : JPEG 384 × 192, aucune requête HTTP durant son traitement ; nom HTML affiché littéralement, aucun élément injecté ; aucune photo/dédicace dans le snapshot public.
- Lumière conservée après rechargement, ressources inchangées, contemplation réversible, sortie et porte animalier voisines validées.
- Interface 390 × 844 : dialogue dans le viewport, sans débordement horizontal, fermeture accessible et reprise du jeu.
- `public-pwa-local.json` : cache `atf-v86-public-shell-8`, 210 chemins ; six modules REFUGE, CSS, deux atlas et six dépendances graphiques (dont le sol) disponibles hors ligne. Documents et tests privés renvoient 404 même hors ligne. Ce résultat ne certifie pas toutes les missions hors ligne.
- `privateoutput/v87/refuge-public-http-local.json` : shell et 91 fichiers critiques comparés au commit public, bitmaps contrôlés par SHA-256, 234 chemins privés en 404 ; garde d'absence d'ascendance du commit privé conservée.

Validation finale : `unit-tests-final2.log` compte 2 712 tests, 2 711 réussis, zéro échec et un test ignoré (création de liens symboliques interdite sur cet hôte Windows). `lint-final2.log` valide 489 modules. Les six fichiers de tests unitaires REFUGE apportent 119 cas ; le harnais navigateur est distinct. Les contrats historiques ont conservé leurs assertions, avec adaptation explicite des nouveaux comptes d'annexes et du précache.

Les premiers essais navigateur ont corrigé deux erreurs du harnais (enveloppe personnelle `.state`, alias sauvegardé `commercialV71`) ; ils ne sont pas comptés comme des réussites. La vérification finale a aussi actualisé la liste exhaustive PWA pour les sept PNG nouvellement précachés. Les captures et logs restent sur I: ; les trois processus QA propres à cette passe ont été arrêtés après vérification de leurs arguments, sans toucher au navigateur utilisateur.

## Publication

Commit public du jeu : `f3ba2dd38174aa4082cf304bfdca4beab446ae29`, parent public `0186438884a8b9f53a200a59d1346392bc548bbf`. Push atomique effectué sur `main` et `codex/v86-public-release`, sans pousser la branche privée. Quinze fichiers dans ce commit, dont les deux PNG.

Source publique vérifiée : 916 fichiers, 732 assets, zéro document privé dans l'arbre courant. Build neuf depuis un instantané sur I: : 905 fichiers de distribution. L'ancien `dist` local n'a pas servi au déploiement. Le garde-fou public refuse les sorties hors de son dossier `dist` ; il a été respecté en déplaçant l'instantané de source, pas contourné.

Déploiement de production demandé par l'intégration Git : `dpl_8SGtkdt9vKRS8NqF1pJvWKc43Khz`, ensuite vérifié READY avec le même SHA public. URL : https://aliens-tantalus-frontier.vercel.app ; déploiement immuable `aliens-tantalus-frontier-diirvt8kr-darknigthmares-projects.vercel.app`. Framework : application statique, sans framework Vercel déclaré. Durée de build observée : 40,953 secondes (horodatages buildingAt/ready du déploiement).

Preuves de production exécutées : `browser-production/report.json` termine les 16 jalons, zéro erreur JS/HTTP ; `public-pwa-production.json` confirme les 210 ressources et les modules/images REFUGE hors ligne ; `privateoutput/v87/refuge-public-http-production.json` confirme les 91 fichiers critiques, les SHA des images et les 234 exclusions privées. Le parcours utilise une image synthétique de QA, jamais une photo utilisateur.

Observabilité : la recherche Vercel error/fatal, bornée à ce déploiement et aux quinze dernières minutes, n'a renvoyé aucun journal. Cela ne remplace pas la QA navigateur d'une application statique. L'outil de journaux de build a répondu « Tool get_deployment_build_logs not found » ; son contenu n'est pas présenté comme inspecté. Aucun drain ni monitor permanent nouveau n'a été créé ou certifié. Les anciens objets/historiques déjà publics n'ont pas été purgés ; seule l'absence de nouvelle ascendance privée est contrôlée.

## Restant

Ce lot ne livre ni le manifeste des 507 clips joueur, ni les 500 planches ennemies demandées, ni PALISADE, ni les quatorze individus animaux restants. Les ZIP et références personnelles non exposés restent à récupérer. L'hologramme demeure générique et le portrait vide jusqu'à une personnalisation volontaire locale. Le statut de jeu commercial complet et la fidélité 1:1 globale ne sont pas revendiqués.
