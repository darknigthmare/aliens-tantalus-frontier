# Intégration locale — v0.7.0

Aucune intégration native n’est effectuée. L’installateur copie le HTML autonome et ajoute un accès depuis le menu d’une copie locale compatible de Tantalus. Il ne modifie pas GameEngine, MIRE, le registre natif de missions ou les sauvegardes de l’hôte.

Node >=20. Un dossier avec index.html et une structure de menu reconnue est requis. Toujours utiliser une copie locale contrôlée du projet.

```sh
node tools/install.mjs --target /chemin/du/projet
node tools/install.mjs --target /chemin/du/projet --apply
node tools/install.mjs --target /chemin/du/projet --upgrade
node tools/install.mjs --target /chemin/du/projet --upgrade --apply
node tools/install.mjs --target /chemin/du/projet --rollback --apply
node tools/install.mjs --target /chemin/du/projet --remove --apply
```

Sans `--apply`, aucun fichier n’est modifié. Le retour restaure uniquement une version dont les fichiers sont présents et intacts. La chaîne v7 → v6 → v5 → v4 → v3 → v2 → v1 a été testée sur des copies temporaires. Elle dépend des versions réellement sauvegardées lors des installations antérieures. Un rollback n’invente pas une copie manquante et ne reconvertit pas les sauvegardes JSON.

Les liens symboliques, chemins suspects, fichiers tiers et modifications non reconnues sont refusés. Les nouveaux contenus de l’hôte non liés au lien DLC ne sont pas écrasés lors du retrait. Aucun de ces tests n’a écrit dans le dépôt de l’utilisateur.

Le raccord natif restant demanderait les sources exactes de l’hôte, un adaptateur SaveSystem, l’enregistrement de campagne et des tests sur ce moteur réel. Aucun push ni déploiement n’est inclus dans cette livraison.
