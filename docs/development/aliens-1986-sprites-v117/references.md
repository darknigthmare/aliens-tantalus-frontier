# Références et limites — accessoires V117

Les trois PNG V115 publiés servent de références géométriques directes. Les sept fichiers V117 sont des éditions nouvelles de ces images : les sources sont conservées, les sorties du générateur sont copiées sans retouche de pixels. Les empreintes et les prompts exacts figurent dans le [journal de génération](generation-ledger.json).

## Portes

- [Ron Cobb — concepts de sas et salle d’opération, Propstore](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-colony-air-lock-and-operating-room-concept-sketches/) : vocabulaire architectural issu de la production.
- [Éléments de maquette de la baie d’amarrage du Sulaco, Propstore](https://propstoreauction.com/lot-details/index/catalog/386/lot/126558/Lot-470-Set-of-Sulaco-Docking-Bay-Model-Miniature-Components-ALIENS-1986) : référence de construction industrielle et de matériaux.

Ces sources ne donnent pas les cotes exactes du battant du projet. Les bosses, les deux barres boulonnées et la déchirure du panneau supérieur sont des adaptations des états de gameplay. Le dessin frontal, les montants et la ventilation centrale proviennent directement de `door-leaf.png` V115. Une brèche alpha réelle est présente dans l’image éventrée ; le passage physique demeure géré par le moteur existant.

## Caisses

- [Caisse Weyland-Yutani, Propstore](https://propstoreauction.com/lot-details/index/catalog/359/lot/119456) : plastique gris, poignée et aspect usé. Cette source n’atteste pas une caisse médicale identique à celle du projet.
- [Caisse de grenades M40 USCM, Propstore](https://propstoreauction.com/lot-details/index/catalog/462/lot/179442/17-USCM-M40-Grenade-Case-with-Grenade-ALIENS-1986) : finition olive mate et peinture écaillée. Les caisses génériques de ravitaillement du jeu ne reproduisent pas ce conteneur précis.

La forme nervurée, la poignée noire, les deux verrous et l’angle de vue viennent de `supply-case.png` V115. Les couvercles des états vides sont rabattus bas pour conserver une taille utile comparable dans la boîte de rendu de 76 × 44. La plaque médicale est déplacée du couvercle vers la face avant pour rester lisible lorsque la caisse est ouverte : c’est un choix du projet, pas un détail attesté du film.

## Plateau du Sulaco

- [Entretien avec Cynthia Scott, AVP Galaxy](https://www.avpgalaxy.net/website/interviews/cynthia-scott/) : témoignage de la comédienne sur les dim sum à pâte de riz et les confiseries gélifiées utilisés lors du repas.
- [Polaroid de continuité du repas, collection Harry Harris](https://harryharris.com/pola05.htm) : contexte de la scène et de ses interprètes ; cette page ne constitue pas un relevé métrique d’un plateau.

Le plateau à cinq compartiments vient de `meal-tray.png` V115. Le type de raviolis et de gelées s’appuie sur le témoignage ; la petite portion de cornbread, les quantités, les couleurs et la répartition exacte restent une interprétation pour le jeu. Aucune assiette précise du film n’est revendiquée comme modèle 1:1. La sortie mesure 1 671 × 941, contre 1 672 × 941 pour la référence ; le cadrage est contrôlé visuellement, sans promesse d’identité pixel à pixel.

## Statut de fidélité

Chaque entrée garde `filmFidelityValidated: false`. Une comparaison avec les références du projet, un alpha mesuré et un affichage correct dans Canvas valident une intégration de sprite ; ils ne certifient pas une reproduction exacte du film. Chaque fichier représente un état statique, pas un cycle animé.
