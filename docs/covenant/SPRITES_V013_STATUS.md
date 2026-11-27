# Alien: Covenant — sprites V0.13

Le pack cumulatif contient **85 PNG originaux**, dont **24 nouveaux** dans ce lot. Les 61 PNG et les deux manifestes source V0.11/V0.12 restent inchangés. Le jeu admet **63 images** dans des états et emplacements précis ; **22 images** restent au catalogue.

**Les quatre profils jouables possèdent désormais un cycle de marche ordinaire de huit phases. La couverture globale des sprites et la fidélité identique à 1:1 ne sont pas certifiées.** Un profil désigne ici une apparence : les trois tenues de Daniels et David dans le prologue ne sont pas quatre personnages différents.

## Les 24 nouveaux PNG

| Profil | Images | Portée de la marche ordinaire |
|---|---:|---|
| Daniels, tenue d’expédition | 8 | 43 salles utilisant réellement ce profil |
| Daniels, combinaison EVA | 8 | `lifter`, `cargo`, `sailaccess` |
| David, première activation | 8 | `whiteroom`, tableau indépendant du prologue |
| **Ajouts V0.13** | **24** | **Trois nouveaux cycles complets** |

Le cycle de Daniels en tenue de travail, livré en V0.12, garde ses huit images et ses sept salles. Les quatre cycles couvrent les **54 emplacements où la marche ordinaire est possible** : 53 salles de campagne et le tableau du prologue. Les trois galeries `coolantduct`, `filterduct` et `freightduct` restent des espaces de rampement.

Le cycle suit le temps existant et le déplacement effectif du joueur. Il est réservé à la marche mains libres, au sol et sans action particulière. Les huit images d’un cycle doivent être décodées avant son utilisation ; une phase absente conserve le rendu procédural pour ce cycle. Une panne d’un profil ne désactive pas les autres. La course, le port d’une arme, les sauts, le rampement et les actions spéciales conservent leurs états existants.

Le prologue reste un tableau séparé. Il n’ajoute aucune connexion géographique au vaisseau et ne réécrit pas la campagne.

## Catalogue et fichiers

Décompresser le ZIP en conservant ses dossiers, puis ouvrir `index.html`. Le catalogue contient recherche, catégories, filtres de disponibilité, fiches détaillées et fonds sombre, clair ou damier.

Le panneau animé permet de choisir les quatre cycles, de lire ou mettre en pause, de ralentir, de sélectionner chacune des huit phases et de changer de direction. L’échelle reste constante à l’intérieur d’un cycle. L’aperçu adapte son agrandissement à la combinaison EVA pour garder casque et bottes dans le cadre. Une réponse de chargement tardive d’un ancien choix ne peut pas remplacer les images du cycle sélectionné.

- `sprites/` : les 85 PNG originaux, sans recadrage ni recompression.
- `manifest.json` : les références, prompts exacts, limites, géométrie et empreintes cumulés.
- `provenance/` : les trois manifestes de production exacts.
- `coverage.json` : inventaire complet des profils, familles, occurrences, états couverts et manques.
- `QA.json` : contrôles des PNG et portée des vérifications exécutées.
- `runtime-sprites.json` : les admissions effectives du jeu.
- `SHA256SUMS.txt` : empreintes des PNG originaux.
- `APERCU_NOUVEAUTES.jpg` : planche dérivée des 24 nouvelles phases, destinée à la revue.

Le pack est reproductible avec `scripts/package-covenant-sprites-v013.py`. Une liste explicite limite les fichiers archivés. Un ancien reçu CI est retiré lorsqu’un réemballage ne fournit pas de nouveau reçu ; les fichiers étrangers au pack ne sont pas inclus.

## Références et limites visuelles

Les nouvelles poses utilisent les sprites de référence V0.11 comme modèles d’identité et de costume. Certaines phases emploient aussi une pose déjà sélectionnée pour guider l’ordre des membres. Ces références générées sont distinguées des références du film dans chaque fiche.

Daniels en expédition conserve l’anorak gris, le harnais, le sac bordeaux, la couverture roulée et la caméra d’épaule. La tête nue et les détails non visibles héritent des limites de la référence V0.11. La tenue EVA conserve la combinaison souple argentée, le harnais olive, le casque sombre, la fenêtre claire, la visière verte relevée et la lampe supérieure. David conserve sa tenue technique blanche, sa coiffure courte et la présentation pieds nus déjà retenue ; les pieds et les parties non visibles du costume restent partiellement reconstruits.

Les appuis opposés, les deux bras, les deux jambes et les silhouettes complètes ont été revus sur des planches composées avec l’alpha réel. Trois essais d’expédition et deux essais EVA ont été écartés pour des défauts de pose ou d’anatomie, puis corrigés par génération. Les instructions et les itérations sont consignées dans le manifeste.

De petites variations de visage, de plis, d’équipement et de rotation du torse restent visibles. Les trajectoires des bras et les contacts des pieds sont approximatifs ; les passages de David gardent le pied libre assez en arrière. Les phases ne proviennent pas d’une capture de mouvement du film. Les pivots pelviens sont des estimations de présentation, et non des mesures anatomiques certifiées.

Les métadonnées V0.13 utilisent le même seuil inclusif `alpha >= 32` que le rendu. Deux bornes d’un pixel ont été harmonisées, dont celle qui détermine la hauteur de David en phase 04. Aucun pixel original n’a été modifié.

## Couverture réelle et manques

| Mesure | État cumulatif |
|---|---:|
| PNG présents et conformes à leurs empreintes | 85 |
| PNG utilisés dans le rendu | 63 |
| PNG au catalogue seulement | 22 |
| Associations distinctes de profil, objet et état | 35 |
| Profils humains avec une pose neutre | 23 / 23 |
| Profils jouables avec un cycle de marche | 4 / 4 |
| Emplacements de marche ordinaire couverts | 54 / 54 |
| Autres profils de l’inventaire sans cycle de marche | 19 / 23 |
| Profils jouables sans cycle PNG de course | 4 / 4 |
| Familles candidates d’objets du film avec PNG direct ou variante liée | 15 / 50 |
| Familles candidates avec une occurrence admise dans le jeu | 13 / 50 |
| Images certifiées identiques à 1:1 | 0 |

Les cycles des autres profils, les courses, les actions et les animations de déplacement des créatures restent incomplets. Les accessoires n’ont pas été augmentés dans ce lot. Le registre distingue les 126 familles et 630 occurrences, y compris les structures, mécanismes, effets et adaptations de gameplay : le nombre d’occurrences sans PNG ne représente pas autant d’objets du film à générer.

Les sept familles d’armes, les deux poses du xénomorphe et la statue restent absentes. Les refus documentés concernent cinq armes, le xénomorphe et la statue ; les sujets apparentés n’ont pas été relancés. Les autres objets dont les références restent insuffisantes sont détaillés par identifiant dans le registre de couverture. Aucune génération refusée antérieurement n’a été contournée dans cette passe.

## Vérification et intégration

Les **47 tests de contrats et d’intégration Covenant** passent sur les fichiers de ce lot, ainsi que les **19 contrôles de succession des audits**. Ils vérifient les quatre cycles, leurs états autorisés, les deux directions, les exclusions, l’absence d’écriture dans l’état du jeu, l’échelle commune, les cycles incomplets, les 39 admissions V0.12 conservées et la distribution autonome.

Les 24 nouveaux PNG ont une transparence réelle et une silhouette entièrement cadrée ; aucun pixel de bord ne dépasse l’alpha 16. L’audit cumulatif contrôle les empreintes et les dimensions des 85 originaux. Les deux anciens manifestes restent épinglés à leurs SHA-256 exacts ; le manifeste V0.13 possède son propre chemin et son propre hash. Les manifestes de production et les PNG de catalogue sont exclus de la distribution publique.

Aucun succès Chromium local n’est revendiqué. La CI dédiée de cette version exécute les contrôles du jeu et du catalogue. Le parcours d’ouverture de campagne reste distinct des scènes préparées pour Daniels en expédition et en EVA. David est ouvert par le bouton public du prologue ; sa marche et la conservation de la campagne font l’objet de contrôles séparés. Les résultats exacts du commit sont liés à la [PR 71](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71), puis joints au pack final dans `validation/CI_V013.json` lorsqu’ils sont disponibles.

Les succès V0.12 ne sont pas additionnés aux résultats V0.13. La PR reste en brouillon ; aucune fusion ni mise en production n’est effectuée par cette livraison.
