# Reprise technique — La Mer des Chagrins

## Portée de ce point de reprise

Les 27 PNG et leur inventaire sont préservés comme sources. Aucun basculement du jeu vers le lot graphique incomplet n’est effectué.

Le dernier état distant de départ est `232cbd2ecb0e370f911b008b2226dafee81bffde`, sur `codex/mer-des-chagrins-github-20261125`, PR #58.

## État local observé avant indisponibilité

| Élément | Identifiant local — non publié |
|---|---|
| Snapshot des 110 PNG et du renderer corrigé | `f62b3c008df41be6004cff5ea9400daa05f7aa9f` |
| Fusion locale résolue | `7a474b9d013cad105096d01ad821599181f976c1` |
| Second parent distant de cette fusion | `b0df1877a058f0818f96437fdfdea3f21ba7f415` |
| Arbre du DLC original, conservé pendant la fusion | `1024a04d3615e135a0a9de7cbff6819e107a2492` |
| Arbre du lot visuel local de 110 PNG | `c3a443eada14577545a4cf54f786ee027b05eb8e` |

Ces identifiants documentent ce qui a été observé. Leur présence dans cette note ne signifie pas que les objets locaux ont été envoyés au dépôt.

## Fusion cumulative à récupérer ou refaire

Les sept fichiers conflictuels étaient :

- `index.html`
- `package.json`
- `scripts/build-asset-filter.mjs`
- `scripts/build-dev-tools-v188.mjs`
- `scripts/build.mjs`
- `scripts/verify-public-release-v86.mjs`
- `src/title-screen-v61.js`

La résolution conservait les entrées Extensions, Aliens 1986 et Expéditions · DLC ; elle réunissait les scripts et les contrôles de distribution.

La collision fonctionnelle concernait le scan du dossier `dlc/`. L’admission Mer refusait les deux fichiers d’Aliens 1986 déjà validés par leur propre module. La correction locale utilisait une délégation explicite à `publicAliens1986DlcPathAdmission` et `verifyAliens1986Runtime`. Elle conservait les empreintes, le contrôle du lanceur, le refus des liens symboliques et le rejet des autres dossiers inconnus. Elle n’ouvrait pas tout le dossier DLC.

Les anciens reçus de succession AVP/Aliens/Fiorina étaient inchangés ; un nouveau bloc prolongeait la succession des sept fichiers hôtes.

Validations locales observées : 17/17 admissions Mer, 15/15 succession, 15/15 menus. Aucune de ces réussites n’est transférée automatiquement à un futur commit reconstruit.

## Deux correctifs exacts du renderer à préserver

Fichier visé : `dlc/sea-of-sorrows-visual/src/png-renderer.js`.

Le patch suivant a été appliqué et testé localement. Le fichier complet du renderer n’est pas inclus dans ce point de reprise, et ce patch n’est pas actif dans le jeu publié.

```diff
*** Begin Patch
*** Update File: dlc/sea-of-sorrows-visual/src/png-renderer.js
@@
-    const direction = facing < 0 ? 'left' : 'right';
-    const id = candidates.find(key => records.has('characters/' + key + ':' + direction) || records.has('characters/' + key));
-    const png = id && asset('characters', id, facing);
-    if (!png || armed && png.state.entry.weaponHidden !== true && !point(png.state.entry, 'handAnchor')) return null;
-    if (!portrait && role === 'decker' && g.state.flags.equipped && g.p.lamp && !point(png.state.entry, 'lampAnchor')) return null;
-    png.pose = id;
-    return png;
+    // Existence alone is not availability: a failed or malformed preferred
+    // pose must not hide a usable body forever. Preserve the same priority,
+    // but require the selected image and its current attachments to be ready.
+    for (const id of candidates) {
+      const png = asset('characters', id, facing);
+      if (!png || armed && png.state.entry.weaponHidden !== true && !point(png.state.entry, 'handAnchor')) continue;
+      if (!portrait && role === 'decker' && g.state.flags.equipped && g.p.lamp && !point(png.state.entry, 'lampAnchor')) continue;
+      png.pose = id;
+      return png;
+    }
+    return null;
@@
-      if (parasite) atWorld(this, parasite, { x: q.x + 55 * scale, y: q.y - 62 * scale }, scale * (actor.id === 'adams' ? 1.27 : 1));
+      if (parasite) atWorld(this, parasite, { x: q.x + 55 * scale, y: q.y - 62 * scale }, scale);
@@
-      c.save(); c.translate(face.x, face.y); c.scale(actor.id === 'adams' ? 1.27 : 1, actor.id === 'adams' ? 1.27 : 1); paint(c, parasite); c.restore();
+      // Each parasite's measured height is authored in the pack, including
+      // the royal variant. Applying the legacy size multiplier again would
+      // enlarge it twice and move the legs away from the patient's face.
+      c.save(); c.translate(face.x, face.y); paint(c, parasite); c.restore();
*** End Patch
```

40/40 tests locaux du renderer passaient. Les six cas ajoutés vérifiaient quatre défauts de pose prioritaire (entrée invalide, chargement échoué, mauvaises dimensions, attache de main absente) et les parasites d’Adams/Elway sur brancard PNG ou de secours. Cinq de ces six cas échouaient contre l’ancien renderer, le témoin du parasite normal passant déjà.

## Ancres et identifiants à corriger

48 entrées de `assets.decor` contenaient des coordonnées de pivot remultipliées par la taille de l’image. Les coordonnées doivent rester des pixels de la source. Le point d’appui attendu se mesure sur la boîte alpha et doit rester dans les dimensions du PNG.

Les brancards `adams` et `elway` avaient `facing: "head-right"`, valeur refusée par le validateur. Utiliser une valeur prise en charge, par exemple `"none"`, et conserver l’orientation anatomique dans une métadonnée distincte si utile.

Le foamer demande une ancre de prise et une ancre de bouche réellement mesurées. Les obstacles doivent conserver la largeur, hauteur, position et profondeur de chaque instance ; les pixels ne deviennent pas des collisions.

## Couverture à terminer

- 50 familles de décors : 48 fichiers locaux existaient ; les deux manques `cryo` et `valve` sont dans ce point de reprise.
- Six familles d’obstacles, 120 placements : les six nouveaux PNG sont préservés ici.
- 16 portraits : tous existaient dans le lot local ; 12 sont récupérés ici.
- Adultes et adulte capturé : 36 placements ; reine : un placement. Les nouveaux PNG correspondants n’ont pas été livrés par le générateur.
- Armes : le foamer est maintenant généré. Plasma et lance-flammes restent sans nouveau PNG.
- Les états supplémentaires (éclairages, réserves vidées, éléments détruits et variantes de dispositifs), les cycles d’animation et la revue artistique restent à traiter selon les appels réels du renderer.

La campagne inspectée comporte 50 salles. Le compte des éléments ne vaut ni parcours complet ni preuve de raccordement.

## Validation nécessaire avant activation

Récupérer les 92 images antérieures restantes, reconstituer le manifeste avec les octets effectivement disponibles, appliquer les corrections, calibrer les points d’attache, puis exécuter les tests ciblés, la vérification de source, le build et le contrôle du build.

Contrôler réellement en navigateur la galerie, le trajet initial s01 → s02 → s01, la sauvegarde/reprise et le rendu des 50 salles. Une fixture de salle reste distincte d’un parcours jouable. Aucune réussite Chromium n’a été obtenue durant cette reprise.

## Vérification du présent point de reprise

Neuf signatures/en-têtes PNG ont été contrôlés directement sur les données générées : dimensions, profondeur et type RGBA. Dix-huit blobs antérieurs ont été résolus par l’API GitHub avec leurs tailles. Les images n’ont pas été retouchées.

113 assertions ciblées sur la fonction d’admission vérifient les chemins exacts, les dossiers, le refus du build public, les tentatives de traversée et la délégation des chemins étrangers. Ce contrôle isolé ne remplace pas la suite Node complète ni un build.
