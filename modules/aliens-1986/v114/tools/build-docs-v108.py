"""Generate the room book and illustrated report from actual V108 contracts,
actual browser results, and unedited browser PNG files. No image generation."""
from pathlib import Path
import json,base64,html,hashlib,re
R=Path(__file__).resolve().parent.parent
J=lambda p:json.loads((R/p).read_text())
e=lambda s:html.escape(str(s))
C=J('report/CONTRATS_LEVEL_DESIGN_V108.json');B=J('report/browser-results-v108.json');D=J('report/operation-drive-v108.json');P=J('report/pursuit-drive-v108.json');PROV=J('baseline/PROVENANCE_V107.json')
assert all(x['ok'] for x in B['tests']) and not B['pageErrors']
TAP=(R/'report/node-tests-v108.tap').read_text();passed=int(re.search(r'# pass (\d+)',TAP).group(1));assert '# fail 0' in TAP
STYLE='''*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#0b1613;color:#d5dfcf;font:16px/1.8 Arial,Helvetica,sans-serif}main{max-width:1160px;padding:48px 30px 90px;margin:auto}a{color:#cddaa6}h1{font:400 clamp(34px,5vw,58px)/1.15 Georgia,serif;max-width:1000px;color:#e0e6ce;margin:20px 0 30px}h2{font-size:28px;font-weight:400;line-height:1.3;margin:42px 0 17px;padding-top:27px;border-top:1px solid #48634f;color:#c5d4ac}h3{font-size:20px;font-weight:500;color:#cbd8b5;margin:25px 0 10px}p{max-width:98ch}.eyebrow{font:11px/1.4 monospace;letter-spacing:.28em;text-transform:uppercase;color:#96b394}.lead{font-size:20px;line-height:1.65;max-width:920px}.callout{padding:19px 24px;border-left:3px solid #baa76e;background:#233a2d66;color:#cad9bb;margin:25px 0}.metrics{display:flex;gap:13px;flex-wrap:wrap;margin:25px 0}.metric{padding:16px 22px;min-width:160px;border:1px solid #3e5b48;background:linear-gradient(#213629,#11251d)}.metric strong{display:block;font-size:32px;font-weight:400;color:#e2d9a8}.metric small{font-size:12px;color:#b4c3a7}table{width:100%;border-collapse:collapse;font-size:12px;line-height:1.5;margin:20px 0}th,td{border:1px solid #3d5c49;padding:10px 12px;text-align:left;vertical-align:top}th{background:#284132;color:#d4dfc5;font-weight:600}tr:nth-child(even){background:#162d2070}figure{margin:28px 0}img{display:block;width:100%;height:auto;border:1px solid #587455;background:#06130c}figcaption{color:#a4b79d;font-size:13px;margin-top:9px}code,pre,.mono{font:12px/1.6 ui-monospace,Consolas,monospace;overflow-wrap:anywhere}pre{white-space:pre-wrap;padding:19px;background:#06130c;border:1px solid #405b49}nav{display:flex;gap:20px;flex-wrap:wrap}details{margin:20px 0;border:1px solid #4a6650;background:#13281d;padding:17px}summary{cursor:pointer;color:#dce2bb}.diagram{width:100%;height:auto;background:#07170f;border:1px solid #466f4b}.chip{display:inline-block;border:1px solid #4b644a;background:#294132;padding:4px 10px;font-size:11px;margin:3px}.small{font-size:12px;color:#a0b196}.rooms{margin-top:25px}.room{margin:30px 0;padding:25px;border:1px solid #46624c;background:linear-gradient(140deg,#18302470,#0d1e1780)}.room h2{margin-top:0;border:0;padding-top:0}input{width:100%;padding:15px 18px;background:#14291e;border:1px solid #82956d;color:#e4e8d5;font:15px Arial}input:focus{outline:2px solid #cdd8a1}#filter-note{font-size:12px;color:#aabc9d}.two{display:grid;grid-template-columns:1fr 1fr;gap:22px}.hide{display:none}@media(max-width:720px){main{padding:25px 16px}.room{padding:15px}.two{grid-template-columns:1fr}table{display:block;overflow:auto}.lead{font-size:17px}h1{font-size:34px}}@media print{body{background:white;color:#222}h1,h2,h3,th,td{color:#222}main{padding:0}table{font-size:9pt}figure,tr{break-inside:avoid}.room{break-before:page}details{display:block}.callout{background:#fafafa}img{max-height:155mm;object-fit:contain}input,nav{display:none}}'''
def page(title,body,script=''):
 return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+e(title)+'</title><style>'+STYLE+'</style></head><body><main>'+body+'</main>'+script+'</body></html>'
def table(headers,rows):
 return '<table><thead><tr>'+''.join('<th>'+e(h)+'</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+e(v)+'</td>' for v in row)+'</tr>' for row in rows)+'</tbody></table>'
def picture(c):
 p=R/'report/captures-v108'/c['file'];assert p.exists();src='data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()
 return f'<figure><img alt="{e(c["file"])}" loading="lazy" src="{src}"><figcaption><strong>{e(c["file"])}</strong> — {e(c["origin"])}. PNG Chromium direct, non retouché.</figcaption></figure>'
def diagram(room):
 width,depth=room['width'],room['depth'];out=[f'<svg class="diagram" viewBox="-25 -30 {width+50} {depth+90}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan calculé de {e(room["title"])}"><rect x="0" y="0" width="{width}" height="{depth}" fill="#142b21" stroke="#678268"/>']
 for b in room['solids']:
  color='#79b4b9' if b.get('material')=='glass' else '#687a61';out.append(f'<rect x="{b["x"]}" y="{b["z"]}" width="{b["w"]}" height="{b["d"]}" fill="{color}" fill-opacity=".6" stroke="#a8b69a"/><text x="{b["x"]+3}" y="{b["z"]+14}" fill="#eef1d6" font-size="11">{e(b["id"])}</text>')
 for b in room['doors']+room['hatches']:
  out.append(f'<rect x="{b["x"]}" y="{b["z"]}" width="{b["w"]}" height="{b["d"]}" fill="#b5965a55" stroke="#ddbe75" stroke-width="2" stroke-dasharray="4 3"/>')
 for p in room['props']:
  out.append(f'<circle cx="{p["x"]}" cy="{p["z"]}" r="6" fill="#c6d29c"/>')
 for ex in room['exits']:
  out.append(f'<circle cx="{ex["x"]}" cy="{ex["z"]}" r="12" fill="none" stroke="#a3d6b0" stroke-width="3"/><line x1="{ex["x"]}" y1="{ex["z"]}" x2="{ex["arrival"]["x"]}" y2="{ex["arrival"]["z"]}" stroke="#bad29f" stroke-dasharray="4 5"/><circle cx="{ex["arrival"]["x"]}" cy="{ex["arrival"]["z"]}" r="5" fill="#dfdeb3"/>')
 out.append(f'<text x="6" y="{depth+27}" fill="#b9c6a9" font-size="13">Volumes pleins : collision · Ambre : portes / sas de liaison · Vert : seuils · Points : props et arrivées</text></svg>');return ''.join(out)
RULES=[
 ('Un lieu continue sans le joueur','Dans l’opération, Hadley, Operations, la maintenance, l’infirmerie et le couloir de défense partagent le pas de simulation. Les sentinelles peuvent tirer hors champ, les créatures peuvent se déplacer. Le Sulaco est une inspection isolée. La pause suspend l’ensemble et aucun rattrapage de temps réel n’est appliqué au chargement.'),
 ('Une menace garde son identité','Les neuf ennemis de catalogue et la sentinelle ont des identifiants uniques. Huit ennemis appartiennent au réseau de l’opération. Aucun renfort ni respawn n’est ajouté. Un franchissement déplace le même acteur entre registres, sans restaurer sa vie. Chaque acteur est traité au plus une fois par sous-pas, même si sa destination est simulée après sa source.'),
 ('Voir, entendre, chercher','La vision d’un ennemi est limitée à 490 unités et exige une visibilité dégagée. Un son mémorise un point historique, pas la position future du joueur. La mémoire dure jusqu’à 24 secondes ; la recherche locale utilise cinq points testés contre les obstacles et cesse sans nouvel indice. Une cloison opaque bloque la vue ; le vitrage laisse voir mais reste une collision corporelle et balistique.'),
 ('Propagation par le plan','Le bruit utilise les chemins de la géométrie, jamais une distance entre deux noms de salles. Les pas rapides portent à 250 unités ; un tir à 1780 ; les portes locales à 560. Un passage coûte 160 unités et multiplie la portée restante par 0,74, avec deux raccords au maximum. Une fermeture coupe le chemin. C’est une abstraction tactique locale, pas un simulateur acoustique physique.'),
 ('Liaisons réellement isolables','Les cinq liaisons ont chacune un état partagé entre leurs deux extrémités. Fermer une liaison instancie les deux volumes dérivés, utilisés par mouvement, vue, tirs et navigation. Les plans de base ne sont pas modifiés. Le rayon du personnage compte dans la fermeture ; tout acteur vivant ou franchissement engagé empêche l’écrasement.'),
 ('R n’est pas E','E continue à servir pour les portes intérieures, commandes et transferts du groupe. R isole ou prépare la réouverture du sas de liaison à moins de 80 unités. L’ouverture prend 0,88 seconde, annulable par mouvement, tir, nouvelle commande ou impact. Les collisions restent fermées jusqu’à la fin. Le passage du groupe exige toujours regroupement et arrivée disponible.'),
 ('Franchir prend du temps','Un Xéno doit atteindre son seuil à moins de 18 unités, patienter 0,85 seconde, puis trouver une arrivée libre. Il attend si elle est occupée, au lieu d’apparaître sur le joueur. Une liaison fermée empêche le passage. Le transfert est une coupure de coordonnées entre deux lieux, pas un couloir continu ; la préparation et la réservation sont réellement simulées.'),
 ('Marcher prudemment','V active une demi-vitesse sans émission de pas. Cela ne rend ni invisible ni silencieux un tir. Les portes, les tirs des équipiers et la sentinelle restent des sources. L’allure est sauvegardée et visible dans le bandeau de contact.'),
 ('Le détecteur ne connaît pas tout','T mesure les déplacements récents de la pièce active dans un rayon de 600 unités. Les échos sont quantifiés par huit secteurs et tranches de 100 unités. Aucun nom, HP, ID ni coordonnée exacte n’est envoyé à l’instrument. Recharge : 2,4 secondes ; péremption : deux secondes. Une créature immobile, y compris en préparation d’attaque sans translation, peut ne pas être détectée. La carte ne consomme jamais cette mémoire.'),
 ('Défense sans faux succès','La défense ne se valide pas parce qu’un contact a quitté le couloir : les ennemis originaires de cette défense doivent être neutralisés, même déplacés ailleurs. Le temps de défense reste lié à la présence de Newt, au lieu actif et à l’ouverture de la cloison. Les autres objectifs locaux ne sont pas remplacés.'),
 ('Appuis et parallaxe','Les emprises proches gardent leurs coordonnées x/z. La console centrale d’Operations utilise son support élevé ; les passages n’héritent pas de la hauteur d’un acteur. Les masses lointaines utilisent les facteurs hérités 0,18 et 0,48. Le terrain, les personnages, les meubles et les seuils sont triés sur leur profondeur physique. Aucun concept art n’est employé en fond de jeu.'),
 ('Interface séparée','HUD, détecteur, ordres et commandes tactiles occupent des bandes hors du canvas. Carte, archives et pause remplacent la vue. La mesure du détecteur reste une mesure passée, non un radar temps réel. Les sons de retour sont synthétiques, locaux et désactivés par défaut ; pas de musique ou voix du film fournie.'),
 ('Reprendre avant de remplacer','Le schéma 108 valide contrat, registres, portes, positions, équipes, attaques, monde de résidence et mémoires avant remplacement. Une créature dupliquée, absente, ou un acteur dans un sas fermé est refusé. Les trajets calculés sont reconstruits ; les ressources, sas, stimuli, recharge et franchissement en cours persistent. Un import valide reprend en pause.'),
 ('Migration sans bonus','Un export V107 est validé par son validateur d’origine, puis converti en V108 sans soin, munition ni objectif supplémentaire. Les mémoires absentes en V107 sont initialisées vides et les nouveaux sas commencent ouverts. Un fichier V106 reste une inspection. Les sauvegardes natives Tantalus ne sont pas ce format.'),
 ('Recette d’un passage','Approcher sans bruit ; vérifier le seuil avec deux rayons différents ; fermer depuis les deux côtés ; refuser la fermeture occupée ; tirer sur le battant ; lancer une réouverture puis l’interrompre ; laisser une créature franchir et vérifier son ID ; recharger pendant le franchissement ; comparer tous les registres sans doubles ni soin. Recette navigateur et tests dirigés sont distingués dans le rapport.')]
# Readme, changelog and QA.
(R/'README.md').write_text(f'''# ALIENS V108 — Contact persistant / RC1

Suite directe de la branche autonome V107 Rallier Operations, pas une fusion au moteur Tantalus natif. L’archive conserve ses six lieux inspectables, ses cinq lieux reliés et ses cinq objectifs locaux. Elle ajoute le contact inter-pièces, les sas isolables, le bruit, la prudence et un détecteur mesuré.

## Jouer
Ouvrir `JOUER_ALIENS_V108.html` dans un navigateur récent. Le document contient ses dix modules et son CSS ; aucun asset réseau n’est requis. `JOUER_WINDOWS.bat` ouvre ce fichier. La vérification automatisée utilise les octets du document dans Chromium via `set_content`, sans changer le chargeur Blob. L’ouverture directe `file://` n’est pas certifiée dans cet environnement administré.

## Commandes
A/D ou Q/D, flèches : horizontal. W/S ou Z/S : profondeur. E : porte/commande/transfert. F ou clic : tirer. G/H/C : rallier/tenir/couvrir la sélection. R : sas de liaison. T : détecteur. V : prudence. M : carte. Tab : archives. Échap : pause. Les commandes tactiles restent sous le terrain.

## Continuer une sauvegarde
Importer un JSON V108 reprend tout le réseau en pause. Le JSON V107 est migré sans modifier vies, réserves ni jalons ; ses mémoires de menaces commencent vides. Le JSON V106 reste une inspection. Le point navigateur V108 est stocké sous une clé indépendante : pour un ancien point V107, utiliser son export JSON avec Importer.

## Livraison
- `src/operation-v108.mjs` : opération et validation 108.
- `src/contact-v108.mjs` : audition, perception, recherche, transferts, sas, détecteur.
- `src/spatial-core-v108.mjs` : noyau étendu aux volumes vivants des sas.
- Noyau V106, opération V107 et adaptateur V106 conservés pour tests/migrations.
- `CODEX_LEVEL_DESIGN_V108.html` / `.md` : six fiches de lieux et contrats.
- `RAPPORT_ILLUSTRE_V108.html` : {len(B['captures'])} vrais PNG de Chromium embarqués.
- `QA_REPORT.md` : {passed} tests Node, {len(B['tests'])} contrôles navigateur, deux parcours terminés et un exercice de poursuite.

## Reproduction
```sh
npm run check
node qa/drive-v108.mjs
node qa/drive-pursuit-v108.mjs
node tools/export-contracts-v108.mjs
python tools/build-preview.py
python qa/browser-v108.py
python tools/build-docs-v108.py
python qa/distribution-smoke-v108.py
python tools/release-check-v108.py
python tools/verify-package.py
```
Playwright/Chromium ne sont requis que pour refaire les tests navigateur et captures, pas pour jouer. Ces outils ne sont pas inclus. Le vérificateur d’intégrité est en lecture seule ; refaire les recettes peut changer les preuves et donc les hashes du paquet initial.

## Limites
Pas de campagne filmique intégrale, de fusion dans les 64 salles natives, de nouveau final Reine/P-5000, de raccord réseau/GitHub/Vercel, de nouvelle salle ou de sprites définitifs. Les combats utilisent les silhouettes procédurales de la branche. Le contact change de salle par seuil discret, pas par streaming continu. Le modèle sonore informe l’IA ; le retour audible est une synthèse simple, pas un mix spatial de production. Neuf ennemis de catalogue au total, dont un dans le Sulaco isolé ; aucun spawn illimité ajouté.

## Provenance
Base : `{PROV['archive']}`\nSHA-256 : `{PROV['sha256']}`.
''')
(R/'CHANGELOG_V108.md').write_text('''# V108 RC1 — Contact persistant

## Jeu
Les cinq lieux de l’opération avancent désormais au même pas. Une menace garde sa mémoire, rejoint un seuil ouvert, prépare son passage 0,85 seconde et réserve une arrivée libre. Le registre ne recrée pas l’acteur et refuse les doublons à la reprise.

Les cinq liaisons disposent de dix volumes de seuils dérivés d’un état réciproque. R ferme ou prépare l’ouverture ; le noyau de géométrie utilise ces volumes pour corps, rayons, perception et navigation. L’état est distinct des portes intérieures, mais n’est pas un simple verrou d’interface.

Tirs, pas rapides et commandes produisent des stimuli bornés, atténués par le trajet. La vision est requise pour suivre un acteur. Hors vue, les Xénos recherchent le dernier point connu puis abandonnent faute d’indice. V permet de marcher à demi-vitesse sans émettre de pas. Le détecteur T mesure seulement les mouvements récents de la pièce, par secteur et portée quantifiée, avec délai et péremption.

La défense compte ses menaces déplacées, afin qu’une sortie du couloir ne déclenche pas une réussite gratuite. Les compagnons et Newt conservent leurs ordres et leurs rôles.

## Présentation
Bandeau de contact hors canvas, contrôles de liaison et d’allure, affichage des échos mesurés, sas reliés à leurs volumes, ennemis masqués lorsqu’ils ne sont pas observables. Carte des liaisons fermées sans liste de menaces. Les contrôles tactiles sont remis dans le flux sous le terrain. Sons synthétiques originaux désactivés par défaut.

## Persistance
Schéma 108 strict ; état de résidence des créatures, mémoire, stimuli, sas, détecteur et traversée sauvegardés. Import V107 validé puis migré sans soins ni ressources ; V106 reste une inspection. Noyau V106, données de scènes, opération V107 et adaptateur V106 conservés ; `spatial-core-v108.mjs` est l’extension utilisée par la branche V108.

## Pas ajouté
Ni nouvelle salle, ni population supplémentaire, ni fusion native, ni doublage, ni nouveau combat P-5000. Le passage inter-pièces reste discret. Le réseau acoustique est une règle tactique, pas une simulation physique de studio audio.
''')
# Codex.
body='<p class="eyebrow">Aliens 1986 / V108 / Livre des lieux</p><h1>Un passage peut être ouvert.<br>Le contact peut suivre.</h1><p class="lead">Codex de la branche locale : six lieux, cinq liaisons réciproques, une seule géométrie utile au mouvement, au tir et à la perception.</p><div class="callout">Ce livre décrit les sources V108 exécutées. Il n’affirme ni la refonte ni la validation des 64 salles natives de Tantalus. Les six géométries de base de V107 sont conservées ; les sas de liaison sont des volumes vivants dérivés du réseau.</div><nav><a href="#doctrine">Doctrine</a><a href="#rooms">Fiches de lieux</a><a href="RAPPORT_ILLUSTRE_V108.html">Rapport illustré</a><a href="JOUER_ALIENS_V108.html">Jouer</a></nav><h2 id="doctrine">Contrats obligatoires</h2>'
md=['# Codex Level Design — Aliens V108 / Contact persistant','\nBranche autonome héritée de V107 : six lieux inspectables, cinq reliés. Aucun raccord natif V105 revendiqué.']
for title,text in RULES:
 body+=f'<details><summary>{e(title)}</summary><p>{e(text)}</p></details>';md+=['\n## '+title,text]
body+='<h2 id="rooms">Fiches de lieux exécutés</h2><input type="search" id="filter" placeholder="Rechercher un lieu, un support ou une commande…" aria-label="Filtrer les fiches"><p id="filter-note">6 lieux · plans et coordonnées tirés des mêmes données que le jeu</p><div class="rooms">'
rooms_notes={
 'v106-hadley':('Isolation résidentielle','Le clapet intérieur sépare l’entrée du couloir est. La fermeture du raccord Operations peut arrêter une poursuite, mais il faut rejoindre son contrôle sans occuper son battant. Utiliser la profondeur pour passer au sud des contacts avant le seuil.'),
 'v107-operations':('Carrefour sous pression','Ne pas confondre le tableau de situation avec un radar : ses nœuds sont des lieux, pas des monstres. Le meuble central casse les chemins et la vue. Les trois branches donnent des options de repli ; une mémoire ancienne n’informe pas la menace de votre branche suivante.'),
 'v107-service':('Route de service','Le clapet manuel, la pompe et le transformateur fixent les passages. Un tir près du raccord peut alerter l’autre côté si le chemin et la liaison restent ouverts. Le relais garde son rôle de jalon local : ce n’est pas un réseau électrique général.'),
 'v106-medlab':('Voir sans toucher','Les vitrages distinguent la vue du passage. Les parasites peuvent voir derrière une vitre sans la traverser. Newt reste hors ciblage avant recrutement ; une fois escortée elle doit rejoindre les seuils et peut être blessée. L’accès de service offre une autre sortie.'),
 'v106-sentry':('Compter les menaces, pas leur présence','La sentinelle attend une ligne libre et continue hors champ. Une créature qui rejoint Operations existe toujours : quitter ce couloir ne la retire pas de la condition de défense. La fermeture d’une liaison peut contenir un contact ou couper un repli.'),
 'v106-sulaco':('Inspection sans nouveau final','Ce hangar reste une inspection isolée. Le P-5000 est une représentation de validation et la commande du sas extérieur reste réservée. Il n’y a pas ici de victoire Reine/P-5000 ni de raccord ajouté à l’opération.')}
for room in C['rooms']:
 title,text=rooms_notes[room['id']];body+=f'<article class="room" data-search="{e(json.dumps(room,ensure_ascii=False).lower())}"><p class="eyebrow">{e(room["id"])} / {e(room["mode"])} / {"OPÉRATION" if room["connected"] else "INSPECTION"}</p><h2>{e(room["title"])}</h2><p>{e(room["subtitle"])}</p><h3>{e(title)}</h3><p>{e(text)}</p>'+diagram(room)
 body+=table(['Entrée / destination','Seuil x,z','Arrivée de retour','Sas commun'],[[x['label'],f"{x['x']}, {x['z']}",f"{x['arrival']['x']}, {x['arrival']['z']}",x['linkId']] for x in room['exits']])
 body+=table(['Collision','x / z','Largeur / profondeur','Hauteur / matériau'],[[v['id'],f"{v['x']} / {v['z']}",f"{v['w']} / {v['d']}",f"{v.get('h','—')} / {v.get('material','structure')}"] for v in room['solids']+room['doors']+room['hatches']])
 body+=table(['Équipement','Support','Position x,z','Élévation'],[[p['type']+' · '+p['id'],p.get('support','—'),f"{p['x']}, {p['z']}",p.get('elevation',0)] for p in room['props']])
 body+='<h3>Recette locale</h3><p>Tester chaque commande depuis les deux côtés de ses cloisons. Tirer avant et après ouverture. Comparer le chemin d’un Marine, de Newt et d’un Warrior. Reprendre le fichier pendant un geste et pendant une poursuite. Aucun meuble ne doit changer de position sous l’effet de la caméra ; aucune fermeture ne doit englober un acteur.</p></article>'
 md+=['\n## '+room['title'],room['subtitle'],title+' — '+text,'\n### Passages']+[f"- {x['label']} : seuil ({x['x']}, {x['z']}), arrivée ({x['arrival']['x']}, {x['arrival']['z']}), liaison {x['linkId']}." for x in room['exits']]
 md+=['\n### Volumes']+[f"- {v['id']} : x={v['x']} z={v['z']} w={v['w']} d={v['d']} h={v.get('h','—')}." for v in room['solids']+room['doors']+room['hatches']]
 md+=['\n### Appuis']+[f"- {p['id']} ({p['type']}) : {p['support']} ; ({p['x']}, {p['z']}) ; élévation {p.get('elevation',0)}." for p in room['props']]
body+='</div><h2>Contrôle de version</h2><p class="mono">Contrat '+e(C['contract'])+' · Version '+e(C['version'])+'</p><p>Ne pas modifier une collision uniquement dans le renderer. Toute évolution de catalogue exige validation, mise à jour de contrat et reprise contrôlée des anciennes sauvegardes.</p>'
script='''<script>const f=document.getElementById('filter'),cards=[...document.querySelectorAll('.room')];f.addEventListener('input',()=>{const q=f.value.toLowerCase().trim();let n=0;for(const c of cards){c.classList.toggle('hide',!c.dataset.search.includes(q));if(!c.classList.contains('hide'))n++;}document.getElementById('filter-note').textContent=n+' lieu(x) correspondant(s)';});</script>'''
(R/'CODEX_LEVEL_DESIGN_V108.html').write_text(page('Aliens V108 — Codex des contacts et passages',body,script));(R/'CODEX_LEVEL_DESIGN_V108.md').write_text('\n\n'.join(md)+'\n')
# QA and evidence report.
qa=f'''# QA — ALIENS V108 Contact persistant / RC1

## Résultat local
{passed} tests Node passent : 111 tests hérités (56 V106 + 55 V107) et {passed-111} nouveaux tests V108. {len(B['tests'])} contrôles navigateur dans cinq contextes de recette ; 0 erreur JavaScript/console observée. Deux opérations locales complètes sont terminées et un exercice distinct de poursuite teste deux franchissements ennemis. Aucun chiffre ne décrit une certification du moteur Tantalus natif.

## Sources
Archive de départ : {PROV['archive']}. SHA-256 : {PROV['sha256']}.
Noyau V106 et opération V107 conservés. Le nouveau noyau spatial V108 ajoute les volumes vivants dérivés des sas au même chemin de collision/perception/ballistique. Les géométries statiques gardent leurs empreintes de base ; le contrat de session est {C['contract']}.

## Ce qui est testé
Vue bloquée par porte opaque, vue à travers vitrage sans attaque au travers, audition par chemins, isolation réciproque, mémoire non omnisciente, expiration, prudence, file sonore bornée, simulation des pièces hors champ, sentinelle à munitions finies, franchissement temporisé et arrivée occupée, conservation d’identité, impossibilité de traverser un sas isolé, volumes dérivés bloquant corps/vue/tirs, pause globale, échos de déplacement quantifiés et périmés, recharge sauvegardée, import strict avec populations déplacées, migration V107 sans ressources, absence de carte radar, protection de Newt avant recrutement, défense qui compte les menaces sorties.

Les tests dirigés utilisent des états préparés pour isoler des invariants. Ils ne sont pas des playthroughs. Les deux scripts de conduite distincts n’écrivent ni positions, ni HP, ni munitions, ni objectifs : ils utilisent mouvement, tir, commandes et progression du temps.

## Opérations complètes
'''
for v in D['results']:
 qa+=f"\n### {v['variant']}\nTerminé : {v['complete']}. {v['inputs']} entrées/substeps, {v['transfers']} passages de groupe, {v['elapsed']} secondes de simulation (pas une durée de jeu humaine).\n\n"+'\n'.join(f"- {a['id']} : {a['hp']} PV, {a['ammo']} munitions." for a in v['ammunition'])+'\n'
qa+=f'''
## Exercice de poursuite
`qa/drive-pursuit-v108.mjs` part de l’insertion normale. Il ouvre la porte résidentielle, laisse les ennemis vivants, contourne en profondeur, sort avec le groupe, attend leur arrivée, mesure un déplacement au détecteur, réplique et isole le sas depuis son contrôle. Les fichiers de `report/pursuit-states/` sont ses exports non retouchés.
Résultat : {P['enemyTransfers']} transferts ennemis, {P['steps']} entrées/substeps. Aucun contact créé ; identités/vies/mémoires conservées. Les réserves après cette séquence sont : {', '.join(f"{a['id']}={a['ammo']}" for a in P['team'])}.

## Navigateur
Le HTML distribué est chargé par ses octets autorisés via `set_content`, avec son chargeur Blob habituel. Aucun accès QA ni hook de mutation d’état n’est ajouté à la page. Les fichiers JSON sont importés avec le vrai contrôle de fichier ; les exports sont des téléchargements réels. Le début du parcours est joué au clavier et à la souris. La poursuite est reprise au point de fuite puis simulée dans Chromium, avec déplacement réel du joueur. Les instruments, sas, imports invalides, mode prudent, options et layouts tactiles sont testés par UI.

La première sonde de détecteur sur un ennemi immobile en préparation d’attaque ne donnait logiquement pas d’écho. Le pilote de mesure attend maintenant un vrai déplacement avant T ; aucune vitesse ou donnée d’écho n’est injectée. La recette d’interruption de sas est un essai distinct démarré depuis le point fermé, pour ne pas confondre temps de capture et temps d’ouverture.

## Captures
{len(B['captures'])} PNG bruts de Chromium, non retouchés. Chaque provenance figure dans `report/browser-results-v108.json` et le rapport. Les vues reprises de parcours utilisent des exports non modifiés. Ni concepts générés, ni dessins Python à partir d’un relevé. Le rendu reste procédural stylisé, pas le rendu final natif.

## Limites
Les cinq salles de l’opération simulent leurs contacts ; l’inspection ne simule que sa salle. Les transferts sont discrets après seuil et réservation, pas continus. Les tirs restent locaux à une pièce. Le retour sonore optionnel est synthétique et local. Pas de nouvelle salle, de streaming natif, de final Reine/P-5000, de multijoueur, de manette certifiée, de sprites définitifs ou de publication distante. Le 844×390 tactile et le 390×844 sont émulés, pas des téléphones physiques.
Le jeu n’altère pas le dépôt, son service worker ou ses sauvegardes natives. L’ancien adaptateur V106 conservé n’est pas un raccord V108 activé.

## Intégrité et transport
SHA-256 du HTML soumis à la recette navigateur : {B['htmlSha256']}.
`python tools/verify-package.py` lit les hashes sans les réécrire. Les recettes de construction régénèrent volontairement les preuves ; elles peuvent modifier les hashes de distribution. Aucun média externe requis pour jouer.
'''
if (R/'report/distribution-smoke-v108.json').exists():
 smoke=J('report/distribution-smoke-v108.json')
 qa+='\n## Vérification de distribution séparée\n'+str(len(smoke['checks']))+' contrôles additionnels passent : initialisation du document exact, export réel, registre des cinq sas, absence de requêtes externes, six fiches Codex filtrables, seize PNG embarqués et décodables, absence d’erreur JS observée et égalité du hash du jeu. Ils ne sont pas ajoutés aux 64 contrôles gameplay.\nTransport direct file:// : '+smoke['transport']['directFileNavigation']+'. Les octets autorisés sont ensuite chargés par set_content, sans modification des options de sécurité.\n'
 qa+='\nDix sources/tests hérités sont comparés octet pour octet à la V107 dans baseline/SOURCES_PRESERVEES_V107.json. Les états dans report/states sont des fixtures V107 de migration ; les preuves de parcours V108 sont séparées.\n'
(R/'QA_REPORT.md').write_text(qa)
report='<p class="eyebrow">Aliens 1986 / V108 / Rapport de livraison</p><h1>Le contact ne disparaît plus<br>derrière un changement de pièce.</h1><p class="lead">Une continuation de V107 : poursuite, audition, sas physiques et détecteur mesuré, dans les mêmes lieux et le même parcours local.</p><div class="callout"><strong>Périmètre exact :</strong> branche autonome exécutée dans Chromium. Pas le site Vercel, ni les 64 salles natives, ni une campagne intégrale nouvellement terminée. Les images ci-dessous sont les PNG directs du HTML livré.</div>'
report+='<div class="metrics">'+''.join(f'<div class="metric"><strong>{n}</strong><small>{e(label)}</small></div>' for n,label in [(passed,'tests Node / hérités inclus'),(len(B['tests']),'contrôles navigateur'),(len(B['captures']),'captures Chromium'),(2,'parcours complets locaux')])+'</div><nav><a href="JOUER_ALIENS_V108.html">Jouer</a><a href="CODEX_LEVEL_DESIGN_V108.html">Codex</a><a href="QA_REPORT.md">QA détaillée</a></nav>'
report+='<h2>Ce qui a changé</h2>'+table(['Domaine','V108 réellement implémenté'],[[title,text] for title,text in RULES[:10]])
report+='<h2>Poursuite et instrumentation</h2>'
byname={x['file']:x for x in B['captures']}
for fn in ['10_contact_poursuite.png','11_detecteur_mesure.png','12_sas_isole.png','13_reouverture_sas.png','14_carte_isolement.png']:
 report+=picture(byname[fn])
report+='<h2>Parcours, escorte et défense</h2>'
for fn in ['00_menu.png','01_ouverture_en_cours.png','02_operations_arrivee.png','03_relais_retabli.png','04_newt_recrutee.png','05_escorte_operations.png','06_sentry_contact.png','07_carte_liaisons.png','08_bilan_repli.png','09_service_844x390.png','15_tactile_844.png']:
 report+=picture(byname[fn])
report+='<h2>Résultats des parcours</h2>'+table(['Parcours','Fin','Passages groupe','Temps de simulation','Munitions finales'],[[v['variant'],str(v['complete']),v['transfers'],str(v['elapsed'])+' s',', '.join(a['id']+': '+str(a['ammo']) for a in v['ammunition'])] for v in D['results']])
report+='<p class="small">Ces durées sont celles d’un pilote automatisé, pas une promesse de durée pour le joueur.</p><h2>Contrôles navigateur</h2>'+table(['N°','Contrôle','Résultat'],[[i+1,t['name'],'PASS' if t['ok'] else 'FAIL'] for i,t in enumerate(B['tests'])])
report+='<h2>Limites et méthode</h2><p>Le transfert du groupe et des contacts passe par un seuil discret. Les réservations empêchent les arrivées sur un acteur ; elles ne remplacent pas un corridor continu. La simulation acoustique est une abstraction tactique. Les tirs ne traversent pas les limites des salles. Les images montrent des silhouettes procédurales, sans nouveaux assets officiels ou finaux.</p><p>Les snapshots de poursuite et les reprises de parcours sont issus de scripts qui n’écrivent pas les positions, les ressources ou la progression. Certaines recettes unitaires utilisent des états préparés, identifiés séparément. Aucun push ou déploiement n’a été réalisé.</p><h3>Provenance de base</h3><pre>'+e(PROV['archive']+'\n'+PROV['sha256'])+'</pre><h3>Document navigateur testé</h3><pre>'+e(B['htmlSha256'])+'</pre>'
(R/'RAPPORT_ILLUSTRE_V108.html').write_text(page('Aliens V108 — Rapport illustré',report))
(R/'JOUER_WINDOWS.bat').write_text('@echo off\nstart "" "%~dp0JOUER_ALIENS_V108.html"\n')
print(json.dumps({'codexHTML':(R/'CODEX_LEVEL_DESIGN_V108.html').stat().st_size,'codexMarkdown':(R/'CODEX_LEVEL_DESIGN_V108.md').stat().st_size,'reportHTML':(R/'RAPPORT_ILLUSTRE_V108.html').stat().st_size,'nodeTests':passed,'browserTests':len(B['tests']),'images':len(B['captures'])}))
