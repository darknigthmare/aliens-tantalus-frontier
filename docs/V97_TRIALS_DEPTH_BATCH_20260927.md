# V97 — Xeno Trials, laboratoire de profondeur et lot de 50

État local du 27 septembre 2026. Extension du runtime V86, pas une publication ni une certification canonique. Cette note remplace les compteurs et réglages V96 datés du 26 septembre.

## Xeno Trials

- Parcours séparé : **combattants → arène → combat**. Le retour aux combattants conserve les choix ; le ticket n'est créé qu'au lancement final.
- 33 combattants, dont 9 synthétiques : 19 ajouts utilisant les visuels dédiés déjà admis. Les 14 entrées initiales gardent leur ordre et leurs déblocages.
- Filtres par famille, rôle et disponibilité, recherche, tri catalogue/nom/vitalité/vitesse. Une sélection reste conservée même lorsqu'un filtre la masque.
- Defender reste une identité distincte. Les variantes Grey et Purple d'Arachnoid partagent leur profil, mais conservent leurs deux PNG.
- Trois arènes sélectionnables avec aperçu : confinement, réacteur et ruche. Les aperçus correspondent au rendu actuel, pas à de nouveaux décors illustrés.
- Contrat de présentation repris du code de Yautja / The Pit : 1,2 s par introduction, décompte de 3 s, signal de combat de 650 ms. Les introductions apparaissent à la première manche ; les suivantes gardent le décompte.
- Durée par manche : 60, 75, 99 ou 120 secondes ; défaut 99. Les tickets historiques à 75 secondes sont conservés.
- Simulation et minuterie gelées pendant les introductions, le décompte et la pause. Perte de focus : pause sans reprise automatique. Une touche tenue avant le signal doit être relâchée.
- Reprise d'un ticket sauvegardé avec ses combattants, variante, doctrine, arène et durée ; sélections verrouillées pendant ce ticket. La reprise recommence le duel, pas la frame exacte.

Les duels, factions, statistiques et récompenses sont une simulation originale du projet. Combat local contre IA ; aucune promesse de multijoueur réseau ou d'animations complètes.

## Aperçu autonome 2D / 2.5D

Ouvrir `depth-lab-v97.html`, ou le lien **Laboratoire de profondeur** dans Xeno Trials. Le jeu 2D reste l'entrée principale et n'est pas remplacé.

Quatre contextes comparables : Tantalus / commandement, Tantalus / soute, Cargo Brutal et Ruche-monde. Les couches graphiques existantes servent de matière à l'étude ; l'extérieur planétaire de Ruche-monde est un habillage temporaire, pas son décor final.

Comparaison côte à côte ou plein cadre 2D/2.5D : déplacement latéral et profondeur, variation d'échelle, ordre d'occlusion, parallaxe à trois plans, caméra suiveuse, curseurs, démonstration, pause et tactile. Deux poses fixes témoins : Commando et Siege Royal.

Les volumes de test sont explicitement non collisionnants. Aucun combat, objectif, Loader, DLC jouable, modèle 3D ou animation de marche n'est ajouté à ce laboratoire. Aucun accès aux sauvegardes ou aux modules de campagne. Le choix de changer de format reste à l'utilisateur.

## Lot natif de 50 profils historiques

**50 profils traités : 43 poses fixes admises, 7 retenues hors runtime.** L'admission exacte est dans `references/v97-batch-050/ADMISSION.json` ; chaque appel possède son reçu et ses références. Les PNG natifs restent inchangés, sans détourage, recoloriage ou fausses frames ajoutés après génération. Le skill imagegen a guidé la production et la traçabilité native.

Les 43 visuels sont des variantes systémiques déjà inscrites dans le projet, pas 43 nouvelles espèces canoniques. Anatomie, silhouette, transparence, dimensions, pivots et empreintes SHA256 ont été contrôlés. Fidélité 1:1 non certifiée.

42 poses terrestres rejoignent la Bioforge, qui compte désormais 159 profils terrestres. Ceto reste aquatique, visible dans le catalogue/campagne mais exclu de l'impression terrestre. Les comportements, statistiques et collisions historiques ne sont pas remplacés par des versions génériques.

Le placement de la grande Albino Ripper Queen conserve désormais son collider historique de 336 × 268,28125 ; un support trop étroit provoque un refus sans consommer le ticket, jamais une réduction du corps.

Retenus : Albino Queen, Albino Boiler et Albino Red Xeno pour écarts de revue ; Armored Queen, Armored Crusher et Armored Lurker après une interruption groupée de génération (un refus dans le groupe, attribution individuelle inconnue, deux sorties non récupérées) ; Armored Monica après refus explicite. Aucun nouvel essai de ces contenus. Les 17 sources déjà retenues avant ce lot restent inchangées.

46 profils historiques ont maintenant une pose dédiée V96/V97 ; 469 autres profils auparavant partagés restent à traiter. Les 515 tâches d'animation restent ouvertes. Ce lot ne termine pas l'inventaire films/jeux/comics.

## Vérification et périmètre Git

Les tests couvrent les contrats natifs et les comportements historiques, la Bioforge, la sélection, les tickets et la présentation. La QA Chrome utilise un contexte isolé et des commandes réelles ; aucune injection de santé, résultat ou minuterie dans le duel. Elle couvre un duel terminé, la récompense unique, le rechargement, l'abandon, la pause et le mobile. Le laboratoire vérifie les quatre zones, le tactile, la projection et l'absence d'accès au stockage.

Les 43 PNG sont également vérifiés par HTTP, empreinte et décodage navigateur. Les prompts/reçus de production sont des preuves privées versionnées, exclus du build ; seules les images explicitement admises sont distribuées. Les candidats refusés restent hors commit et hors build.

Le commit regroupe aussi les intégrations antérieures V88–V96 restées locales et leurs dépendances de validation. Les modifications indépendantes d'alignement aquatique Ceto sont laissées intactes, hors index. Aucun push ni déploiement distant n'est demandé pour cette livraison.

### Résultats de validation

- Travail local : 3 811 tests réussis, 0 échec, 1 ignoré ; inclut un test Ceto indépendant hors commit.
- Export de l'index Git : **3 810 tests réussis, 0 échec, 1 ignoré**. Lint : 618 modules. Build : réussi, 3 450 entrées de catalogue.
- Export Windows : cinq preuves historiques V79/V81/V82 gardées en LF, empreintes d'origine inchangées ; contrôles de texte et chemin de dépôt rendus portables.
- Build local sur `http://127.0.0.1:4307` : **252 contrôles HTTP réussis** (33 textes, 125 PNG exacts, 87 chemins privés absents, 7 images retenues absentes).
- Chrome : parcours de combat complet et sauvegarde unique, filtres 33/9, sélection de l'arène, introduction/décompte/pause, rechargement/abandon et disposition à 390 px validés. Pas d'erreur console.
- Laboratoire : quatre zones et 11 ressources chargées, projection, clavier, pause, tactile et isolation des sauvegardes validés. 12 tests dédiés réussis.
- 43 nouvelles images V97 : SHA et dimensions HTTP/navigateur validés, trois planches de contrôle visuel inspectées, aucun pixel source réécrit.

Preuves locales conservées sous `E:/CodexQA/AliensTantalus/` : `v97-index-tests-final.log`, `v97-index-lint.log`, `v97-index-build.log`, `v97-local-built-http/local-build-http.json`, `v97-trials-built-20260927/browser-full.json`, `v97-depth-built-20260927/report.json` et `v97-assets-built-20260927/native-http-and-browser.json`. Ces rapports ne prouvent ni un déploiement distant, ni une campagne entière jouée.
