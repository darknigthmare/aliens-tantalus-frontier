# V87 — Luciole : lot jouable et limites de production

Date : 2026-09-19. Audit privé, jamais distribué dans la release publique.

## Source et périmètre

Le paquet réellement récupéré `ATF_Animaux_USS_PACK_CODEX_v1.zip` (SHA256
`84014cc335af5dee1ff7632aa6233c633a53e009bce604bec80aba37b7bc196e`) définit
Luciole : chatte blanche et rousse, queue touffue, silhouette compacte ;
sociable, joueuse et prudente ; station-shop, offre individuelle de 220 crédits.
La biographie et les préférences sont conservées. Aucun foyer, favori, monde
ou animal personnel de l’utilisateur n’est inventé.

Nouvelle vérification des trois conversations : textes inchangés, aucune
pièce jointe ni URL de téléchargement accessible. L’onglet ChatGPT reste
sur « Un instant… ». Aucun contournement du challenge, accès aux cookies
ou profil utilisateur. Le ZIP joueur V87 et les fichiers REFUGE annoncés
ne sont toujours pas récupérés. Le paquet animaux et 79 JPG déjà présents
ont été revérifiés ; aucun nouveau document source n’est prétendu reçu.

## Image réellement produite

- Outil intégré OpenAI ImageGen, sans API ni clé ; prompt intégral privé
  dans `docs/references/v87-luciole-generation.json`.
- `assets/openai/ship-animals/v87/luciole-atlas.png`, 1536×1024 RGBA,
  2 226 240 octets, SHA256
  `8bef1544aa5cb78f3a2aeec25657e42779620b62f13fe118639399ee2468030a`.
- 32 poses dessinées ; 30 poses sûres réellement utilisées. Frames 18/19
  contaminées par des silhouettes adjacentes au seuil alpha8 : exclues.
  Le repas utilise 6 poses sûres ; aucune duplication annoncée comme dessin neuf.
- Rectangle 17 sans marge ; autres crops mesurés, pas grille nominale.
  Pivots de marche stables sur le corps, pieds au sol, échelle fixe 0,20.
  PNG original inchangé : aucun effacement ou recoloriage automatique.
- Fond inspecté sur sombre, pas de matte opaque visible. Alpha0 : 58,49 % ;
  alpha inférieur à8 : 70,48 %. Les tests vérifient composantes, hash,
  absence de voisin dans chaque crop sûr et contact avec l’alpha visible.
- Six clips runtime seulement ; fluidité non certifiée. Cela ne livre pas
  les 37 clips félins proposés dans le paquet.

## Intégration et corrections

- Rencontre Luciole x1705 au comptoir ; onglet et dossier dédiés.
- Brume reste impérativement x1435 : les anciennes livraisons conservent
  leur provenance validée. Étagère x1825, largeur90 ; clôtures disjointes.
- Troisième logement x354 dans l’accueil animalier, individuel et à équiper.
  Son libellé reste générique avant acquisition. Lit, eau, repas, hygiène,
  griffoir et jouet distincts ; aucun collider bloquant le passage.
- Catalogue révision2 : ancienne partie conserve ses animaux, relations,
  crédits et transactions. Seule la nouvelle offre est introduite, jamais
  une acquisition. Stock manquant en révision2 reste indisponible.
- Affectation au logement explicitement propre à chaque individu ; aucune
  sélection du premier logement félin ni remplacement de Moka.
- Achat transactionnel, réservation, portage, réception, acclimatation,
  routine et rechargement repris sans raccourci de téléportation.
- Repas orientés vers chaque gamelle à l’entrée de l’activité, y compris
  après approche depuis la droite ; orientation de marche non écrasée.
- HUD et message de soins comptent les logements réels : 0/3 puis 3/3.

## Vérifications avant publication

- Suite finale : 2770 tests, 2769 réussis, 0 échec, 1 saut lié au privilège
  symlink Windows. Lint : 494 modules validés. Build public réel réussi.
- Distributions contrôlées : source918 fichiers/733 assets ; build907
  fichiers/733 assets ; zéro document privé dans ces arbres.
- Navigateur privé : Luciole et Brume, 26 jalons chacun, zéro erreur JS/HTTP.
  Un seul montage initial de test (logements équipés, joueur au hangar).
  Ensuite vrais clavier/souris et RAF : amarrage, annulation, rechargement
  pendant approche, rencontre, achat, transport, ascenseurs, réception,
  acclimatation, caresse, marche et sauvegarde/reprise.
- Luciole : 3200→2980 crédits, un reçu et une identité ; les stocks de
  Moka/Brume restent disponibles. Brume : 3200→2900, provenance1435.
- Portage mesuré : 1801 frames Luciole, 1918 Brume ; orientations gauche
  et droite, erreur d’ancrage inférieure à2,3e-13.
- HTTP du build : 92 fichiers critiques conformes au commit public,
  7 bitmaps animaux, 241 chemins privés répondent404, nouveaux documents inclus.
- Journaux/captures privés sur `I:/CodexQA/AliensTantalus/v87-luciole-20260919`.

## Publication et obligations ouvertes

Commit public publié : `cf0d12adb24d10bb8bd7098fab4f57e1dbd52dff`.
Push atomique vers main et codex/v86-public-release, références distantes
revérifiées au même SHA. Parent public5bb59dc ; aucune branche privée poussée.

- Navigateur build public et production : parcours Luciole complet, 26 jalons
  chacun, aucune erreur JS/HTTP ; compteur réel3/3 vérifié visuellement.
- PWA locale et production : cache `atf-v86-public-shell-10`, 212 chemins,
  7 bitmaps animaux, 23 modules structurels, 19 chemins privés rejetés
  en ligne et hors ligne. Ce contrôle ne certifie pas toutes les missions offline.
- Production HTTP : parité des92 fichiers critiques avec le commit public,
  241 chemins privés404 ; rapport privé `luciole-http-production.json`.
- Vercel production READY : `dpl_2h8EwjVnzk5K2wFTfBbRZTxd4caY`, source Git
  main/cf0d12a, framework statique, compilation42,948secondes.
  Alias vérifié : https://aliens-tantalus-frontier.vercel.app
- Requête de journaux error/fatal du déploiement, fenêtre15minutes : aucun
  résultat. Site statique : cela ne constitue pas une surveillance exhaustive.
- Relecture indépendante finale :125 tests ciblés réussis, aucun nouveau
  bug bloquant trouvé ; arbre public918 fichiers sans docs/tests/prompts.

Restent 13 individus du paquet animaux non intégrés, les actions/animations
supplémentaires, routines pondérées, affinités, jeux, cohabitation, soins
complets, pension/stase et navigation étendue. Les autres demandes du
projet (ennemis, campagne PALISADE, animations joueur denses, etc.) restent
ouvertes. Ce lot ne prouve ni 500 planches terminées, ni fidélité1:1
certifiée, ni jeu commercial complet.
