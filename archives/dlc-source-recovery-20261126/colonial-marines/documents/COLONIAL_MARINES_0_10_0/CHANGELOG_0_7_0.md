# 0.7.0 — Échos de traque

Continuation de la 0.6.0, sans remplacement de moteur ou de registre de salles.

Ajouts : leurres lancés avec collision, signal local limité et distraction sélective ; mines posées, armement, fusible irréversible, souffle avec occultation/danger allié et récupération maintenue ; stocks distincts et deux produits Bug Hunt ; menu I et touches L/O ; détecteur à mesures de mouvement incluant les compagnons sans affiliation.

Sauvegardes : contrat tacticsVersion=1, identifiants et paramètres validés, nouveaux champs pour les seuls anciens formats reconnus, écritures V7 sans écraser V6. Les trois vraies fixtures 0.6 conservent leur salle, inventaire antérieur et état thermique. Les temps des dispositifs sont locaux à la salle active ; une pause ou une autre salle ne les fait pas progresser.

Corrections pendant la passe : une réserve de mines pleine ne bloque plus l’accès à l’objectif voisin ; l’état d’enquête cesse quand l’émetteur est détruit ; bruit du leurre émis à l’atterrissage puis périodiquement ; copie installateur étendue au module tactique et validation de toutes les ressources référencées. La fixture de navigateur attend la fin réelle de l’import asynchrone, au lieu de conclure avant son traitement.

Contenu inchangé : quinze chapitres, 85 salles, trois arènes, 42 familles de mobilier, 682 placements au total. Rendu vectoriel toujours provisoire, aucune coopération réseau ou intégration native parent. Les résultats actuels sont dans reports/ ; les anciens changelogs sont historiques, pas des preuves de cette version.
