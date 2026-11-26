# Fiorina V116 — poses, accessoires et continuité visuelle

## Base et contrat de cette livraison

Cette passe prolonge le corpus V115 intégré par la [PR 61](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/61), sur le commit [ae4e49bef5fea639d0c381466aefea85f8a57300](https://github.com/darknigthmare/aliens-tantalus-frontier/commit/ae4e49bef5fea639d0c381466aefea85f8a57300) de la branche de continuation. Elle ajoute des images aux systèmes de rendu déjà présents. Les fichiers et API portant le suffixe V115 restent leur point d’entrée ; aucun mixin supplémentaire n’est introduit pour ce lot.

Le [manifeste courant](../../assets/openai/sprites/alien3-fiorina-v115/manifest.json) contient la géométrie et les entrées sélectionnées par le moteur. La [provenance V116](FIORINA_SPRITES_V116.json) conserve les prompts exacts, références, empreintes, décisions de géométrie, itération rejetée et éléments différés. La [provenance V115](FIORINA_SPRITES_V115.json) et son [rapport historique](FIORINA_SPRITES_V115.md) restent inchangés. Leurs nombres décrivent leur livraison historique.

Chaque PNG accepté conserve les octets de sa sortie imagegen. Aucun script n’a redimensionné, recoloré, détouré, recadré ou réécrit son alpha après génération. Les vues de contrôle sont des compositions Canvas des fichiers originaux. Les photographies et photogrammes externes servent de références et ne sont pas redistribués dans le pack.

## Inventaire concret

| Groupe nouveau | PNG | Usage réel |
| --- | ---: | --- |
| Ripley, tenue de prison | 5 | Grimpe B, interaction, blessure, deux poses de marche accroupie ; sélection par les états natifs existants. |
| Ripley, tenue d’arrivée | 4 | Deux poses de marche et deux de course pendant les phases qui sélectionnent cette tenue. |
| Dillon et Morse | 4 | Deux poses de course chacun ; catalogue. Leur mise en place actuelle reste une marche vers les commandes. |
| Murphy, Boggs et Rains | 3 | Portraits en pied distincts au catalogue ; leur statut décédé reste appliqué dans la campagne. |
| Bovin vivant et facehugger royal inerte | 2 | Références Assembly au catalogue ; aucun nouvel animal actif ni nouvelle salle native. |
| Accessoires autonomes | 4 | Fusée allumée, boîte d’allumettes, lunettes du scientifique, lunettes de Dillon. Seule la fusée dispose ici d’un raccord natif. |
| **Nouveaux PNG** | **22** | **31 130 724 octets.** |

Le corpus cumulé comprend **61 PNG distincts**, **72 entrées de manifeste**, **83 occurrences de frames** et **11 boucles à deux images**. Les PNG totalisent **87 425 555 octets**. Une entrée d’animation réutilisant deux fichiers n’est pas comptée comme un nouveau PNG ou personnage.

Six boucles s’ajoutent : `ripley-prison-climb` et `ripley-prison-crouch-walk` à 5 fps ; `ripley-crash-walk` à 6 fps ; `ripley-crash-run`, `dillon-run` et `morse-run` à 8 fps. Ce sont des cycles minimaux à deux poses clés, avec silhouettes et appuis distincts. Les transitions intermédiaires, une alternance complète des jambes et des variantes gauche dessinées séparément ne sont pas produites. Le miroir existant assure toujours l’orientation inverse.

Dix nouveaux PNG peuvent être employés par les raccords natifs de cette passe : neuf poses de Ripley et la fusée. Les douze autres demeurent des ressources de catalogue dans la chronologie actuelle. La pose de grimpe A de V115 est maintenant utilisée par le nouvel alias A/B ; sa description courante a été mise à jour sans toucher à son image ni à sa provenance historique.

## Apparence et sources

Murphy reprend sa tenue de travail de l’abattoir Assembly : bonnet, vêtements usés, tablier et gants. Boggs conserve son visage propre, son crâne rasé, le tatouage frontal documenté et son manteau doublé. Rains dispose de sa coiffe noire à rabat relevé et de son manteau distinct. Les portraits et photogrammes sont identifiés dans la [galerie promotionnelle](https://www.avpgalaxy.net/alien-movies/alien-3/gallery/promo/), la [galerie des scènes de production](https://www.avpgalaxy.net/alien-movies/alien-3/gallery/production-stills/) et la [galerie de portraits du film](https://www.moviedude.co.uk/%5BFilm%5D%20Alien3%20(1992).htm). Leur attribution et les empreintes des références effectivement utilisées figurent dans le JSON.

Le bovin est reconstruit d’après un [photogramme du montage Assembly sur la plage](https://highwaytohorror.com/alien-3-filming-locations/). La vue latérale, le détail du pelage et l’éclairage sont interprétés à partir d’une source sombre ; aucune race précise n’est affirmée.

Le facehugger royal est représenté comme un accessoire inerte de l’abattoir Assembly, selon les photographies et l’attribution de production citées dans sa fiche. Il reste distinct du facehugger ordinaire de l’ouverture. Sa présence dans le catalogue ne crée pas une caste active, une IA, une attaque ou un événement narratif.

Les accessoires sont guidés par les photographies de production :

- [Boîte d’allumettes de la collection Nick Gillard](https://propstore.com/product/alien-1992/lot-830-nick-gillard-collection-nick-gillards-personal-shooting-script-storyboards-and-weyland-yutani-matchbox/).
- [Lunettes de protection du scientifique](https://propstore.com/product/alien-1992/weyland-yutani-scientists-protective-glasses/), avec la loupe devant le verre droit.
- [Lunettes de Dillon](https://propstoreauction.com/lot-details/index/catalog/508/lot/197373), monture brun foncé et bas translucide.
- Fusée allumée guidée par les photogrammes 084 et 086 de la séquence des galeries, cités dans sa fiche.

Un premier essai des lunettes de Dillon a été rejeté parce que les verres devenaient trop opaques sur fond sombre. Une correction imagegen a conservé la monture et rendu les verres transparents. Les deux prompts et les empreintes sont conservés ; seul le résultat accepté rejoint le manifeste. Cet accessoire isolé ne remplace pas automatiquement les lunettes peintes à l’intérieur des sprites corporels existants.

Toutes les entrées nouvelles restent `exact:false`. Les poses sont des adaptations documentées. Les détails cachés, les petits graphismes, les tatouages, les matières et la ressemblance des visages ne sont pas certifiés à l’identique du film. La vérification technique des pixels ne ferme pas ces écarts artistiques.

## Géométrie d’affichage

Les dimensions `world` décrivent le canevas complet, marges transparentes comprises. Le rendu conserve le rapport d’aspect du fichier. Les points d’appui sont placés au sol sous le bassin estimé pour les déplacements, ou sur le support pour les accessoires.

Le calibrage des nouvelles poses humaines compare la hauteur de tête estimée à celle du sprite de repos correspondant. Il conserve la flexion et l’extension des poses. Donner systématiquement la même hauteur totale aux images de course aurait grossi le visage et le torse de Dillon et Morse ; leurs canevas affichés restent donc moins hauts que ceux des poses debout.

Les repères sont des estimations visuelles reproductibles, avec une incertitude d’environ 5 à 10 % selon la perspective et l’inclinaison. Le JSON conserve les repères et le calcul par entrée. Aucun changement de collision ou de vitesse n’en découle.

### Correction de la pose accroupie existante

La revue a identifié une tête visuellement trop grande dans `ripley-prison-crouch` V115 par rapport à la pose debout. La correction modifie uniquement sa géométrie dans le manifeste courant :

| Champ | V115 historique | V116 courant |
| --- | ---: | ---: |
| Largeur world | 80.0296 | 64.5053 |
| Hauteur world | 73.1368 | 58.9495 |
| Pivot | [605, 1150] | [390, 1150] |

Le multiplicateur d’échelle uniforme est d’environ 0.806. Le pivot passe sous le bassin estimé ; la ligne de sol historique reste identique. Le PNG et son SHA256 sont conservés. L’ancienne et la nouvelle géométrie sont toutes deux consignées dans la provenance V116.

La grimpe B reprend exactement l’échelle par pixel de A, avec un pivot compatible. La différence de largeur world correspond au fait que B compte 987 colonnes contre 986 pour A. Cette continuité ne certifie pas le contact exact de chaque doigt ou semelle avec chaque barreau.

## Raccordements et gardes

La pose d’interaction est maintenant sélectionnée d’après le propriétaire réel de la manœuvre, `alien3OperationsV107.active`, pour Ripley. Ce signal est lu pour la présentation. Les états de blessure, d’air, de grimpe et de déplacement gardent leur priorité. Le début, l’annulation, la durée et l’avancement de l’opération conservent leurs propriétaires existants.

La fusée utilise le socket `fire-flare-v113`, au nœud `f161-chemical-store`. Elle n’est demandée et dessinée que lorsque `flags.fire` est actif. Son pivot est au bas de la poignée, pixel [484, 1500]. Le canevas world de 62 × 93 conserve le rapport d’aspect original et inclut les marges, la lumière et la fumée. Le corps logique et les interactions existants ne changent pas. Aucun état éteint, porteur ni fonctionnement d’arme n’est inventé.

Murphy, Boggs et Rains restent filtrés par leur statut narratif. Les shells d’inspection `dog-kennel` et `ox-approach` du prototype autonome ne deviennent pas des salles jouables du moteur natif. La galerie de contrôle distingue les contextes cinéma, Assembly, commun et documentaire ; son affichage d’une image n’est pas une preuve de placement dans la campagne.

Le chargement différé, l’isolation des banques par moteur, les limites de concurrence, l’éviction du cache et le rendu vectoriel de secours restent les contrats V115. Les poses absentes ou indisponibles conservent ce secours. Les PNG du nouveau corpus ne sont pas tous chargés au lancement.

## Admission, distribution et preuves

Les 39 empreintes PNG V115 restent des reçus historiques. L’admission courante ajoute les 22 nouveaux reçus et l’empreinte exacte du manifeste V116. Elle conserve une liste fermée de chemins, tailles, dimensions et SHA256 ; un fichier voisin n’est pas autorisé par ressemblance de nom.

Le ZIP est construit à partir de cette liste vérifiée, et non d’un nombre de fichiers codé en dur. Il conserve le manifeste courant, les PNG admis et les documents de provenance. Les documents et outils de contrôle restent exclus du build public du jeu. La galerie HTML de contrôle et ses captures sont des artefacts de QA, sans lien depuis les écrans du joueur.

Les contrôles distinguent :

1. Tests des sélecteurs, de la banque, du cycle de vie et des admissions.
2. Rendus des vrais PNG avec Canvas/Skia sur fonds clair et sombre, avec toutes les frames et les deux orientations.
3. Appels des hooks du vrai moteur dans des fixtures déclarées : ces captures ne sont pas un parcours complet.
4. Parcours Chromium distinct, avec chargement réel de Ripley au lancement et après reprise, puis observation de la pose de déplacement d’arrivée pendant l’entrée clavier existante.
5. Build et admissions publiques, qui doivent réussir séparément.

### Résultats de cette révision

Le manifeste contrôlé est `db64e2b36aa8a0fa424adf112a1669a0e325c4497067fc38ddbfe140af418e6a`. Les résultats locaux ci-dessous ont été observés avant la publication de la PR ; les réussites de V115 ne sont pas transférées à V116.

| Contrôle local | Résultat observé |
| --- | --- |
| Contrats du renderer et raccords natifs | 19 tests réussis. Ils couvrent notamment les priorités de pose, l’interaction réelle et l’absence de résurrection des détenus. Les images simulées de cette suite ne prouvent pas les pixels. |
| Succession des empreintes d’hôtes | 13 tests réussis ; quatre hôtes V116 précisément déclarés, reçus historiques conservés. |
| Inventaire admis | 61 PNG et 72 entrées contrôlés par empreintes, dimensions et chemins exacts. |
| Cache ciblé | 24 contrôles réussis sur les refus, l’isolation, les réponses admises et la purge. Le passage local complet d’installation du shell a été interrompu. |
| Intégrité historique | Les 39 PNG et les deux documents V115 restent identiques au ZIP historique. Seuls la géométrie courante de crouch et le descriptif courant de climb A sont modifiés. |
| Générations nouvelles | 22 PNG originaux, prompts conservés ; octets transférés vérifiés par leurs SHA Git. Une itération de lunettes rejetée et consignée. |
| Revue des six accessoires | Composition réelle sur fonds clair et sombre avec Canvas/Skia, transparence des verres examinée. |
| Revue indépendante | Gardes de fusée et d’interaction, whitelist, provenance et inventaire exact du ZIP relus ; aucun défaut bloquant concret trouvé dans ce périmètre. |

Les longues passes locales ont été interrompues par `SIGKILL`/code 137, sans assertion de défaut de contenu : copie complète du pack, installation complète du shell, ensemble des pixels et QA native avec les vrais PNG. Le coordinateur graphique ne charge plus inutilement Canvas ; même avec des partitions locales d’une entrée, 19 partitions ont terminé puis la vingtième a été interrompue. Cela ne constitue pas un succès partiel transférable au corpus entier. Aucun essai interrompu n’est annoncé comme terminé.

La [CI Fiorina](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/workflows/fiorina-native-v114.yml) conserve les contrôles complets du pack, des PNG, des hooks natifs, du build et du parcours Chromium. Ses rapports et la description de PR donnent les résultats propres au commit publié. Le parcours navigateur utilise le mouvement réduit : il prouve la sélection et le chargement de la pose d’arrivée pendant une entrée clavier réelle, pas le défilement des deux frames A/B. Les différentes frames sont examinées séparément par Canvas. Le feu et l’interaction soutenue sont des fixtures du QA natif, pas des étapes atteintes naturellement par le court parcours navigateur.

## Éléments encore ouverts

L’enregistreur de vol, le kit médical complet, la seringue complète de Clemens et la lampe de l’abattoir restent différés : les références consultées ne documentent pas suffisamment leur forme complète. Le M41A autonome et un cycle complet de course du Runner restent également absents du corpus accepté. Le fusil porté dans le PNG du commando ne constitue pas une arme autonome.

Les lieux, portes et parcours ne sont pas étendus par cette passe de sprites. Les outils déjà présents ne remplacent pas une revue filmique plan par plan de toute la campagne. La fidélité 1:1 reste un objectif de comparaison, pas un statut obtenu par le simple ajout de ces PNG.

