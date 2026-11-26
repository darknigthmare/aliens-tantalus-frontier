from pathlib import Path
import json,hashlib,re
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text())
B=J('report/browser-results-v113.json');C=J('report/CONTRATS_LEVEL_DESIGN_V113.json');D=J('report/tactics-drive-v113.json');DIST=J('report/distribution-smoke-v113.json');CORPUS=J('report/save-corpus-v113.json')
assert all(x['ok'] for x in B['tests']) and not B['pageErrors'] and not B['consoleErrors']
node=int(re.search(r'# pass (\d+)',(R/'report/node-tests-v113.txt').read_text()).group(1))
lines=['# QA — ALIENS V113 / Tenir les angles / RC1','## Résultats et portée',f'**{node} tests Node réussissent : 486 historiques et 93 nouveaux. {len(B["tests"])} contrôles gameplay navigateur passent : 236 historiques réexécutés +55 tactiques.** Dix contextes Chromium indépendants, aucune erreur JavaScript ou console observée. {len(DIST["checks"])} contrôles de distribution et {len(CORPUS["checks"])} imports de corpus sont séparés. Huit variantes complètes terminent, plus l’exercice distinct de poursuite.',
'Ces résultats concernent le document autonome exact livré. Ils ne certifient pas la campagne native de 64 salles, un GPU, une manette, un téléphone physique ou une absence universelle de bugs.',
'## Provenance',
'Source fournie : `ALIENS_1986_V112_BALISER_LE_REPLI_RC1.zip`, 64 739 989 octets. SHA-256 : `c9c13930b5451af046a6e9d7a3e69bf90cc0fa2f42b0ed336b01be9d236f7c06`. 37 sources/tests hérités sont conservés byte-for-byte dans `baseline/SOURCES_PRESERVEES_V112.json`. Les validateurs historiques ne sont pas remplacés.',
'## Catalogue et mécanique',
f'Contrat courant `{C["contract"]}`. Catalogue inchangé : dix inspections, neuf lieux d’opération, onze liaisons partagées et 22 faces, cinq objectifs ordonnés, 60 solides fixes, 11 portes intérieures, 54 props, 38 observations, 13 ennemis et une sentinelle. Aucun nouveau lieu, ennemi, objectif obligatoire ni sprite de production.',
'X réserve un poste visible à 520 unités, hors obstacles/seuils et avec écart 7. N engage un secteur 100°. La marche est réellement simulée, sans téléportation. 2 retient ou autorise le feu indépendamment. G/H/C et regroupement retirent les postes explicites, mais conservent la discipline. Newt se place sans arme. La sentinelle tourne à portée 76 en 1,15 s ; elle ne tire pas pendant ce geste. Les tirs automatiques attendent une ligne sans ami avant le premier obstacle/contact.',
'La sécurité ne modifie pas la balistique manuelle du joueur. Les arcs abrégés à 160 unités sont des annotations de direction, pas la portée de l’arme ni une source lumineuse. Portée réelle de tir héritée : Marine 440, sentinelle 590.',
'## 93 tests dirigés V113',
'Fixtures explicitement préparées : destinations hors carte/portée/vue, postes dans meuble ou seuil, groupe sans réservation disjointe, Newt non recrutée/armée, angles de secteur, déplacement borné autour de meubles et équipiers, fermeture puis réouverture de route, pause/import à mi-chemin, hold/free indépendants, G/H/C, décès et transfert.',
'Acquisition automatique : ami avant/après cible, Newt, autres contacts et parois, exclusion des morts, cible hors secteur, sentinelle dans le noir, munitions effectivement retenues puis consommées après dégagement. Rotation : durée, application différée, pause/import, interruptions marche/tir/coup/portée/déplacement/disparition. Import strict : champs, angles, coordonnées, états d’arrivée, ressource inconnue, bilan commencé=achevé+interrompu+en cours, migrations V112 réelles pour les dix inspections. Ces fixtures ne sont pas présentées comme des parcours.',
'## Huit opérations complètes',
'Les pilotes lisent le monde pour choisir leurs chemins et cibles, puis utilisent les entrées publiques. Ils ne réécrivent ni coordonnées, vies, chargeurs, stocks, circuits, mémoires ou objectifs. Ils sont informés par l’état, pas des joueurs aveugles à ses données. Les imports sont leurs propres exports non modifiés.']
def teamtable(d):
 return '\n'.join(['| Membre | PV | Munitions |','|---|---:|---:|']+[f"| {a['id']} | {a['hp']} | {a['ammo']} |"for a in d])
for group in ['operation-drive-v113','logistics-drive-v113']:
 for d in J('report/'+group+'.json')['results']:
  lines += ['### '+d['variant'],f"Terminé `{d['complete']}`. Entrées/sous-pas `{d.get('inputs',d.get('steps'))}` ; {d['elapsed']:.3f}s simulées.",teamtable(d.get('team',d.get('ammunition')))]
  if 'logistics' in d:lines+=['Réserves/dépenses : `'+json.dumps(d['logistics'],ensure_ascii=False)+'`.']
for group,label in [('breach','Brèche'),('lighting','Obscurité'),('beacon','Dérivation balisée')]:
 d=J(f'report/{group}-drive-v113.json');lines += ['### '+label,f"Terminé `{d['complete']}` : {d['inputs']} entrées/sous-pas, {d['elapsed']:.3f}s simulées, {d['enemyTransfers']} franchissements ennemis conservant l’identité.",teamtable(d.get('team',d.get('ammunition')))]
lines += ['### Positions, secteurs et affût',f"Terminé `{D['complete']}` : {D['inputs']} entrées/sous-pas, {D['elapsed']:.3f}s simulées, sentinelle finale à{D['sentryAmmo']} cartouches.",
'Insertion normale → Operations : deux postes, export pendant la marche puis reprise, secteurs et feu retenu. Relais et Newt sont obtenus par la route existante ; Newt est placée puis rappelée. Au couloir, orientation locale de l’affût, export à mi-geste et reprise, trois postes et deux secteurs de Marines. Le joueur ouvre, dégage l’axe puis autorise la défense sans tir manuel avant le repli.',teamtable(D['team']),
'Métriques finales : `'+json.dumps(D['orders']['metrics'],ensure_ascii=False)+'`. Le compteur safetyHolds mesure des acquisitions empêchées, pas des cartouches fictivement tirées. Il peut rester à 0 sur une défense bien placée ; l’exercice navigateur distinct l’active en plaçant Ripley dans l’axe.',
'Les secondes simulées ne sont pas une estimation de durée de jeu humaine. Les munitions, la vie et les sources de l’opération native ne sont pas validées par ce parcours autonome.',
'### Poursuite séparée',
'Exercice hérité réexécuté : réussite, deux passages ennemis avec leurs identités conservées. Ne pas le compter comme une neuvième opération complète.',
'## Recette navigateur',
'HTML exact chargé par set_content avec son chargeur Blob de distribution inchangé. Aucun hook d’édition de session ajouté. Les exports sont des téléchargements réels, les imports utilisent le champ fichier. Les premières pièces sont jouées ; les séquences tardives reprennent des exports intacts puis effectuent les gestes nommés dans les légendes.']
lines += ['| Recette | Contrôles |','|---|---:|']
for part in ['core','tail','contact-a','contact-b','touch','logistics','engineering','lighting','beacons','tactics']:lines += [f"| {part} | {len(J('report/browser-'+part+'-v113.json')['tests'])} |"]
lines += [f'Total **{len(B["tests"])}**. Tous les reçus sont liés au SHA-256 du même HTML. Les 55 nouveaux contrôles réalisent X/N/2 par clavier et boutons, marche jusqu’au poste, annulations, reprise pendant marche/rotation, placement de Newt, refus de commande distante, sentinelle retenue par Ripley puis libérée en se décalant, défense sans tir manuel, imports faux atomiques, vraie migration V112, carte/archives, accessibilité et deux viewports.',
'Les viewports 844×390 et 390×844 sont émulés, pas des téléphones physiques. Les minimums de hauteur du terrain 178 et 245 px n’ont pas été abaissés. Le terrain reste graphiquement petit en paysage court, limite montrée dans la capture.',
'## Captures et Codex',
f'{len(B["captures"])} PNG directs Chromium ; dix embarqués byte-for-byte dans le rapport. Aucune génération d’image, retouche ni reconstruction Python depuis des coordonnées. Provenance dans `report/browser-results-v113.json`. Le Codex comprend 60 règles et 10 fiches avec plans calculés explicitement distingués des captures.',
'## Corrections pendant la recette',
'Un allié pouvait se bloquer après un pas d’évitement : les segments sont revérifiés et les chemins recalculés depuis sa position réelle. Les contournements latéraux essayent des tangentes diagonales sans supprimer une collision. Les recherches de routes impossibles sont espacées. Les réservations de secteur sont également vérifiées pour interdire un chevauchement.',
'Des recettes historiques mettaient Ripley ou un Marine devant la sentinelle puis exigeaient qu’elle dépense une cartouche. La nouvelle sécurité retenait correctement le tir. Les parcours logistique, noir et balises et l’inspection navigateur déplacent désormais l’acteur ou tiennent le groupe en arrière avant d’attendre le feu, par entrées publiques. Aucun chargeur ni collision n’a été modifié pour faire passer la recette.',
'Les archives en jeu ne décrivaient pas encore N et les secteurs : le texte a été complété, puis le HTML reconstruit et toutes les recettes navigateur relancées sur le hash final. Les labels d’anciens scripts conservent parfois leur origine historique ; leur reçu de version et leur hash identifient le programme réellement exécuté.',
'## Distribution et corpus séparés',
f'{len(DIST["checks"])} contrôles distincts vérifient initialisation, schéma 113, stocks neufs, circuits, 10 fiches/60 règles, recherche, plans et identité/décodage des 10 PNG du rapport, portrait sans débordement et absence de requête externe nécessaire. {len(CORPUS["checks"])} exports sont validés par l’importeur courant : 85 exports V113 et 74 véritables V112 via migration. Ce n’est pas 159 parcours.',
'Transport direct file:// : `'+json.dumps(DIST['transport']['directFileNavigation'],ensure_ascii=False)+'`.',
'## Limites explicites',
'Suite autonome V112, pas de fusion native V105/64 salles, pas de push, déploiement ou remplacement du final Reine/P-5000/sas. Ancien adaptateur V106 inactif. Aucune nouvelle salle/population/arme, aucun couvert destructible, suppression de feu, moral, inventaire individuel, lampe mobile par allié ou lumière inter-pièces.',
'Rendu procédural stylisé, transferts discrets et tirs locaux. La sentinelle est orientable, pas transportable. Le secteur est facultatif : sans commande N, l’acquisition historique reste conservée. Les tirs automatiques ont une sécurité d’axe ; les tirs manuels gardent les règles précédentes. Encombrement d’un passage, ordre de tenir ou angle mort peuvent légitimement empêcher la progression tant qu’un ordre n’est pas changé.',
'## Reproduction',
'```text\nnpm run check\nnpm run drive\nnode tools/export-contracts-v113.mjs\nnpm run build\nnpm run browser\nnpm run docs\npython qa/distribution-smoke-v113.py\npython tools/write-qa-v113.py\npython tools/release-check-v113.py\n```',
'HTML : `'+B['htmlSha256']+'`. Le vérificateur `tools/verify-package.py` est strictement en lecture seule. Reconstruire intentionnellement les preuves peut en changer les hashes ; ce n’est pas la vérification d’une distribution d’origine.']
(R/'QA_REPORT.md').write_text('\n\n'.join(lines)+'\n')
print('QA written',node,len(B['tests']),len(DIST['checks']),len(CORPUS['checks']))
