# Reprises de validation de la candidate

Les premiers essais ont été conservés séparément hors de l’archive publiée. Les erreurs corrigées incluent la récursion d’un appel de dessin de personnage, l’état imbriqué de checkpoint qui perdait les acquisitions 0.10, le rappel incorrect de shuriken lors d’un chapitre refusé, et le signalement de résultat incomplet d’un harness navigateur après exception.

Les valeurs attendues de version, nombre de lieux et nombre de fiches ont été mises à jour dans les tests historiques, après comparaison explicite des données. La liste des 225 changements de référence est dans `docs/FIDELITY_CHANGES.json`. Les autres attentes demeurent vérifiées. Les contrôles clavier de tir utilisent une pression maintenue 90 ms : une impulsion press/release sans frame de simulation pouvait être absente de la boucle de tir.

La revue des images a corrigé la signalétique Maternity/Nursery, la silhouette du compartiment blindé, les regards extérieurs descendants et les façades trop plates. Les journaux de référence 0.9 et les anciennes descriptions ne remplacent pas le rapport de cette candidate.

Seuls les rapports dont l’empreinte correspond au HTML final alimentent les nombres courants. La validation demeure automatisée et l’audit filmique n’est pas exhaustif.
