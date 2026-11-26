# 0.5.0 — Périmètre hostile

## Ajouts effectifs

Bug Hunt solo dans Engine/Renderer/UI existants : trois arènes originales, trois secteurs chacune, trente vagues, file finie, sept hostiles simultanés au maximum, annonces d’arrivée, crédits et dix produits. Cloisons physiques payantes, balises contestables, kits de sentinelle sur socles, plan du périmètre, tableau des records par arène/difficulté.

Troisième point de reprise `_hunt`, export groupé main/Stasis/Hunt, projectiles et annonce en vol conservés en défense. Reprise du résultat sans double victoire ; aucun déblocage narratif indu. 0.4 migre sans redémarrer une campagne ou écraser les anciennes clés.

## Corrections découvertes pendant les essais

La balise finale de la colonie était dans l’emprise d’une épave : déplacement hors collision, nouveaux tests de tous les postes. Les tireurs Bug Hunt tiennent compte des petits solides dans leur ligne de tir et leur navigation. Une fin de vague attend encore les projectiles hostiles. L’installateur copie désormais hunt.js parmi ses neuf ressources. Le menu de reprise indique le vrai nom d’arène et non la mission 1.

Un premier agent Vétéran a perdu à la vague 24, faute de réserves et d’utilisation des socles. La stratégie finale achète et déploie réellement les défenses ; pas d’assistance de santé ou crédits injectés dans la partie livrée.

## Conservation contrôlée

Quinze chapitres, 85 salles et leurs coordonnées profondément identiques à 0.4. Les 131 tests antérieurs et les quatre parcours sont rejoués ; 63 tests s’ajoutent. Cinq défenses complètes, deux suites Chromium (89 et 41), HTTP 11, documents 17. Les méthodes et limites sont dans le rapport.

## Non livré

Multijoueur, intégration native Tantalus, publication GitHub/Vercel, graphismes définitifs, reproduction 1:1 des cartes, persistance native certifiée. L’export JSON et le lancement autonome sont fournis ; Chromium a exécuté les octets en mémoire car la navigation locale est bloquée.
