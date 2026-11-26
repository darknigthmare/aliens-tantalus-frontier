# CODEX AVP-R — Gunnison, dernière nuit

## 0.5.0 · Les lignes de chasse

Document du module réellement livré. Les nombres proviennent des sources et des journaux de test joints. 29 septembre 2026.

## Nature et limites de cette passe

Cette version prolonge les sources complètes du pack autonome 0.4, sans remplacer ses cartes ni ses scènes. Elle ne fusionne pas le GameEngine, les profils ou les récompenses de Tantalus. Aucun dépôt distant n’a été modifié et aucun déploiement n’a été réalisé.

Les huit nouvelles lectures, douze dispositifs, consommables, règles du duel et interfaces sont des choix originaux de cette adaptation de fan. Ils ne décrivent ni un plan réel de Gunnison ni des mécanismes certifiés canoniques du film. Aucun dialogue, voix ou extrait audiovisuel du film n’a été ajouté.

Le rendu demeure vectoriel et procédural en Canvas, avec les silhouettes articulées héritées. Les 41 lieux au sol, 330 props et 678 détails n’ont pas reçu une refonte artistique intégrale. Les nouveaux dessins concernent les balises, les dépôts, les dispositifs, leurs zones et le dossier. Un placement n’est pas un sprite unique. Les scènes ont encore des ellipses et ne reconstituent pas chaque plan du film.

## Registre vérifié

| Définition | Nombre |
|---|---:|
| Lieux au sol conservés | 41 |
| Environnement aérien conservé | 1 |
| Liaisons pédestres réciproques | 54 |
| Séquences principales | 15 |
| Objectifs principaux | 50 |
| Placements de props hérités | 330 |
| Placements de détails hérités | 678 |
| Observations héritées | 41 |
| Fiches du carnet | 72 |
| Règles de conception | 108 |
| Nouveaux dispositifs de combat | 12 |
| Nouvelles lectures facultatives | 8 |
| Contenants finis conservés | 15 |

Les 41 lieux au sol comprennent 40 lieux reliés et la clairière finale. Le vol est compté séparément. Les 12 dispositifs et les 8 dépôts sont des entités tactiques distinctes, pas 20 salles, 20 tâches principales ou 20 obstacles solides ajoutés aux props. Les cartes et les cinquante objectifs sont comparés intégralement à la 0.4 dans les tests.

## Contrat des balises laser

Wolf masqué commence avec huit cellules pour l’ensemble de la campagne. Maintenir Y affiche une prévisualisation sans dépense ; relâcher Y tente la pose. Le centre visé est limité à 230 unités. Deux ancrages automatiques définissent un faisceau transversal de 140 unités. Il ne s’agit pas de deux ancrages librement placés sur des murs. Le tir de pose, les ancrages et le segment doivent tous rester dans une portion de sol dégagée. La collision utilise les mêmes coordonnées x / profondeur que les acteurs. Les espaces side gardent un centre à profondeur 174.

Une pose valide coûte une cellule et 25 points d’énergie. Elle retire le camouflage. Il faut 0,9 seconde pour armer le faisceau. Trois balises peuvent être déployées au maximum, toutes pièces visitées de la séquence confondues. Une position trop proche du joueur, obstruée, hors limites ou trop proche d’une autre balise est refusée sans dépense. Le lancement n’est pas un projectile graphique simulé : les ancrages apparaissent à la validation.

Le franchissement d’un adversaire vivant et sorti de son émergence déclenche une seule balise sur un seul adversaire. La détection emploie le segment entre ses positions successives et le rayon de son corps ; une charge rapide ne saute pas le test. Les dégâts directs sont 105 pour un ennemi ordinaire, 55 pour le boss. Un adversaire ordinaire touché subit 1,1 seconde d’étourdissement ; cette interruption ne s’applique pas au Predalien. Wolf et ses compagnons ne déclenchent pas le faisceau. Il n’y a pas de dégât allié ni d’explosion de zone par cette arme.

U récupère la balise non déclenchée la plus proche à moins de 120 unités, sous condition de visibilité géométrique. La cellule revient une seule fois, l’énergie non. Une balise déclenchée ne laisse rien à récupérer. À la transition de séquence, les balises non déclenchées sont rappelées automatiquement ; ce confort de prototype évite de perdre le matériel en changeant de protagoniste. Les balises utilisées restent consommées. Ni une porte ni un export ne rechargent ces stocks.

La pause, l’ouverture du plan, la perte de focus, l’annulation tactile, le redémarrage et le changement de séquence annulent une prévisualisation tenue. Les commandes tactiles proposent la même pose automatique dans la direction courante ; elles n’offrent pas une visée analogique supplémentaire. Wolf sans masque ne peut plus poser de balise dans le duel. Le vol et les personnages humains n’y ont pas accès.

## Lectures et traitement des résidus

Huit dépôts sont placés dans des pièces déjà existantes. Leur signature lisible dépend de Wolf masqué, de la vision Xéno choisie par V, de la proximité et de la ligne de vue. Approcher à moins de 105 unités puis E lance 1,35 seconde d’analyse immobile. Bouger ou subir un coup interrompt ; quitter le bon mode de vision empêche la validation. Les interactions principales gardent priorité lorsqu’elles occupent la même portée. Les nouvelles lectures ne sont jamais ajoutées au compteur des cinquante tâches obligatoires.

Le dossier P présente huit entrées masquées tant que leur lecture n’est pas obtenue, puis le résultat original correspondant. Aucun relevé ne donne de munitions, de soin, de recharge ou de monnaie. Il n’y a pas de voix enregistrée pour ces textes.

Wolf dispose de huit doses globales de neutralisant. N commence un traitement de 1,2 seconde immobile si une flaque encore active ou un dépôt déjà analysé se trouve à moins de 165 unités, sans obstacle de vue géométrique. Une dose traite toutes les cibles éligibles du rayon à la fin de l’action. Les flaques acides dynamiques sont réellement retirées du runtime. Les dépôts facultatifs changent de représentation et restent nettoyés dans la sauvegarde. Ces dépôts seuls ne causaient ni dégâts ni apparition d’ennemis : les nettoyer n’abaisse pas un niveau de contamination simulé à l’échelle de la ville.

Bouger ou être blessé interrompt le traitement sans consommer la dose. Si les seules flaques ont disparu pendant l’action, aucune dose n’est perdue. Une zone vide ou déjà traitée refuse la commande. Dépenser les doses sur des flaques peut empêcher de nettoyer tous les dépôts dans ce parcours ; les relevés restent lisibles et la campagne n’est pas bloquée. Il s’agit d’un consommable fictif, pas d’une formule chimique ou d’une procédure réelle.

### Les huit lectures

| ID | Lieu | x / profondeur | Titre |
|---|---|---|---|
| `trace.01` | Épave du vaisseau éclaireur | 1080 / 174 | Mémoire déchirée |
| `trace.02` | Ravine et ponceau | 850 / 120 | Entre les racines |
| `trace.03` | Chambre de répartition | 1400 / 220 | La bifurcation |
| `trace.04` | Bassin de rétention | 900 / 265 | Sous le niveau d’eau |
| `trace.05` | Enceinte de la centrale | 810 / 255 | La ligne arrachée |
| `trace.06` | Piscine du lycée | 1780 / 265 | Au bord des reflets |
| `trace.07` | Armurerie — surface de vente | 720 / 250 | Au ras des rayons |
| `trace.08` | Hôpital — triage | 1390 / 174 | La trace montante |

**Mémoire déchirée** — Des fibres étrangères sont prises sous le capot. La trajectoire mène au ponceau.
Résultat original : La coque a été éventrée de l’intérieur ; le relevé ne correspond pas à un prédateur isolé.

**Entre les racines** — Une coulée claire disparaît sous les racines au bord du collecteur.
Résultat original : La trace rejoint le réseau pluvial. Les résidus restent actifs même sans créature visible.

**La bifurcation** — Les marques se séparent devant deux galeries.
Résultat original : Le relevé distingue un passage massif et des allers-retours plus légers. Une embuscade peut couvrir cette bifurcation.

**Sous le niveau d’eau** — Une membrane s’accroche au garde-corps du bassin.
Résultat original : Le dépôt est ancien par rapport aux traces de griffes. Le groupe ne s’est pas contenté de traverser.

**La ligne arrachée** — Une pellicule sombre couvre le pied d’un équipement électrique.
Résultat original : La signature se dirige vers les logements. Couper une ligne ici ne supprimerait pas la menace.

**Au bord des reflets** — Une matière translucide s’est fixée derrière la margelle.
Résultat original : Les reflets masquent le déplacement. Chercher un angle dégagé avant de placer une balise.

**Au ras des rayons** — Un fragment est resté sous le dernier rayonnage.
Résultat original : Les couloirs entre les meubles offrent des lignes de coupe, mais empêchent le tir à travers les étagères.

**La trace montante** — Des lambeaux de membrane rejoignent une grille du plafond.
Résultat original : La signature la plus dense vient de l’étage. Les éléments relevés ici ne reconstituent pas le plan de l’hôpital.

## Douze dispositifs de combat

Ces nouveaux boîtiers et conduites sont touchables par les projectiles, pas activables avec E ou détruisibles au corps-à-corps. Chacun possède 45 points d’intégrité et une empreinte de tir circulaire de rayon 18. Le projectile respecte d’abord le contact le plus proche : mur, adversaire ou dispositif. Tirer au travers d’un obstacle ne déclenche pas un élément caché. Les dispositifs ne sont pas du couvert solide et ne rendent pas les autres props destructibles.

Une rupture annonce le danger pendant 0,85 seconde, avec un volume au sol. Les dégâts affectent aussi le joueur. Le boîtier électrique couvre 110 unités pendant sept secondes, avec des impulsions espacées d’environ 0,95 seconde. Chaque impulsion vaut 12 dégâts de base au joueur et 18 à une créature éligible. La conduite de pression souffle dans 130 unités, inflige une fois 24 dégâts de base au joueur et 45 aux créatures, puis produit neuf secondes de vapeur. La vapeur coupe la ligne de vue, pas la trajectoire physique des balles. Les protections temporelles, les multiplicateurs de difficulté et les obstacles restent applicables.

Les créatures ordinaires peuvent être interrompues par ces dispositifs ; le boss ne subit pas leur étourdissement. Les passagers et escortes conservent leurs états hérités, sans nouvelle santé individuelle complète. Les dispositifs peuvent être employés par les humains comme par Wolf avec une arme à projectile disponible ; leur intérêt n’est pas réservé au chasseur.

Les dégâts partiels, l’instant de rupture et l’état hors service sont globaux à la campagne. Une porte, un chapitre ou un import ne les répare pas. Le temps écoulé vieillit un champ même hors de sa pièce, mais les acteurs hors écran ne sont pas simulés. Un souffle survenu hors écran n’est pas retardé pour blesser le joueur à son retour. La pause arrête les délais. L’état endommagé reste visible une fois l’effet terminé.

| ID | Lieu | Type | x / profondeur | Nom |
|---|---|---|---|
| `fixture.01` | Chambre de répartition | pressure | 750 / 185 | Purge du collecteur |
| `fixture.02` | Bassin de rétention | electric | 1020 / 180 | Boîtier de la pompe |
| `fixture.03` | Enceinte de la centrale | electric | 1340 / 235 | Dérivation extérieure |
| `fixture.04` | Salle des turbines | pressure | 1090 / 174 | Conduite de refroidissement |
| `fixture.05` | Piscine du lycée | electric | 640 / 265 | Commande du bassin |
| `fixture.06` | Armurerie — surface de vente | pressure | 1640 / 240 | Réserve sous pression |
| `fixture.07` | Carrefour du barrage | electric | 1610 / 240 | Groupe du barrage |
| `fixture.08` | Hôpital — accueil des urgences | electric | 900 / 255 | Secours des urgences |
| `fixture.09` | Hôpital — couloir supérieur | pressure | 1530 / 174 | Conduite de l’étage |
| `fixture.10` | Hôpital — sous-sol technique | pressure | 840 / 174 | Purge technique |
| `fixture.11` | Hôpital — toiture technique | electric | 1350 / 230 | Onduleur du toit |
| `fixture.12` | Hôpital — toiture technique | pressure | 1830 / 95 | Conduite de ventilation |

## Lire et contrer le Predalien

Les trois phases de santé, les PV maximaux, le rôle de Wolf démasqué et la place du duel dans la campagne sont conservés. Cette version enrichit le combat existant ; elle n’ajoute pas un nouveau boss ni trois nouveaux combats.

À partir de la deuxième phase, chaque troisième nouvelle attaque éligible devient un balayage de queue. Sa zone au sol est fixée au lancement : devant le boss, entre 15 et 255 unités dans son orientation et à ±86 unités de profondeur. L’annonce dure 1,25 seconde en phase 2 et 0,95 seconde en phase 3. La zone ne pivote pas pour suivre le joueur pendant ce délai. Sortir de son empreinte ou rompre la ligne de vue évite le coup. La garde ordinaire de Wolf ne le pare pas.

Après le balayage, une récupération de 1,65 seconde ouvre une fenêtre de dégâts multipliés par 1,3. Une charge réellement interrompue par un obstacle solide peut aussi étourdir le boss 1,55 seconde et l’exposer 1,8 seconde. Le bord abstrait de la carte ne donne pas cette récompense et les chocs ne peuvent pas la réappliquer à chaque image. Les PV maximaux et les armes disponibles ne sont jamais restaurés par ces ouvertures.

L’annonce active, ses coordonnées et la fin de la vulnérabilité passent par la sauvegarde filtrée. Un ennemi mort ne conserve pas de balayage. Les états de boss étrangers à la séquence sont rejetés. Les deux dispositifs du toit restent utilisables seulement avec les moyens effectivement disponibles ; le masque retiré ne revient pas pour permettre la pose.

## Économie, migration et reprise

Le format reste `tantalus.mire.avpr.v1`. Le bloc `v5` ajoute les stocks, numéros de balises, coordonnées, âges, lectures, dépôts nettoyés, dispositifs et compteurs tactiques. Les identifiants inconnus, coordonnées bloquées, doublons, quantités excessives, anciens chapitres incompatibles et fenêtres de boss incohérentes sont filtrés. Cette sauvegarde locale n’est pas un système anti-triche ou un serveur d’autorité.

Les sauvegardes 0.1, 0.2, 0.3 et 0.4 sans bloc v5 reçoivent la nouvelle dotation initiale : huit cellules et huit doses, sans inventer de relevé accompli. Ce sont des outils ajoutés par la mise à jour, pas une récompense acquise. Conserver l’export JSON original avant import ; une sauvegarde 0.5 n’est pas garantie compatible en sens inverse. Une ancienne partie déjà à la clairière y reste.

Les points de reprise transportent le même bloc tactique que l’état courant au moment de leur création. Mourir puis revenir à un point antérieur restaure un ensemble cohérent inventaire/monde ; cela ne fusionne pas le stock d’un coffre ancien avec une réserve ultérieure. Une reprise peut naturellement annuler une dépense effectuée après ce point.

Les aides de survie des transitions de chapitre sont héritées : minimum de 45 % de vitalité, au moins un kit et énergie rendue au changement de protagoniste. Les quinze coffrets finis et leurs reliquats restent globaux ; les anciens points de fournitures conservent leur fonctionnement par séquence. La 0.5 ne prétend pas rééquilibrer toute cette économie.

## Systèmes conservés et interfaces

La profondeur jouable, la projection par les pieds, les liaisons réciproques, la navigation évitant les obstacles, les poursuites locales, les verrous, la garde, les combos, les armes, les soins, l’escorte, l’embarquement et le vol sont conservés. Les cinq annexes ont les mêmes deux raccords et commandes intérieures. Les douze appareils de diversion 0.2 gardent leurs deux usages par séquence ; ils sont différents des douze nouveaux dispositifs de combat.

Le dossier P est une consultation pausée, pas un inventaire déplaçable, un magasin ou un écran de progression. Il expose le stock réel et les lectures acquises. Les humains y consultent l’information sans pouvoir employer les outils de Wolf. Les interfaces tactiles sont adaptées à l’écran, mais une visée analogique tactile complète n’est pas ajoutée.

Le son synthétisé reste désactivé par défaut. Il reçoit de courts retours locaux pour les poses, scans, traitements et ruptures. La limite de vingt voix temporaires et la libération des nœuds sont conservées. Les tests valident l’exécution, pas une écoute sur matériel réel, un mixage professionnel ou une compatibilité de tous les navigateurs.

### Commandes

| Action | Commande |
|---|---|
| Déplacement / profondeur | Flèches ou positions ZQSD / WASD |
| Interagir / analyser / ouvrir | E |
| Prévisualiser et poser une balise | Maintenir Y puis relâcher |
| Récupérer une balise proche | U |
| Neutralisant de Wolf | N, rester immobile |
| Dossier tactique | P ou bouton Outils |
| Vision / camouflage | V / G, Wolf masqué |
| Attaquer / viser | Espace maintenu ou clic gauche / souris |
| Choisir une arme / recharger | 1–4 / R |
| Garde / charge plasma | B ou clic droit / maintenir T |
| Corps-à-corps / esquive | J / X avec une direction |
| Soin / escorte | H immobile / O |
| Fusée humaine / verrou | L / K |
| Plan / carnet / pause | M / I / Échap |
| Vol : altitude / allure / frein | ↑ ↓ / ← → / maintenir X |
| Sons synthétisés facultatifs | Pause → Réglages → Sons de terrain |

