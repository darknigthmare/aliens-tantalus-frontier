# V0.8.0 — Les mémoires du Marion

Base cumulative V0.7.0 du 29 septembre 2026. Les 38 pièces, 49 connexions, 16 chapitres, 48 objectifs et huit gestes facultatifs sont conservés.

## Ajouts

Douze séquences facultatives à trois tableaux chacune. Cadrages et effets réalisés dans le rendu existant, textes originaux, état de scène séparé du monde actif. Galerie déverrouillée selon la progression, lecture manuelle/automatique et sous-titres à trois tailles. L’ouverture automatique se diffère devant un danger.

P : entrées réelles de chapitre, avec instantané de ressources/monde et vignette du moteur. Relecture dans une session de répétition indépendante, nommée dans le HUD, avec sauvegarde, import simple, point de reprise et export distincts. Le retour restaure le carnet principal ; la répétition peut se poursuivre au-delà du chapitre initial sans l’écraser.

Export/import confirmé de MEMOIRES_MARION_V08.json : campagne, répétition et entrées. Validation avant écriture, restauration tentée en cas de panne d’écriture, limites de taille et d’identifiants. Aucun accès aux clés d’un autre DLC. Pas de cloud ni de garantie multi-onglets.

Bilan distinct de chaque session. Quatorze nouvelles fiches, pour 202. Schéma 8 acceptant les états 1 à 8 ; quatre nouveaux instantanés authentiques V0.7 portent le registre de migrations à 28.

## Corrections

Le point de reprise ne se réécrit plus à chaque image après le dernier objectif : la comparaison normalise l’absence d’objectif. L’avertissement d’échec de sauvegarde ne reste plus affiché après une reprise réussie. Filtrage des miniatures de chapitre ; imports d’entrées incohérentes refusés. Un état chargé depuis une ancienne version ne lance pas en rafale toutes ses séquences passées. Sélection des champs médicaux ajustée dans le tableau narratif, sans protocole médical réel.

L’export complet utilise l’état courant de la session même si le quota empêche sa sauvegarde locale. Une erreur de copie préalable à la migration ne fait plus ignorer un carnet valide : il est chargé, avec un avertissement explicite.

## Preuves et périmètre

Toutes les suites héritées sont réexécutées sur V0.8. Les 87 anciennes scènes sont recapturées, seize vues nouvelles ajoutées. Trente-six tableaux passent les essais graphiques. Les pannes de sauvegarde et d’import sont injectées dans un double explicite de stockage mémoire ; persistance native et lancement double-clic non certifiés. Aucune fusion native au dernier hôte, aucun push ni déploiement.
