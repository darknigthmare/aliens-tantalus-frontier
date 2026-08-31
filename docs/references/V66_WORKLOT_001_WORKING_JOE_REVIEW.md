# Working Joe — sources OpenAI du worklot 001

Date : 2026-08-31. Profil confirmé dans la file : enemy-041-working-joe, batch-003.

## Livraison réelle

Cinq PNG actifs de1774×887, huit poses chacun : idle, move, attack, death et hurt. Six appels ImageGen intégrés ont été exécutés : le premier move est conservé dans rejected/move-pre-r2.png, son événement move.json reste historique et move-r2.json est l'événement actif. Aucun appel CLI/API de génération.

Sources : assets/openai/sprites/frames/v66/batch-003/enemy-041-working-joe/
Prompts : docs/references/v66-worklot-001-prompts/enemy-041-working-joe/
Événements : docs/references/v66-worklot-001-events/enemy-041-working-joe/
Références et verrou de design : docs/references/V66_WORKLOT_001_WORKING_JOE_REFERENCE.json
Sonde vérifiable : docs/references/V66_WORKLOT_001_WORKING_JOE_SOURCE_QA.json

Deux captures de gameplay ont été téléchargées puis inspectées; elles montrent le Joe standard avec combinaison gris-brun et renforts bruns. La page du créateur Jack Perry a été recherchée mais ses images directes étaient bloquées; elles ne sont pas revendiquées comme inspectées. Les captures retenues ne montrent pas les bottes en entier : leur fidélité exacte reste à établir. La couture orange du pantalon n'est pas qualifiée de canon confirmé.

La compétence imagegen a imposé une identité visuelle commune, l'inspection de la première source avant les clips suivants, une correction ciblée du cycle de marche et la sauvegarde immédiate des fichiers et provenances.

## Contrôles et réserves

- Les cinq SHA sources concordent avec leurs événements actifs. Le texte exact envoyé à l'outil figure dans actualPromptText. Pour idle et move-r2, le fichier prompt possède une LF finale absente du texte transmis; la sonde distingue explicitement leur empreinte.
- Les cinq PNG sont RGB, sans alpha. Le matte rose n'est pas exactement #FF00FF et varie selon la position. Les valeurs de cinq pixels de fond par image sont enregistrées; aucune tolérance de détourage n'a été assouplie.
- Les huit silhouettes par planche sont présentes. La taille debout occupe environ86% de la hauteur d'une cellule, au lieu des62% demandés. La cohérence métrique interclips n'est pas encore mesurée.
- Marche r2 : poses de passage/lift plus distinctes, mais la jambe proche reste devant enpose5. Ce cycle n'est pas accepté artistiquement et sa continuité en lecture n'est pas démontrée.
- Attack : préparation, extension à deux mains et retour visibles. Racine corporelle, pieds, doigts et points de contact restent à contrôler après extraction.
- Death : effondrement distinct du hurt, mais la pose7 touche le bord gauche de sa cellule. Diagnostic non destructif : bbox locale x=0; poses6/8 marges9/6px. Il faut résoudre l'appartenance de silhouette/cadrage avant acceptation. La tête des poses couchées s'oriente vers l'observateur, réserve de perspective.
- Hurt : recul debout et récupération existent; passage du pic3 à4 assez brusque, lecture temporelle à revoir.
- Aucun atlas, normaliseur, runtime, QUEUE, REFERENCES ou STATE partagé modifié par cet agent. Aucune acceptation automatique, aucun statut 1:1 garanti, aucune intégration runtime.

Les sources sont figées pour permettre la fusion de provenance et la normalisation par l'agent principal. Les défauts ci-dessus restent ouverts.
