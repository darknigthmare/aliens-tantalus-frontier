# V0.3.0 — Ne restez pas derrière

Base cumulative : V0.2. Les 34 pièces, 40 liaisons et 48 objectifs sont conservés.

## Comportements
Trois séquences de suivi : Baxter au refuge (22 ≤ objectifs achevés < 24), Hoop dans l’épave (24 ≤ n < 29), Ripley au retour (31 ≤ n < 35). Ordre G et commandes UI suivre/attendre, contournement des meubles, attente aux fuites, franchissement par la même porte, position et ordre conservés dans l’export. Aucun doublon avec les présences statiques. Pas de santé indépendante du compagnon.

Neuf renfoncements de dissimulation ; entrée refusée en vue directe et pendant les portages. Sortie par déplacement/action ou inspection rapprochée de la créature. Éclairage local, posture, lampe et bruit influencent la détection. Mémoire locale de recherche et navigation par graphe de visibilité. Préparation d’attaque de 0,62 s pour l’adulte et 0,36 s pour le facehugger ; recul ou flamme avant résolution.

## Lisibilité et monde
Plan limité aux pièces visitées et aux seuils observés. Sept familles graphiques ajoutées, 19 placements explicites supplémentaires : 46 types, 268 placements. Réserves ouvertes/vides après collecte. Animations de marche des compagnons et indication de leur ordre. Variante organique des niches dans l’épave. Éclairages visibles liés aux mêmes coordonnées que le calcul de détection.

Une réserve et deux cachettes ont été reculées des portes après revue visuelle. Contrôle de dégagement supérieur à 150 unités pour toutes les réserves/cachettes. Mode paysage à faible hauteur corrigé : pied complet, pas de débordement horizontal. Options de mouvement ambiant réduit et lisibilité renforcée.

## Sauvegarde et livraison
Schéma 3, import 1/2/3, même clé de carnet. Copie du premier ancien carnet avant conversion ; nouveau point de reprise après import/nouvelle partie. Upgrade de lanceur réversible avec backup before-v03. Version de package et métadonnées synchronisées.

## Preuves
188 contrôles Node et 76 contrôles Chromium, 36 captures réelles. Deux parcours complets scriptés ; 90 contournements d’obstacles et huit trajets d’annexes aller-retour. Chromium bloque les ouvertures natives HTTP/fichier ; tests UI par set_content et double mémoire de localStorage. Pas de certification de double-clic, persistance native, playtest humain ou moteur hôte complet. Aucun push/déploiement.
