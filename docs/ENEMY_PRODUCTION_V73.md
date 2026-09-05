# Production ennemis V73 — livraison et reprise

État de référence du 5 septembre 2026. **Le lot de 50 est couvert en sources, mais n’est pas terminé en jeu : seul 055 est nouvellement intégré; 49 profils restent à finaliser.** Cette livraison ne certifie ni 50 ennemis jouables, ni une fidélité 1:1, ni un jeu commercial complet.

## Périmètre figé et bilan exact

Le lot contient les profils **007 à 057, en excluant 020 K-Series**, soit 50 identités. Ne pas recalculer « les 50 suivants » à partir d’une liste dynamique après chaque intégration : cela déplacerait la cible. 020 reste un témoin de non-régression, pas une nouvelle entrée de ce lot.

Source de vérité de cette synthèse : [V73_NEXT50_STATUS.json](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/V73_NEXT50_STATUS.json), produit par [enemy-next50-audit-v73.mjs](D:/CodexWork/aliens-tantalus-frontier/project/scripts/enemy-next50-audit-v73.mjs).

| Mesure | État de cette livraison | Ce que cela signifie réellement |
| --- | ---: | --- |
| Profils du lot figé | 50 | 007–057 hors 020; pas 50 nouvelles intégrations. |
| Planches sources requises et présentes | 216 / 216 | Les fichiers attendus existent. |
| Sources dont la provenance est reconnue par l’audit | 216 | Inclut des générations historiques récupérées; ne garantit pas tous les prompts historiques exacts. |
| Premières planches dédiées produites dans cette passe | 28 | Les quatre clips de chacun des profils 051–057. |
| Reprises OpenAI dans cette passe | 6 | Corrections successives; elles ne s’ajoutent pas aux 216 emplacements actifs. |
| Normalisations actuelles selon l’instantané | 41 | Empreinte d’atlas et empreintes des sources en accord avec leurs métadonnées. |
| Nouvelle intégration effective | 1 : 055 | Albino Chestburster, atlas et contrat de morsure dédiés. |
| Profils non finalisés dans ce lot | 49 | Candidats, rejets, preuves ou gameplay encore incomplets. |
| Prompts historiques exacts manquants | 4 : les clips de 048 | Provenance récupérée, mais prompt fournisseur original non conservé. |

**« Normalisation actuelle » n’est pas un résultat `--check` pour les 41 profils.** Le compteur compare les hashes des images et des sources; certaines preuves globales historiques peuvent encore être périmées. De même, `issues: []`, `findings: []`, huit hashes différents ou un statut `generated` ne constituent pas une revue anatomique, une animation fluide ou une acceptation artistique.

Les neuf profils sans normalisation actuelle dans cet instantané sont **039, 040, 043, 044, 045, 046, 047, 048 et 057**. Leur source présente ne doit pas être confondue avec un atlas prêt à utiliser.

## Production réellement ajoutée ou corrigée

Les 28 nouvelles planches couvrent Ceto Reef Predator051, Tantalus Tunnel Vermin052, Albino Ovomorph053, Albino Facehugger054, Albino Chestburster055, Albino Drone / Big Chap056 et Albino Warrior057. Les six reprises concernent **051 idle, 052 attack, 053 hatch, 053 opening, 055 move et 056 attack**. Les [prompts et reçus V73](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-prompts) conservent la provenance; les [anciennes sources archivées](D:/CodexWork/aliens-tantalus-frontier/project/assets/openai/sprites/frames/v73) ne doivent pas redevenir des masters actifs par erreur. Un identifiant de reçu local n’est pas un identifiant durable fourni par OpenAI.

La remise au format de **051 attack** est une correction technique distincte d’une nouvelle génération : extraction avec attribution des composants, déplacements entiers et recomposition à la résolution commune, sans interpolation ni perte de pixels anatomiques. Ne pas relancer les scripts exploratoires contre le master désormais remplacé ni réécrire la preuve figée. Voir le [rapport 051–052](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/051-052/FINAL_QA.md).

Les récupérations 016, 036, 049, 050, 053 et 054 apportent des preuves physiques et des sorties contrôlées, **pas une acceptation implicite**. Les sources utilisables ont été conservées lorsqu’un défaut ne nécessitait pas de les redessiner toutes.

### Seule nouvelle intégration : 055 Albino Chestburster

055 utilise son propre atlas, quatre clips et 32 poses; il n’emprunte ni le bitmap du 003 ni celui du 054. Son rendu isotrope conserve le pivot de sol et un corps de collision distinct de la queue. La morsure possède un contact unique synchronisé à la pose 5, puis une récupération; ce n’est pas un bouton affichant une promesse d’action.

Les preuves centrales finales sont le [reçu d’acceptation](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/release/accept-enemy-055-albino-chestburster.json) et le [reçu d’intégration](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/release/integrate-enemy-055-albino-chestburster.json). La [fixture navigateur avec le vrai moteur](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/054-055/browser-combat.json) constate un impact unique, l’absence de dégâts répétés et une sauvegarde inchangée. Le [journal des tests ciblés](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/054-055/runtime-test-output.txt), le [rapport détaillé](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/054-055/README055_REVIEW.md) et la [capture d’impact](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/054-055/browser-055-impact.png) précisent leur portée. **Ce contrôle isolé n’est pas une traversée complète de la campagne.**

Le rapport technique 055 a été écrit avant l’acceptation centrale : ses mentions de métadonnée alors en attente décrivent cette étape historique. Pour l’état final de livraison, utiliser les deux reçus centraux et l’instantané V73, sans modifier rétrospectivement les preuves anciennes.

## Blocages notables à traiter

Cette table synthétise les contre-revues disponibles; elle ne prétend pas qu’une inspection artistique exhaustive des 50 profils serait achevée. Les autres candidats gardent leurs validations restantes.

| Profil | Blocage concret / état | Prochaine action bornée et preuve |
| --- | --- | --- |
| 007 Praetorian | Bras surnuméraire ambigu dans idle; locomotion et frappe lourde insuffisantes. | Reprendre idle/move/attack, conserver death et tail-strike comme candidats. [Audit 007–010](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/agent-large-enemies.md). |
| 008 Queen | Marche peu alternée, queue incohérente en attaque, tail-strike de taille différente. | Refaire les clips réellement fautifs; mesurer couronne/thorax et appuis sans réduire arbitrairement la taille royale. Même audit. |
| 009 Crusher / 010 Spitter | Continuité de queue et freinage de charge009; vraie alternance des jambes010 et preuves physiques manquantes. | Reprendre charge009 et move010; conserver leurs sources utiles. Le projectile absent du dessin010 est prévu comme effet séparé, pas comme oubli graphique. Même audit. |
| 011–015 | Bond011 non aérien; release012 miniature; locomotion/récupération013; morphologie/télégraphe014; trois supports aériens015 non validés. | Ne pas régénérer aveuglément toutes les planches. Reprises et mesures ciblées dans l’[audit 011–016](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/agent-011-016.md). |
| 016 Burster | Atlas recalibré et ancré; attack montre une compression, pas une explosion. | Connecter un vrai télégraphe à une seule détonation et à la mort, vérifier joueurs/équipiers/véhicules, ou refaire le clip nécessaire. [Remise016](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/016/README.md). |
| 035 Trilobite Echo | Septième membre non démontré; anciennes mesures contestées. | Nouvelles sources cohérentes; ne pas réutiliser les fragments historiques explicitement invalidés. [Contre-revue035–036](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/035-036/REVIEW_035_036_V73.md). |
| 036 Deacon Line | Racines/crâne remesurés, mais même jambe répétée en avant; petits liserés violets. | Refaire un cycle complet et revoir les franges localement; ne pas confondre le check réussi avec une marche validée. Même contre-revue. |
| 039 / 040 / 043–048 | Pas de normalisation actuelle; 039 reste `review-rejected`. | Reprendre les raisons historiques et les masters présents avant toute nouvelle génération. [État par profil](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/V73_NEXT50_STATUS.json). |
| 048 Cult Host | Quatre sources récupérées, quatre prompts originaux exacts non conservés. | Garder `actualGenerationPromptAvailable=false`; le prompt actuel de queue n’est pas le prompt historique. [Provenance048](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v66-worklot-002-cult-host-review/enemy-048-cult-host/derived-provenance.json). |
| 049 Wild Boar Host | Attaque à −4,60% sur l’axe corporel contre une limite actuelle de 3%. | Corriger le défaut mesuré; ne pas modifier les points ni le seuil pour faire passer la revue. [QA049–050](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/049-050/FINAL_QA.md). |
| 050 Korari Stalker | Candidat techniquement et visuellement récupérable, pas intégré. | Vérifier taille face au marine, morsure, hauteur du bond et maintien de la mort en jeu; garder les vrais appuis aériens. Même QA. |
| 051 Ceto Reef Predator | Grille réparée et candidat normalisé; racines aquatiques/échelle anatomique non validées. | Mesurer les repères du corps, ligne d’eau, nage/combat et mort; ne pas placer chaque nageoire basse sur un faux sol. [QA051–052](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/051-052/FINAL_QA.md). |
| 052 Tunnel Vermin | AttackR2 corrige la tête fendue, mais huit pattes lisibles et cohérentes ne sont pas établies. | Revoir idle/move et la lisibilité des mandibules à l’échelle réelle; ne pas certifier l’anatomie grâce aux seuls hashes. Même QA. |
| 053 Albino Ovomorph | Raccord opening→hatch brusque; une mort commençant fermé refermerait l’œuf ouvert. | Future fin d’ouverture raccordée exactement au hatch et entrée de mort adaptée; candidat non accepté. [Rapport053](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/053/README.md), [raccords visibles](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/053/transitions.jpg). |
| 054 Albino Facehugger | Halo violet sombre entre les doigts d’attack pose2 malgré zéro magenta au seuil strict. | Correction ImageGen ciblée ou masque local prouvé et rejouable; pas de suppression globale des tissus rosés. [Blocage054](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/054-055/README054_BLOCKED.md). |
| 056 / 057 | Marche sans alternance complète. Pour 057 : trois clips traversent les cellules et le détourage retire aussi des tissus rose-taupe (tibia, avant-bras). | Refaire les clips fautifs avec une palette détachable sans perte, garder les sources originales. Les trois dérivés exploratoires sont rejetés et aucun atlas057 n'est intégré. [Diagnostic final056–057](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/056-057/FINAL_QA.md). |

## Reprendre sans recommencer

1. **Conserver le lot figé.** Lire l’instantané V73 et le rapport spécifique du profil; vérifier d’abord que les sources actives et leurs reçus correspondent encore. Les anciens audits sont datés : les remises016/036/053 plus récentes remplacent leurs anciens constats techniques, sans effacer les rejets artistiques encore pertinents.
2. **Partir des pixels existants et du défaut prouvé.** Ne refaire que les clips réellement manquants ou rejetés. Conserver les masters et les versions rejetées avec leur prompt exact et leur empreinte; ne pas remettre en production un ancien R1 pour éviter une nouvelle mesure.
3. **Isoler les preuves par profil.** Utiliser `--anchor-review` et `--scale-review` avec les fragments autonomes appropriés. Les chemins repo-relatifs, l’identité, le batch, les mesures et les hashes sont strictement contrôlés et enregistrés sous `metadata.normalizationReviewPaths`. Ne pas fusionner automatiquement un fragment dans un registre global et périmer les autres profils.
4. **Mesurer l’anatomie, pas la boîte entière.** Racine du corps, support réel ou trajectoire aérienne; échelle de coque/crâne/torse sur plusieurs poses comparables, hors queue, arme et pétales. Garder les incertitudes. Un œuf utilise `sealed` comme baseline; les autres familles conservent `idle`. Appliquer une seule correction par clip puis une échelle finale commune, jamais une deuxième calibration sur un atlas déjà recalibré.
5. **Normaliser avec les seules options justifiées.** `--trim-transparent-padding` retire uniquement les marges alpha nul et exige des racines revues. Les nettoyages magenta restent explicitement bornés; ils ne sont pas une autorisation d’effacer du tissu rose, des reflets ou des membres. Préserver exactement les octets des preuves liées par SHA : LF par défaut, exceptions historiques CRLF déclarées dans `.gitattributes`, dont la preuve de réparation051.
6. **Rejouer la validation, puis regarder.** `--check` relit les options et les preuves enregistrées. Inspecter chaque clip sur fonds sombre/clair, les raccords entre états, les deux orientations, la boucle et la fin maintenue à la taille réelle. Le lecteur de diagnostic et un `findings=[]` ne testent pas les collisions ou le combat.
7. **Intégrer seulement après ces étapes.** Branche runtime par ID exact, atlas dédié, dimensions isotropes, corps de collision indépendant des appendices, effet réel synchronisé à la pose d’impact, récupération, mort terminale et sauvegarde. Tester les cibles et obstacles pertinents. Utiliser055 comme exemple de procédure, pas comme source à copier sur d’autres ennemis.
8. **Finaliser les reçus et la publication séparément.** Après revue artistique et recette, ajouter les événements d’acceptation/intégration et synchroniser les registres via le flux existant, sans réécrire l’historique. Committer sélectivement les fichiers concernés. Vérifier build et déploiement dans leur propre étape; cette synthèse n’atteste aucun nouveau commit, push, déploiement Vercel ou succès commercial.

Depuis la racine du projet, ces contrôles de reprise sont non mutateurs :

```powershell
node scripts/enemy-next50-audit-v73.mjs --check
py -3 scripts/process-v66-enemy-batch.py --profile enemy-053-albino-ovomorph --check
py -3 scripts/process-v66-enemy-batch.py --profile enemy-020-k-series-yellow-xenomorph --check
```

Le premier signale un instantané périmé; ne pas le régénérer pour masquer un échec de preuve. Le deuxième peut réussir alors que053 reste artistiquement refusé. Le troisième protège le profil020 expressément exclu de la nouvelle production. Les validations de non-régression du pipeline et les contrôles ciblés001/016/020 sont détaillés dans la [remise053](D:/CodexWork/aliens-tantalus-frontier/project/docs/references/v73-next50-audit/053/README.md); aucun total de tests ne doit être extrapolé à une validation complète du jeu.
