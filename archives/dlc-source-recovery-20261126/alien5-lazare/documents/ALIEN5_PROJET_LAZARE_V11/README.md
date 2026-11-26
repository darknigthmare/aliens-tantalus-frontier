# ALIEN 5 — PROJET LAZARE
## V11 · Red Harvest / Traces retrouvées · 2.0.0-candidate.1

### Jouer
Ouvrez `ALIEN5_PROJET_LAZARE_JOUER.html`. La version autonome n’utilise aucune dépendance réseau. Le dossier `game/` contient la version modulaire.

### Contenu cumulatif
- 68 lieux reliés par 95 connexions réciproques ; 190 extrémités possèdent un support architectural.
- 12 chapitres, 27 objectifs principaux, relais de Newt, P-17, M-4, S-12, extraction jouable et sauvegardes manuelles conservés.
- 26 entrées de matériel/installations, 14 identités et 43 références de provenance.
- Huit lieux V11 : mercenaires, baie Jax/Killson, Comanche, Montero, charges corrosives, laboratoire synthétique, incident Johnson/Jax et concourse des affiches.
- Prototype biomécanique utilisable comme quatrième arme ; 6 charges engagées + 18 en réserve, sans réapprovisionnement standard.

### Fidélité
La V11 vise une meilleure fidélité de couverture, mais ne revendique pas une adaptation 1:1 du film non réalisé. Sur 43 références suivies, 42 restent des interprétations partielles et une demande un approfondissement. Aucun scénario intégral authentifié n’est fourni. Les raccords, dimensions, dialogues et mécaniques de Calder restent des créations du jeu.

### Architecture et QA
L’audit V11 exécute 994 contrôles d’architecture : 68 lieux uniques, 95 liens uniques, réciprocité, supports de portes, approches des interactions et comparaison des états d’autorisation avec la V10. Quatre parcours cumulés terminent la campagne en Récit/Survie, standard/rationné, en visitant 68 lieux et 112 transitions. Chromium rend les 68 pièces et les menus sans exception JavaScript.

### Sauvegardes
La clé V11 est `atf.alien5.lazare.v11`. Les anciennes clés V1–V10 ne sont pas écrasées. Des fixtures réelles V1–V4 et un export V10 ont été relus par le moteur V11. La persistance native après fermeture du navigateur n’est pas certifiée ; l’export JSON reste la copie portable recommandée.

### Intégration Tantalus
L’installateur est additif et réversible : il ajoute uniquement un lien de lancement et sa propre page. Le moteur natif, le registre MIRE et les sauvegardes de Tantalus ne sont pas fusionnés. Aucun push GitHub ni déploiement Vercel n’est effectué.
