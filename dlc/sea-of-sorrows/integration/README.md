# Installation facultative de la route autonome — 0.10.0

Ce script n’installe pas un adaptateur du moteur de Tantalus Frontier. Il copie le jeu autonome dans `dlc/sea-of-sorrows/` d’un dossier local possédant déjà un `index.html`. L’accueil et les sauvegardes du jeu hôte ne sont pas modifiés. Aucune publication distante n’est effectuée.

Depuis le dossier du DLC :

```sh
node integration/install.cjs "CHEMIN_DU_PROJET"
```

Le script refuse une destination inconnue, des liens symboliques ou des fichiers installés dont l’empreinte a changé. Répéter l’installation de la même version intacte est sans effet. Pour une version différente déjà présente : sauvegarder vos propres changements et exporter la partie avant tout retrait ; le script ne remplace pas automatiquement une autre version.

Pour retirer la route que l’installateur possède, sans toucher à l’index hôte :

```sh
node integration/install.cjs "CHEMIN_DU_PROJET" --uninstall
```

Le retrait vérifie le reçu et refuse si les fichiers sont modifiés, absents ou si d’autres fichiers ont été ajoutés dans la route. Les données du navigateur ne sont pas effacées par ce retrait local. Aucun menu hôte n’est raccordé : la route doit être ouverte explicitement. Les modules requis sont inclus, dont les commandes standard de manette ; leur compatibilité physique n’est pas certifiée par cet installateur.


La v0.9.0 ajoute `src/support.js` et `src/soundscape.js` à la route autonome. Les options et la copie de sécurité restent propres au DLC, sans écriture dans les données hôtes.

La v0.10 conserve les neuf modules et ne remplace pas automatiquement une route antérieure. Les deux nouveaux râteliers font partie des données embarquées ; aucune ressource hôte n’est demandée.
