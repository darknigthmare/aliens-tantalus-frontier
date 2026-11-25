# Adaptations de non-régression V0.10

Les suites historiques ont été réexécutées sur la version courante. Les ajustements de contrat suivants ne constituent pas la suppression d’une vérification :

- Version et schéma : 0.10.0 / 10 ; schéma inconnu de refus déplacé à 11. La copie de migration en panne est injectée sur la clé effective `:backup-before-v10`.
- Graphe : 41 pièces / 52 connexions / 104 extrémités ; le trajet vers le Samson traverse désormais trois pièces physiques supplémentaires. Les nombres de transitions ont été recalculés à partir des parcours, non forcés dans le moteur.
- Fixture de première rencontre : `boarding` remplace `samson`, conformément à la correction du lieu. Les anciens noms de capture ou de scénario sont conservés comme identifiants historiques et ne prouvent pas un autre lieu.
- Welford et Powell rejoignent les pertes de l’événement du vestibule ; le contrôle de tableau d’équipage attend le nouveau nombre de pertes, pas leur réapparition.
- Test de trace de flamme : la fixture de joueur a été reculée hors de l’axe de Powell. La retenue du tir devant un équipier est testée séparément dans `verify-v010.mjs`.
- Les tests de combat V0.10 préparent des ennemis dans des pièces sans apparition normale. Le rapport l’indique. Les états préparés ne sont pas présentés comme des actions naturelles de campagne.

Les scripts gardent les tests de collisions, commandes, commandes tactiles, export/import, panne d’écriture, séparations campagne/répétition, tours complets, annexes et manutentions. Les sorties JSON courantes et leurs hashes sont agrégés dans RESULTATS_QA_V010.json. Les anciens fichiers RESULTATS_QA_V0x et les patchs historiques ne servent pas à calculer le total courant.
