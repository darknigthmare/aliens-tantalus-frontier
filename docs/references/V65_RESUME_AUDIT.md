# Reprise V65 - 31 aout 2026

## Etat mesure

- 571 profils ennemis : 55 archetypes et 516 variantes systemiques.
- 196 atlas runtime : 57 ennemis, 37 vehicules, 36 armes, 32 PNJ,
  29 equipements, 5 joueur. Tous presents, 196 SHA-256 distincts,
  2804 cellules declarees. Voir `V65_RUNTIME_COVERAGE.json`.
- Ce lot produit quatre planches OpenAI de huit poses pour UN Facehugger.
  Elles deviennent UN atlas runtime 4x8, pas 32 ennemis ni 500 plaques.
- La reference NECA et les quatre prompts sont dans `V65_FACEHUGGER_IMAGEGEN.md`.
  Statut : adaptation controlee, sans certification de reproduction 1:1.

## Integre et verifie

- Repos, course, attaque et mort Facehugger : huit poses par cycle ;
  grille 1024x2048, WebP RGBA lossless, cellules256, garde16, pivot128/240,
  echelle commune0.507937. Aucune frame interpolee ou copiee pour gonfler le compte.
- Les32 cellules ont ete inspectees sur fonds clair et sombre. Les170pixels
  d'un doigt franchissant une frontiere source ont ete reattribues a leur
  vraie pose20, pas supprimes ni redessines.
- Resolution du profil ennemi et du joueur Neuro-002 vers le meme atlas.
- Combat du Facehugger standard : les deux vraies IA et leurs renderers
  lisent les cellules16a23. Anticipation2/12s, impact5/12s, fin8/12s ;
  avance maximale92px en sous-pas de8px, jamais par teleportation.
  Cible verrouillee, impact unique, annulation sur mur/porte/blessure/conduit ;
  sauvegarde reprise au repos avec recuperation sans rejouer le coup.
- Decoupe V51 et V52 compatible4x8 ; attaque/mort ne sortent plus de l'image.
- Blessures non letales separees de la mort sur les plaques d'action dediees ;
  l'ovomorphe touche ne passe pas dans son cycle detruit.
- Cache des atlas a la demande : protection des ennemis visibles,
  retention de12atlas inactifs. Reproduction13types dans une frame corrigee ;
  absence de chargement de l'ennemi hors ecran et liberation apres sortie.
- Echec reseau : tentatives espacees de1a30secondes et simulation suspendue
  si un sprite visible a echoue. Message explicite, reprise seulement apres
  recuperation, sans effacer la pause manuelle.
- Sas arriere : tuer le boss avant le trigger ne reverrouille plus sa porte.
  Reprise d'une ancienne sauvegarde verrouillee reparee sans rejouer les gains.
- Huit fiches M577 reliees au bitmap utilise en jeu ; les sept fits restent
  explicitement un reemploi du chassis, sans fausse plaque dediee.
- Le build filtre les masters/intermediaires AVANT copie. Les10ovomorphes
  non acceptes et les quatre atlas d'aperçu ne sont pas publies.
- Cache hors-ligne renouvele ; installation du shell sans precharger toutes
  les plaques ennemies. PNG historiques et WebP V65 ont des audits distincts.

## Manques conserves explicitement

- Dix variantes d'ovomorphe existent sur disque mais restent non acceptees :
  ouverture/eclosion et destruction ne doivent pas etre confondues avec les
  lignes generiques idle/chase/attack/death. Albino inspecte : derniere ligne
  ouverte, pas une animation de mort valide.
- Red Xenomorph, K-Series et Combat Synthetic :33profils utilisent encore
  des lignes legacy. Les516variantes n'ont pas chacune une nouvelle planche.
- Quatre bases d'armes sans art/reference suffisante : Heavy Pulse Rifle,
  ES-4, Compound Bow et Plasma Rifle (16 variantes catalogue).
- M570 APC, M292 et AD19D Bearcat : trois chassis/24fits restent bloques,
  sans substitution arbitraire par un autre vehicule.
- Les autres familles demandent encore davantage de poses et de transitions.
  Les variantes et autres ennemis sauteurs conservent leur ancien combat :
  la nouvelle sequence Facehugger est bornee au profil standard V65.
  La presence d'une fiche ou d'un fichier ne certifie pas un jeu commercial fini.

## Validation et limites

- `npm run qa` a passe : inventaire, manifeste V64, alpha PNG historique,
  provenance/alpha/grille V65, lint, suite complete de 448 tests et build 65.0.0.
  Le premier build final avait ete bloque par le serveur de test ouvert dans
  dist (verrou Windows EBUSY) ; serveur arrete, controle complet relance et reussi.
- Tests de dessin via les vrais renderers et contextes Canvas instrumentes.
- Audit des405PNG runtime historiques :0erreur bloquante,13candidats de halo
  restent a examiner. Ils ne sont pas declares corriges par cette reprise.
- Build servi localement : version65.0.0 et nouvel atlas WebP HTTP200,
  typeimage/webp et hash concordant ; source de production et Ovomorph
  non accepte HTTP404, comme attendu.
  Inspection des sources et de la planche contact effectuee ; pas de QA
  interactive navigateur certifiee : connexion bloquee par le helper Windows
  `apply deny-read ACLs`.
- Le manque d'espace initial est resolu (environ30Go liberes pendant la reprise).
- Le lien `6a952c3d-5da4-83eb-8f69-a79ba92e0696` a ete lu : guide general
  de metroidvania. Les pieces jointes sandbox `KIT_METROIDVANIA_CODEX.zip`
  et `METROIDVANIA_MASTER.md` ne sont pas accessibles via le partage.
  Leur ajout par l'utilisateur reste necessaire pour traiter leur contenu exact.
- Le manifeste V64 reste un snapshot195atlas ; le registre additif V65
  fournit le nouvel atlas. Ne pas lire le snapshot comme le total runtime.
