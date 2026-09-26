# V90 — descriptions de comportements dans les interfaces

## Livré

Les cinq spécialisations partielles V89/V90 sont consultables dans l’encyclopédie et signalées dans BIOFORGE. L’encyclopédie recherche leur libellé humain, affiche le résumé, la note d’adaptation et un lien vers la source officielle Cold Iron. Les états techniques sont traduits : « Documentée, adaptation partielle », sans numéro de version affiché.

Le catalogue expose un champ normalisé `combatBehavior` tout en préservant `combatBehaviorV89` pour les trois profils historiques et `combatBehaviorV90` pour les deux nouveaux. Le choix prioritaire reste V90 puis V89. Aucun profil générique ou Altered ne reçoit une spécialisation inventée.

BIOFORGE lit seulement cette description : « EN MISSION — … · adaptation partielle. Non reproduit dans le labo simplifié. » Sa légende « Pose fixe · animations manquantes · comportement labo simplifié » reste inchangée. Le changement de sélection supprime les anciens libellés et liens. **Aucune IA du laboratoire, découverte, sauvegarde, statistique ou règle de population n’est modifiée.**

Les textes passent par `textContent` ; les liens utilisent exclusivement HTTPS sans identifiants intégrés, avec `noopener noreferrer` et `no-referrer`. Aucune source n’est interprétée comme HTML. Les poses natives restent entières et les statuts d’exactitude canonique ne sont pas promus.

## Tests

67 tests PASS / 0 FAIL : 15 nouveaux dans `tests/catalog-behaviors-v90.test.mjs`, plus 52 régressions catalogue et BIOFORGE. Vérifications des cinq rendus, priorité V90, recherche, immutabilité, références, neutralisation HTML, refus des protocoles dangereux, changement de profil et distinction mission/labo.

Smoke réel : `tests/browser-catalog-behaviors-v90.mjs`. Contexte Chrome privé, sauvegarde de fixture neuve, vrais composants et événements DOM input/change ; ce n’est pas un parcours de jeu complet au clavier. Les cinq fiches et cinq sélections BIOFORGE chargent leurs PNG natifs et leurs sources, plus un contrôle d’accessibilité réelle du lien mobile. 11 contrôles, cinq captures, zéro erreur console/HTTP.

Preuve finale : `E:/CodexQA/AliensTantalus/v90-campaign-20260923/catalog-browser-private/run05/report.json`. Captures ordinateur et BIOFORGE mobile inspectées dans run02 ; encyclopédie mobile finale inspectée dans run05. Les essais antérieurs ont corrigé uniquement le harnais (casse visuelle CSS, scroll lissé puis transition 200ms du rail mobile). Le test final attend un vrai hit-test positif du lien, pas seulement l’absence de débordement horizontal.

Pas de build complet, commit ou déploiement par ce sous-lot.
