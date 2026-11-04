# Proposition documentaire Alien_base PR7

Ce paquet conserve une proposition de source, sans la brancher au client de Tantalus. Il ne remplace pas le résolveur canonique choisi pour les autres propositions Alien_base.

La source exacte est `darknigthmare/alien_base`, commit `311f7a367825fc115ad45b3772255cdfb7cc056c`, PR7 encore ouverte et en conflit lors de la revue du2 novembre 2026. Les quatre SHA-256, tailles et identifiants Git des fichiers JSON, ESM, schéma et correspondances sont conservés dans `data/ALIEN_BASE_PR7_PROVENANCE_V1.json`. Le JSON original de88 fiches / 22 sources reste intact dans `data/ALIEN_BASE_PR7_REGISTRY_V1.json`.

Les15 correspondances locales sont des propositions exactes :12 profils référencés par le roster AFE2 et3 véhicules déjà présents. Leurs cibles canoniques restent nulles. Aucune recherche par traduction, préfixe ou ressemblance ne crée de correspondance. Les35 statuts du roster, les178 armes, les véhicules et les sauvegardes restent hors de ce paquet.

L’œuf visuel d’Aliens 1986 ne devient pas une variante d’Alien 1979 : sa proposition demeure `pending-work-specific-proof`. Pour le M579, la vue proposée emploie `licensed-book`, établi par la source du Technical Manual ; l’ancien libellé RPG reste visible dans le correctif documentaire et le JSON original n’est pas réécrit. Le camion Covenant reste un concept de production, pas une géométrie finale certifiée.

Le lecteur Node clone les données puis gèle récursivement leurs enfants, même si les tableaux d’origine étaient déjà gelés. Il refuse toute activation, modification des empreintes, fermeture de QA ou cible canonique ajoutée. Il n’importe aucune donnée dans `src/`, ne contacte aucun dépôt en ligne et ne modifie ni gameplay ni Save.

Vérification :

```sh
node --test --test-concurrency=1 scripts/verify-alien-base-pr7-proposal-v1.mjs
```

Ces fichiers restent des outils et documents de dépôt, exclus de la distribution publique par l’architecture du build. Une éventuelle admission source doit rester limitée à leurs chemins exacts. Aucun ajout au service worker, à `src/content.js`, au roster ou à un catalogue de combat ne fait partie de cette proposition.

Une fusion future de la référence et un rapprochement explicite avec le résolveur unique restent nécessaires avant toute connexion documentaire active. Les129 propositions d’armes sont toujours des exports circulaires de Tantalus sans nouvelle preuve individuelle ; les57 recettes QA et les validations artistiques 1:1 ne gagnent aucune fermeture par ce paquet.
