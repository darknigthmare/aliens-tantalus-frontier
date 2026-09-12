# V78 — Profils protégés, accueil contrôlable et table de briefing physique

Date de validation locale : 2026-09-12. Branche : `codex/v52-physical-worlds`. Baseline : `a4ef470` (V77 local).

## Sauvegardes et profils

- Le dernier profil valide parmi 1/2/3 est restauré au prochain lancement ; les slots secondaires vides ne clonent jamais silencieusement la sauvegarde historique du profil 1.
- Les imports refusent tableaux, scalaires, documents sans structure reconnue et JSON malformé avant d’arrêter le moindre runtime.
- Un slot illisible devient protégé : aucun autosave, unload ou changement de réglage ne peut remplacer ses octets. Le joueur peut exporter le fichier brut, choisir un autre profil, importer une sauvegarde valide ou confirmer explicitement une nouvelle partie.
- Toute écriture de slot précède le basculement mémoire/profil. Un échec conserve l’objet actif, le profil précédent et les bytes persistés. L’échec séparé du marqueur de sélection est annoncé sans annuler une sauvegarde déjà réussie.
- Les commits ordinaires conservent l’identité de la racine partagée après succès afin que les systèmes mission, dont les archives QZ-17, ne continuent jamais à écrire dans une ancienne racine.
- La dernière sélection d’import gagne si deux lectures de fichier se terminent hors ordre. Un changement de profil ou de runtime invalide toute lecture obsolète.
- Sauvegarde rapide, retour au titre et demande de nouvelle chronologie capturent le checkpoint dans un candidat transactionnel avant publication.

## Écran d’accueil et entrées

- Clavier : flèches, Tab/Shift+Tab, Home/End, Entrée/Espace et Échap ; répétitions maintenues ignorées et focus borné aux actions visibles/actives.
- Manette standard : D-pad/stick, A/Start et B avec neutralisation des boutons maintenus au branchement, retour d’onglet ou reconnexion. Deux pads ne peuvent pas déclencher deux actions dans une même frame. La validation simule le mapping navigateur ; elle ne prétend pas tester du matériel physique.
- Une nouvelle partie exige deux intentions distinctes ; double clic, touche maintenue, perte de focus, changement de profil et timeout ne valident jamais l’écrasement.
- L’interface reste utilisable en 1280×720, portrait 390×844, paysage 844×390 et paysage compact 480×320.
- Le focus suit la vue : titre, réglages, hub, premier contrôle de l’insertion, contrôle suivant après rerender, puis canvas mission.

## Hub physique

- Seule la table de briefing est marquée `one-way-top`.
- Joueur et ennemi de crise passent latéralement devant ; le joueur traverse le plateau en montée, atterrit en descente et retombe au pont après avoir marché hors de la table.
- Les quinze autres props gardent leur collision historique et le painter order conserve table → acteurs → premier plan.

## Périmètre honnête

V78 ne produit aucune nouvelle image ni animation. Le titre utilise encore le composite V61 et ne satisfait pas le chat #2 des vingt planètes/presets modulaires. Les biographies/portraits Echo-9, le prologue/créateur de personnage, le tir diagonal, la refonte Commandement, la banque audio finale et la vaste dette ennemie restent ouverts.

La matrice stricte reste à **0 DONE / 15 PARTIAL / 11 MISSING** sur 26 conversations. Une correction locale validée ne ferme pas automatiquement la conversation plus large dont elle provient.
