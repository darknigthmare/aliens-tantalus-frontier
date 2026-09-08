# V77 — Rechargement tactique et audio optionnel

Lot implémenté à partir des conversations auditées #1 et #6. Les corrections de dialogue hub, Prowler et Ceto V76 sont conservées.

- Rechargement à seconde pression, normal/réussi/parfait/raté, fenêtres par famille et inventaire transactionnel.
- Bonus de parfait appliqué aux vrais tirs, plafonné et conservé exactement à la reprise J1/J2.
- Clavier, boutons tactiles au contact et deux manettes standard ; filtres de pause/focus/reconnexion.
- Exploit de conduit fermé : entrée physique = annulation sans transfert ; aucune fenêtre figée exploitable pour le joueur ou le coop.
- M41A du catalogue corrigé (chargeur 99) sans créer de munitions dans les anciennes sauvegardes ; les 142 autres statistiques d’armes restent à auditer.
- HUD personnel et moteur raccordés, sans prétendre livrer les animations dédiées encore absentes.
- Jauges redimensionnées pour conserver des textes lisibles sur mobile, et boutons tactiles sortis de la couche transformée que recouvrait le journal.
- Scanner/manifeste audio déterministe, formats optionnels, cache borné, vérifications MIME/HTTP/SHA, fallback synthétique et scènes/volumes séparés.
- Réglage Musique distinct restauré/sauvegardé ; arrêt des effets monde en sortie de mission et races mute/lecture différée corrigées.
- Service worker : manifeste léger précaché, sons à la demande, rejet HTML/206/404 et respect des Range.
- Inspection Echo-9 : divergence d’identité visuelle identifiée ; nouvelle génération bloquée avant création par l’accès local du générateur intégré.

La matrice conserve0DONE/15PARTIAL/11MISSING au niveau des26conversations. Aucun ennemi supplémentaire ni banque musicale définitive n’est compté comme produit dans ce lot. Voir `docs/VALIDATION_V77.md` pour les résultats réellement exécutés et la publication.
