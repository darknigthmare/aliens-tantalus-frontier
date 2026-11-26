# Développement 0.8 — erreurs rencontrées puis corrigées

- Décalage de refroidissement au tick de repli : déplacer le tick du système logistique pour ne pas appliquer un double refroidissement ; test de conservation ajouté.
- Premier script de défense mobilité : nom incorrect de méthode du moteur (requestSentryPack au lieu de packSentry), corrigé dans le script de test sans changer le moteur.
- Premier trajet de cet agent : destination occupée par un acteur, refus normal du moteur. L’agent choisit un autre sol par déplacement réel, au lieu de modifier une position ou de forcer une pose.
- Ancien intitulé Bug Hunt resté dans l’interface : corrigé puis page reconstruite, suites navigateur relancées.

Les échecs initiaux ne sont pas comptés comme validations. Les rapports actifs correspondent aux derniers essais réussis, reliés aux sources par empreintes. Les historiques 0.7 et antérieurs restent séparés.
