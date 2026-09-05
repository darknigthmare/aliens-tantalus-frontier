# Revalidation runtime V72.1

Commande réelle : `npm test` (`node --test tests/*.test.mjs`), après intégration du K-Series020 et des contrôles de lecture à côté du portrait.

Sortie finale du 5 septembre 2026 :

```text
tests 999
suites 0
pass 998
fail 0
cancelled 0
skipped 1
todo 0
duration_ms 16704.103
```

La suite inclut les six profils V66 acceptés, leurs cellules/identités/physique, le calage d'impact propre au clip, l'impact unique, le chargement paresseux, les annulations, niveaux, sauvegardes et contrôles PWA. Le test ignoré concerne les liens symboliques de l'environnement.

Lint :286modules valides. Build72.1.0 :3450entrées catalogue, réussi.

Les runs précédents de mise à jour des assertions ont échoué sur leurs anciens compteurs, le précédent cache et le timing commun5/12. Les assertions ont été adaptées explicitement au nouvel unique profil, sans affaiblir les gardes des variantes ni modifier les snapshots historiques V55.

Le navigateur local a parcouru les32poses réelles du K-Series020, avec une seule identité et un seul fichier, puis conservé la pose de mort31. Résultats détaillés dans `browser-clips.json`. La recette automatisée n'est pas une certification d'un playthrough de toutes les campagnes.
