# Xeno Trials V149 — HUD, lecture des trajectoires et réactions des arènes

Base : `bc6241b4e775b02e3459f5f8cf95efad93de7545`, PR9,
branche `fix/audit-hardening-v143`. Aucun changement de main.
Version applicative 143.0.0 ; sauvegardes 52 ; dépendances inchangées.
Les cinq supers et signatures V147/V148 sont conservés, pas recomptés comme nouveaux.

## Jauge invisible reproduite puis corrigée

La recette globale de départ échouait sur la visibilité de la jauge du Warden.
L'image de l'artefact montrait son texte mais pas sa barre. Un banc Chromium de
mise en page a reproduit `hidden=false`, `display=block`, **hauteur=0px**.
La règle historique `.xt-match-hud progress { height:100% }` prenait le dessus
sur la hauteur optionnelle et dépendait d'une ligne implicite sans hauteur fixée.

La barre de super a désormais une hauteur/minimum intrinsèque de **5px**, avec
une spécificité supérieure, et des couleurs natives Chromium/Firefox distinctes
de la santé. Le comportement `[hidden]` reste inchangé pour les non-pilotes.
La fixture corrigée produit un rectangle de cinq pixels de haut, pas un simple
changement du texte ou du test de visibilité.

Le parcours des cinq signatures vérifie ensuite la géométrie du HUD du vrai jeu
à 1440×1000, 390×844 et 844×390. Il attend la notification effective de la dépense
avant de lire la valeur HTML. Aucun style de capture, jauge, santé, horloge ou
résultat n'est injecté dans ce parcours. Les viewports ne sont pas des appareils physiques.

## Contre-jeu des trajectoires

L'ancien observateur ne signalait une menace que lorsque le projectile se trouvait
*déjà* à hauteur du corps. Une projection acide descendante pouvait donc être
ignorée alors que sa trajectoire traversait le défenseur quelques instants plus tard.

Le cerveau utilise l'intersection de segment avec le corps actuellement observé,
comme les collisions du moteur. Horizon par défaut : 0,5 seconde de simulation,
limité par la durée de vie du projectile. Un tir ami, expiré, passant au-dessus,
repartant en sens opposé ou arrêté avant le contact ne devient pas une menace.
Les projectiles historiques gardent leur couloir horizontal et leur marge propre.

Il ne s'agit pas d'une lecture des futures commandes : aucune position future du
joueur n'est prédite. Les probabilités de défense, erreurs, cadence de décision,
endurance et dégâts restent régis par les systèmes existants.

## Six motifs de décor réactifs

| Arène existante | Motif ajouté aux transitions |
|---|---|
| Containment Deck | Voyants de scellement |
| Reactor Ring | Vannes de refroidissement |
| Hive Vault | Filaments d'observation |
| Tantalus Bridge | Moniteurs d'évaluation |
| Tantalus Cargo | Guides de baie |
| Planet Surface | Balises de périmètre |

Les motifs distinguent introduction, entre-manches et résultat final, en lisant
les états existants. Le signal de première manche est **récupérable** : aucun
finisher, changement d'organe ou retrait irréversible du combattant n'est déclenché.
Le côté gagnant ou l'égalité se lit sur les deux petits éléments arrière-plan.
Les dessins sont coupés au sol, avant les combattants, sans flash plein écran,
sans overlay supplémentaire, collision, dégâts, gain ou boucle RAF indépendante.
La pause gèle leur état ; le mouvement réduit utilise une pose fixe de transition.
Le résultat final reste dans la boucle de rendu arrêtée du moteur actuel.

Ces motifs sont **originaux à la simulation**. Ils ne sont ni des scènes de film
certifiées, ni des animations articulées des personnages, ni 18 nouveaux clips.
Intros/outros des combattants, poses R1 dédiées et finitions terminales restent ouverts.

## Tests et suivi

`npm run test:trials:feedback` : **31 tests**, dont une validation documentaire.
Cas de trajectoires, miroir, durée de vie, restrictions et observation du cerveau ;
six identités de stage ; distinction R1/résultat ; pureté de rendu ; mouvement réduit ;
parcours du vrai runtime dans un hôte déterministe de première présentation à la
fin du match ; CSS et empreintes du suivi Excel.

Les fixtures moteur et le banc local de mise en page sont séparés des parcours du
paquet complet dans Chromium. Aucune réussite globale de CI n'est présumée par ce
fichier : consulter les workflows attachés au commit final de la PR.

`XENO_TRIALS_SUIVI_V149.xlsx` : sept feuilles, 189 IDs, six compteurs calculés,
corrections, six arènes, recette, références et lots artistiques ouverts.
`progress-v149.json` épingle ce fichier et le suivi V148 conservé. Les documents
sont autorisés par chemins exacts dans les sources, jamais dans le paquet du jeu.
V146, V147 et V148 restent inchangés. Zéro nouveau kit 1:1 approuvé.

Référence technique consultée le 17 octobre 2026 :
https://playwright.dev/python/docs/api/class-locator
Les références de capacités héritées sont dans le suivi V147/V148 ; cette passe
n'attribue pas de capacité biologique nouvelle ni de canon à une animation de décor.
