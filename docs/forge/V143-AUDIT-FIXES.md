# V143 — correctifs après audit

Base cumulative : V142 `bef6c3036519b4a24d8a489a47745f0f6ab8280f`, descendant du main V141 `cf3d35422ebcb4e30d662ec6b3e2f4c52b5e54e8`. Les correctifs de la PR 8 sont conservés ; cette livraison ne demande pas une fusion automatique.

## Changements

Le service worker ne traite que des ressources statiques explicitement admises, de même origine. Les requêtes authentifiées, API, URLs avec paramètres, réponses privées/no-store, redirections et réponses HTML à la place d'un média restent hors cache. Les lectures de secours ne consultent que le cache de la version courante. Le nettoyage ne vise que les anciens caches `atf-` et ne touche ni localStorage ni les projets Forge. Les médias optionnels sont limités à 256 entrées ; les lots de préchargement à 12 URLs. Une installation incomplète échoue sans détruire le cache précédent.

Les modules du shell restent attachés à leur version installée. Une mise à jour attend la fermeture des anciens onglets : pas de prise de contrôle forcée en cours d'opération. Après une mise à jour, fermer tous les onglets du jeu puis rouvrir. Ce mécanisme protège les ressources applicatives ; il ne remplace pas l'authentification ou les règles serveur.

MIRE conserve tous les identifiants de campagnes et de paires. Douze sources ont une association explicite à un lieu existant, dont Aliens/LV-426, Resurrection/Auriga, Prometheus/LV-223 et Isolation/Sevastopol. Les 206 entrées comprennent 92 adaptations de cadre et 114 simulations originales pour les sources encore non examinées ou sans destination dédiée. Aucune n'est annoncée comme une campagne historique complète, un casting dédié ou une reproduction 1:1. Les objectifs et cartes restent procéduraux. Les associations ne prétendent pas représenter tous les lieux d'une œuvre. Une opération déjà engagée conserve son monde, son manifeste et ses dépenses ; seules les prochaines sélections utilisent le catalogue corrigé.

La version applicative devient 143.0.0 ; le schéma de sauvegarde reste 52. Le build inscrit le commit source, la date, l'identifiant de build, le nom de cache et un manifeste SHA-256 dans `build-info.json`. Le module de version distribué est généré depuis les mêmes données. Une CI sans SHA identifiable échoue. Le manifeste décrit les fichiers effectivement distribués ; son empreinte est une vérification d'intégrité, pas une signature de confiance ni une mesure des performances matérielles.

## Vérifications reproductibles

```sh
npm ci --ignore-scripts
npm run test:audit
npm run test:all
npm run check
npm run build
npm run check:built
```

`test:all` rassemble les fichiers des suites Node déclarées et déduplique les alias. La nouvelle CI tourne sur toutes les PR et les poussées sur main, y compris CSS, HTML et médias seuls. Elle récupère les médias complets, exécute les tests et les gardes, construit le jeu et vérifie le manifeste. Un banc Chromium contrôle le vrai worker avec des ressources HTTP synthétiques ; il ne constitue pas une partie du jeu. Un second parcours utilise le vrai paquet distribué et le script tactique existant, depuis les menus et la Forge. Ses limites demeurent celles du script : pas de manette physique, pas de campagne intégrale.

Les tests de sauvegarde utilisent le vrai SaveSystem avec un stockage mémoire : trois profils, nouvelle partie, quota, corruption, import/export, import conditionnel d'un profil inactif, reprise d'une opération MIRE historique et conservation des projets Forge. Ils ne valident pas les politiques d'une base distante.

## Périmètre restant

Cette passe ne complète pas les illustrations, animations, campagnes, IA spécifiques et fonctionnalités de Forge narrative signalées dans l'audit. Elle n'affirme aucune fidélité visuelle 1:1. Elle ne fusionne pas de PR, n'efface pas de sauvegarde utilisateur et ne modifie pas la base cloud.

Les artefacts CI historiques ne contiennent qu'une partie des médias. Un échec local ENOENT sur ces fichiers absents ne doit pas être présenté comme un bug du jeu. Les résultats complets doivent être lus dans la nouvelle CI et associés à son SHA exact. Le navigateur local de l'environnement de travail peut être bloqué par sa politique ; aucun contournement n'est requis ou utilisé.
