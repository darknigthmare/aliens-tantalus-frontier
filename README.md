# ALIENS: TANTALUS FRONTIER

Version web jouable **v51.0.0**. Cette release transforme le contrat v1→v51 en une boucle persistante : préparer l'opération à bord du Tantalus, équiper Echo-9, jouer la mission, subir ou rapporter ses conséquences, résoudre les crises physiques du vaisseau, puis repartir avec un monde modifié.

Jouer en ligne : [aliens-tantalus-frontier.vercel.app](https://aliens-tantalus-frontier.vercel.app)

## Lancer localement

```powershell
npm.cmd run dev
```

Ouvrir `http://127.0.0.1:4173`.

## Boucle désormais effective

- Commandement : décisions datées, ressources, recherches, modules, journal et pression de crise persistants ; la diplomatie avance l'horloge, applique une transaction unique puis verrouille le canal jusqu'à son cooldown.
- Préparation : achat, inventaire, arme, équipement à charges, véhicule, équipage, soins, costume, dossier Apex et profil Neuro-Xeno.
- Opération : géométrie issue du monde/campagne/Forge, danger, difficulté, rencontres contextuelles — reine comprise uniquement lorsque la campagne exige une ruche/reine —, combat, furtivité, véhicule, pertes, extraction et récompenses.
- Seize contrats physiques : sauvetage, atmosphère, ruche, boîte noire, escorte, purge, abordage, défense, traque Apex, synthétique, capture, relais Neuro-Xeno, protection, conduits, véhicule et fuite.
- Hub : navigation Canvas, portes, ascenseurs, PNJ, objectifs et crises xénomorphe, synthétique ou pathogène neutralisées dans le niveau avant résolution stratégique.
- Frontier Forge : validation, annuler/rétablir, sauvegarde/import/export et playtest réel des tuiles mission ou vaisseau.
- Conséquences : ressources, équipage, état des mondes, routes, factions, crise et progression restent après rechargement.
- Reprise native : l'opération recharge checkpoint, joueur/coop, mission et objectifs, inventaire/tracker, portes/conduits, ressources ramassables, ennemis et drops, véhicule, charges d'équipement et état Neuro-Xeno. Les identifiants sont recoupés, les nombres bornés et aucun projectile n'est sérialisé ou recréé ; un ennemi mort ou un pickup pris ne peut donc pas être refarmé après rechargement.
- Logistique durable : récupération industrielle, récupération de mission et commerce diplomatique peuvent renouveler le carburant ; une campagne n'est pas condamnée par une réserve finie sans source.

Les catalogues volumineux sont couverts par des adaptateurs systémiques testés. Cela signifie que chaque entrée influence le runtime par ses données ; cela ne signifie pas que des centaines de niveaux, IA ou plaques ont tous été fabriqués individuellement à la main. L'audit classe honnêtement les 27 promesses en **5 effectives**, **15 systémiques** et **7 partielles**.

## Contrôles

Mission joueur 1 :

- `A/D` ou flèches : marcher ; `W/S` : grimper ou traverser un conduit ; `Espace` : sauter.
- `F` : tirer ; `R` : recharger ; `Q` : tracker ; `E` : interagir/réanimer/neutraliser.
- `V` : entrer ou sortir du véhicule ; `H` : medkit ; `X` : contre-impulsion Neuro-Xeno si disponible.
- `P` ou `Échap` : pause ; `Entrée` : reprendre au checkpoint après un échec.

Coop locale : `J/L`, `I/K`, `U`, `O`, `Y`, `T`, `G`.

Hub : `A/D`, `W/S`, `Espace`, `E`, `C` pour s'accroupir et `F` pendant une crise. Les commandes tactiles restent sous la scène en portrait.

## Contenu conservé et consommé

| Catalogue | Total v51 |
| --- | ---: |
| Campagnes | 436 |
| Mondes | 64 |
| Armes | 146 |
| Équipements | 106 |
| Ennemis | 568 |
| Véhicules / châssis | 279 |
| Dossiers Apex | 244 |
| Profils Neuro-Xeno | 234 |
| Membres Echo-9 | 16 |
| Costumes | 392 |
| Modules USS Tantalus | 158 |
| Graines de niveau | 800 |

Les armes consomment leur famille et leur pénétration ; les ennemis leur fréquence, habitats, mondes et comportement ; un profil royal inéligible n'est jamais injecté comme boss hors contexte ruche/reine ; les six familles de véhicule ont locomotion, sièges et actions distincts ; les équipements possèdent charges et effets ; les costumes modifient armure, mobilité, furtivité, faction et rendu ; Apex respecte habitat/danger/probabilité ; Neuro-Xeno possède signal, brouillage, contre-impulsions et relais physique.

## Validation

```powershell
npm.cmd run qa
```

Gate v51 final local : lint de **59 modules**, **81/81 tests Node** et build statique **51.0.0** de **3 443 entrées**.

`scripts/browser-qa-v51.mjs` valide **10 checkpoints** réels dans un contexte Chrome local isolé : boot v51 et accessibilité, stratégie avec diplomatie temporisée/cooldown, dotation, mission de production et captions, reprise native après rechargement, retraite persistée, crise physique du hub, Forge mission/vaisseau, rechargement mobile et fermeture PWA hors ligne. Le service worker couvre toute la fermeture des imports ESM publics et ne renvoie le fallback HTML qu'aux navigations. Le dernier passage ne relève aucune exception, erreur console ni requête échouée.

## Dossier de production

- [Source consolidée des promesses v1→v51](docs/GAMEPLAY_PROMISE_SOURCE_V51.md)
- [Matrice d'audit et preuves exécutables](docs/GAMEPLAY_PROMISE_AUDIT_V51.md)
- [Architecture runtime v51](docs/ARCHITECTURE_V51.md)
- [Historique de release v51](docs/VERSION_HISTORY_V51.md)
- [Contrat de contenu](docs/CONTENT_CONTRACT.md)
- [Audit level design v50 et comparaison avec Aliens: Infestation](docs/LEVEL_DESIGN_AUDIT_V50.md)
- [Bible sprites et animations](docs/SPRITE_ANIMATION_BIBLE.md)
- [Provenance artistique](docs/ART_PROVENANCE.md)
- [Licence et propriété intellectuelle](LICENSE_NOTICE.md)

## Fidélité et droits

La base Tantalus est documentée par les [notes officielles de Focus Entertainment](https://support.focus-entmt.com/hc/en-us/articles/12816621940754-PC-PLAYSTATION-XBOX-UPDATE-AUGUST-1-2023) et les [concepts de production Tantalus Base d'Emilien Morisset](https://arka.artstation.com/projects/1xRx88). La direction « used future » s'appuie notamment sur l'[entretien Alien: Isolation de PlayStation](https://blog.playstation.com/archive/2014/03/26/behind-terror-alien-isolation-exclusive-interview).

Le dépôt ne redistribue aucun fichier officiel extrait d'un jeu. Son exploitation publique ou commerciale suppose que le détenteur du dépôt dispose des droits annoncés.
