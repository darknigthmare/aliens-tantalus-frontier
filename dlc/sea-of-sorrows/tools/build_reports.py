#!/usr/bin/env python3
"""Build current reports from actual evidence. No invented capture or benchmark."""
from pathlib import Path
import json, hashlib, re, html, io, base64
from PIL import Image
from report_shared import ROOT, D, VERSION, md, page, schematic

def load(p):return json.loads((ROOT/p).read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
paths=['reports/browser-regression.json','reports/field-browser.json','reports/rearguard-browser.json','reports/trace-browser.json','reports/v060/browser.json','reports/v070/browser.json','reports/v080/browser.json','reports/v090/browser.json']
bs=[load(p)for p in paths];hh=sha(ROOT/'MER_DES_CHAGRINS_JOUABLE.html');assert VERSION=='0.9.0'
assert all(b['version']==VERSION and b['html_sha256']==hh and b['failed']==0 and not b.get('fatal')and not b.get('errors')for b in bs),'Current successful browser evidence required'
node=load('reports/node-inputs.json');assert node['version']==VERSION and node['passed']==432 and node['failed']==0
assert all(sha(ROOT/p)==h for p,h in node['source_sha256'].items())
campaign=load('reports/v090/campaign.json');runs=campaign['outcomes'];assert len(runs)==6 and all(o['passed']and o['objectives']==33 and len(o['rooms'])==50 for o in runs)
assert all(sha(ROOT/p)==h for p,h in campaign['source_sha256'].items())
nb=sum(b['passed']for b in bs);baseline=load('reports/difficulty-traversals.json')
counts=dict(version=VERSION,rooms=len(D['rooms']),links=len(D['edges']),chapters=len(D['chapters']),objectives=sum(len(c['objectives'])for c in D['chapters']),dossiers=len(D['codex']),static_obstacles=sum(len(r['obstacles'])for r in D['rooms']),dressing_placements=sum(len(r['dressing'])for r in D['rooms']),dressing_families=len({p['kind']for r in D['rooms']for p in r['dressing']}),fixed_devices=sum(len(r['devices'])for r in D['rooms']),hazards=sum(len(r['hazards'])for r in D['rooms']),shutters=sum(len(r['shutters'])for r in D['rooms']),readings=sum(len(r['echoes'])for r in D['rooms']),pursuit_links=len({d['pair']for r in D['rooms']for d in r['doors']if d.get('pursuitAllowed')}),lighting_circuits=sum(bool(r.get('lighting'))for r in D['rooms']),lockers=sum(len(r.get('lockers',[]))for r in D['rooms']),convoy_formations=3,storage_categories=7,keyboard_actions=31,procedural_cues=21,mix_controls=4,maximum_captions=2,save_schema=8,javascript_modules=9,host_native_integration=False,published=False)
(ROOT/'reports/CONTENT_COUNTS.json').write_text(json.dumps(counts,ensure_ascii=False,indent=2)+'\n')
roomdoc=md((ROOT/'docs/CODEX_LEVEL_DESIGN_50_SALLES.md').read_text())
for r in D['rooms']:
 m=re.search(r'<h3>'+re.escape(r['id'].upper())+r'[^<]*</h3>',roomdoc);assert m,r['id']
 roomdoc=roomdoc[:m.start()]+m.group().replace('<h3>',f'<h3 id="room-{r["id"]}">')+schematic(r)+roomdoc[m.end():]
assert roomdoc.count('class="schematic"')==50
links='<div class="roomlinks">'+''.join(f'<a href="#room-{r["id"]}">{r["id"].upper()} · {html.escape(r["name"])}</a>'for r in D['rooms'])+'</div>'
header='''<header><div class="eyebrow">CODEX DE PRODUCTION / VERSION 0.9.0</div><h1>Les échos<br>du terrain</h1><p class="sub">Entendre sans tout savoir. Interagir avec ses commandes. Reprendre depuis une copie vérifiée.</p><span class="tag">DLC AUTONOME · MÉCANIQUES ORIGINALES NON OFFICIELLES</span><nav><a href="#guide">Guide</a><a href="#salles">50 salles</a><a href="#registre">120 dossiers</a><a href="#sources">Continuité</a></nav></header>'''
registry='<section id="registre"><h2>Registre des 120 dossiers</h2><p>Ce document de production montre tous les textes. Dans le jeu, leur accès dépend de la progression et des découvertes ; les plans et notices ne sont pas des passages authentifiés du roman.</p>'+''.join('<details><summary>'+html.escape(c['title'])+'</summary><p>'+html.escape(c['text'])+'</p><p class="mini">'+html.escape(c['id']+' · '+c.get('category',''))+'</p></details>'for c in D['codex'])+'</section>'
codex=page('Codex 0.9.0 — La Mer des Chagrins',header,'<section id="guide">'+md((ROOT/'docs/CODEX_DLC_MER_DES_CHAGRINS.md').read_text())+'</section><section id="salles"><h2>Choisir une salle</h2>'+links+roomdoc+'</section>'+registry+'<section id="sources">'+md((ROOT/'docs/SOURCES_CONTINUITE.md').read_text())+'</section>')
(ROOT/'CODEX_MER_DES_CHAGRINS.html').write_text(codex)
labels={'HYBRID':'Hybride','CLASSIC':'Latérale','exploration':'Exploration','survival':'Survie','oppression':'Oppression'}
rows=''
for o in runs:
 ints=[a['integrity']for a in o['convoy']['actors']]
 rows+=f'<tr><td>{labels[o["presentation"]]}</td><td>{labels[o["difficulty"]]}</td><td>{o["objectives"]} / 33</td><td>{len(o["rooms"])}</td><td>{o["observationsWithoutMutation"]}</td><td>{sum(o["cueCounts"].values())}</td><td>{ints[0]:.1f} / {ints[1]:.1f}</td></tr>'
run_table='<table><thead><tr><th>Vue</th><th>Difficulté</th><th>Objectifs</th><th>Salles</th><th>Contrôles d’invariance</th><th>Signaux observés</th><th>Intégrité finale Adams / Elway</th></tr></thead><tbody>'+rows+'</tbody></table>'
qa=f'''# Rapport QA — 0.9.0 · Les échos du terrain

## Résultat courant

{node['passed']} tests Node réussis et {nb} contrôles de jeu/audio dans Chromium réussis sur le véritable HTML de cette version. Les sept suites héritées totalisent {sum(b['passed']for b in bs[:-1])} contrôles ; la suite actuelle en ajoute {bs[-1]['passed']}. Les tests isolés peuvent préparer un état ; ce ne sont pas des parties.

Les six parcours visitent chacun 50 salles, terminent 33 objectifs, ouvrent les dix casiers, utilisent les cloisons et éclairages, les trois allures, les huit lectures, un capteur et une retraite réellement poursuivie. 198 exports sont réimportés après les objectifs. Le pilote utilise les commandes et le calcul de chemins du moteur sans imposer santé, ressources, positions ou progression. Ce ne sont pas des parties humaines complètes ni une estimation de durée de jeu.

L’observateur sonore reçoit les événements puis le déplacement courant. Des comparaisons périodiques d’export vérifient qu’il ne modifie aucun état de simulation. Les compteurs de signaux incluent les répétitions réelles des pas et du travail ; ils ne correspondent pas à des fichiers audio uniques. Le mixage peut être muet sans modifier l’IA.

## Contrôles audio et stockage

Les 21 profils sont rendus dans un véritable OfflineAudioContext. Les échantillons sont finis, non silencieux à volume normal, avec des crêtes et niveaux efficaces consignés dans browser.json. Le bus muet produit des zéros et le panoramique gauche répartit réellement l’énergie stéréo. Un vrai AudioContext est aussi activé par le bouton de test puis suspendu, sans voix restante. Aucun casque ou haut-parleur physique n’a été évalué, et la qualité artistique d’écoute humaine n’est pas certifiée.

SONS_PROCEDURAUX_TEST.wav est une suite de 21 signaux isolés rendus par le même synthétiseur, sans capturer une partie. Pas de voix, musique ou bruitage officiel. Une légère coloration de l’ambiance est procédurale, pas un environnement acoustique modélisé en 3D.

Les copies de sauvegarde sont testées avec stockage normal, refus d’écriture, contenu courant illisible, secours valide et contenu relu différent. Les fautes sont explicitement injectées. La restauration exige une confirmation. Les deux clés ne constituent pas une transaction atomique et restent exposées à l’effacement des données du navigateur. Exporter un fichier reste nécessaire pour une copie indépendante.

## Corrections et essais conservés

Le HUD annonçait une attaque préparée à partir de la liste complète des ennemis locaux : le nouveau filtrage exige proximité et ligne de vue pour ne pas devenir un détecteur de menace cachée. Une touche de roue tenue pouvait la refermer à sa répétition ; la fermeture exige désormais une nouvelle pression. Le maintien d’interaction reconfiguré est vérifié en ouvrant réellement un casier avec M.

Deux assertions de régression se référaient à un ancien intitulé du guide et à la casse fixe de la touche Espace. Elles ont d’abord échoué ; elles vérifient maintenant la présence du contenu Casier et la véritable touche affichée. Les journaux de cette première passe sont conservés dans reports/v090/initial-regression-notes.txt. Aucune règle de progression n’a été désactivée pour réussir ces assertions.

Le pilote direct échoue encore en Latérale / Survie (s28) et Latérale / Oppression (s25). Les quatre autres essais directs se terminent. Ce résultat courant figure dans difficulty-traversals.json avec les empreintes des sources. Il ne signifie pas que ces modes sont impossibles ; les six parcours prudents fournissent une route viable, pas une validation définitive de l’équilibrage humain.

## Méthode navigateur et limites

Les deux navigations natives file:// et HTTP local ont réellement été tentées : ERR_BLOCKED_BY_ADMINISTRATOR. Les vérifications suivantes chargent le véritable HTML dans le DOM avec un stockage mémoire déclaré, sans contourner la politique de navigation. L’ouverture par double-clic, la persistance native, les permissions système et le comportement d’une manette sur matériel physique ne sont pas certifiés.

Les 100 rendus généraux, 48 états de cloisons, 40 états d’éclairage et huit rendus d’annexes sont des contrôles préparés. Les captures avancées du rapport indiquent leur sauvegarde d’origine ; le scénario de corruption est explicitement distinct. Les commandes mobiles sont contrôlées à 390 et 360 pixels pour le panneau, pas pour une partie tactile complète.

## Contenu et intégration

50 salles, 59 liaisons, 18 chapitres, 33 objectifs, 120 dossiers. 31 actions clavier, 21 profils sonores, quatre niveaux de mixage ; neuf modules JavaScript. Le schéma de sauvegarde reste 8, les préférences étant séparées de la partie. Les 198 exports de la v0.8 sont conservés et relus dans les tests.

Le rendu reste vectoriel stylisé provisoire. Pas de doublage, de coopération, de nouvelle physique verticale ou d’extension narrative de chapitre. Les populations ordinaires hors champ restent figées, sauf poursuite engagée. Aucun adaptateur natif du moteur hôte, aucun push GitHub et aucun déploiement Vercel.
'''
(ROOT/'docs/QA_REPORT.md').write_text(qa)
figs=''
for c in bs[-1]['captures']:
 p=ROOT/'reports/v090/captures'/c['file'];assert sha(p)==c['sha256'];image=Image.open(p);buf=io.BytesIO();image.save(buf,'WEBP',quality=84,method=6)
 cls=' class="phone"' if image.width<image.height else ''
 figs+=f'<figure{cls}><img loading="lazy" alt="{html.escape(c["caption"],quote=True)}" src="data:image/webp;base64,{base64.b64encode(buf.getvalue()).decode()}"><figcaption>{html.escape(c["caption"])} <span class="mini">PNG original : {html.escape(c["file"])}</span></figcaption></figure>\n'
current_header='''<header><div class="eyebrow">RAPPORT DE LIVRAISON / VERSION 0.9.0</div><h1>Les échos<br>du terrain</h1><p class="sub">Le son suit la simulation. Les commandes suivent le joueur. Une copie valide reste identifiée.</p><span class="tag">PROTOTYPE AUTONOME · NON INTÉGRÉ AU JEU HÔTE</span><nav><a href="#avancees">Évolutions</a><a href="#resultats">Validation</a><a href="#captures">8 captures</a><a href="#parcours">Campagne</a><a href="#limites">Méthodes et limites</a></nav></header>'''
body='''<section id="avancees"><h2>Une passe de confort, sans simulation parallèle</h2><div class="cards"><article><h3>Un mixage volontaire</h3><p>21 profils procéduraux et une ambiance locale. Volume général, ambiance, effets et alertes indépendants. Au premier lancement, le son reste muet jusqu’à activation.</p></article><article><h3>Lire sans tout révéler</h3><p>Deux légendes prioritaires sous le terrain. Les attaques ordinaires sont proches et visibles ; les capteurs et seuils relaient seulement les observations reçues.</p></article><article><h3>31 actions personnalisables</h3><p>Affectation au clavier, conflits refusés, maintiens conservés. Les indications du terrain et de la roue suivent la nouvelle touche ; aucun tir fantôme après pause.</p></article><article><h3>Une copie relue</h3><p>Validation avant remplacement, dernier état valide protégé et restauration confirmée. Une erreur d’écriture est affichée ; l’export reste la copie indépendante.</p></article></div></section>'''
body+=f'''<section id="resultats"><div class="stats"><article><strong>{node['passed']} / {node['passed']}</strong><span>Tests Node</span></article><article><strong>{nb} / {nb}</strong><span>Contrôles Chromium</span></article><article><strong>6 / 6</strong><span>Parcours prudents terminés</span></article><article><strong>21 / 21</strong><span>Signaux audio rendus</span></article></div><p class="note">Prototype exécuté dans le navigateur avec stockage mémoire déclaré ; navigation native locale refusée. Pas de certification de persistance, de manette physique ou d’écoute humaine. Les données de campagne et le schéma 8 sont conservés.</p></section>'''
body+='<section id="captures"><h2>Captures de cette version</h2><p>Images du HTML livré dans Chromium, pas des illustrations conceptuelles. Les captures avancées gardent les positions des sauvegardes gagnées ; le scénario de corruption est signalé séparément. Les PNG originaux, états photographiés et empreintes sont inclus.</p>'+figs+'</section>'
body+='<section id="parcours"><h2>Six parcours, un état de jeu inchangé par le son</h2>'+run_table+'<p>Les comparaisons d’export sont faites avant et après l’observation des événements. Les intégrités ci-dessus sont les valeurs réelles de fin de parcours, sans remplissage pour la présentation. Les signaux comptés sont des émissions, pas des types de sons différents.</p></section>'
body+='<section id="limites">'+md(qa)+'</section>'
(ROOT/'reports/RAPPORT_ILLUSTRE.html').write_text(page('Rapport 0.9.0 — La Mer des Chagrins',current_header,body))
print('Current codex/report built:',node['passed'],'Node,',nb,'Chromium,',len(bs[-1]['captures']),'captures.')
