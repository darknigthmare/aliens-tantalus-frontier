# 0.8.0 — Positions de repli

- Nouveau sous-système explicite `game/logistics.js`, utilisé par le moteur courant.
- Repli des sentinelles en veille, maintien E 2,8 s ; une identité unique posée ou portée.
- Structure, munitions, chaleur et origine conservées ; marche 100 u/s et mains occupées.
- Redéploiement E 2 s sur un sol dégagé, trois postes maximum, réactivation volontaire.
- Bug Hunt conserve ses trois châssis commandés ; aucun socle gratuit après déplacement.
- Clic droit / Y / sélection depuis Tab : position de sol pour O’Neal, chemin connecté, marche et maintien de position.
- Validation V8 stricte ; migration réelle de trois fixtures V7, sans reset ni nouvel équipement.
- Ligne de vue exigée pour rotation et recharge de sentinelle ; correction du refroidissement au tick du repli.
- 391 tests Node, 230 contrôles jeu Chromium répartis en cinq suites, 14 HTTP, 30 documents.
- Quatre campagnes complètes et huit défenses de trente vagues, dont une avec repli/marche/pose et ralliement arrivés.
- 57 captures du rapport, 150 règles de codex ; contenu fixe conservé.

Aucun push, déploiement, intégration native parent, asset commercial ou validation de persistance native. Chromium utilise set_content et Storage Map déclaré. Les agents ne sont pas des essais humains.
