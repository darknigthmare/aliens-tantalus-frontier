"""Authored 0.7 extension: scanner service stations and explicit behavior rules."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
p=R/'src/content.json'; c=json.loads(p.read_text())
c['meta'].update(version='0.7.0',edition='Échos dans le noir')
# Idempotent; never replace earlier levels or solid footprints.
for r in c['rooms']:r['props']=[p for p in r['props'] if not p.get('addedV07')]
c['rules']=[s for s in c['rules'] if not s.startswith('SIG07/')]
c['signals']={
 'range':750,'interferenceRange':450,'interferenceRooms':['a_core','r_alpha','r_beta'],
 'interval':.8,'echoLife':1.45,'minimumTravel':2.0,'chargeRate':.44,
 'swapTime':1.6,'swapCharge':70,'dockTime':2.4,'pingNoise':.20,
 'stations':[
  {'id':'sig_comms','room':'c_reception','x':580,'y':360,'label':'Accueil · Banc de charge'},
  {'id':'sig_medical','room':'m_staff','x':785,'y':365,'label':'Salle de garde · Banc de charge'},
  {'id':'sig_logistics','room':'d_relay','x':775,'y':365,'label':'Relais · Banc de charge'},
  {'id':'sig_eva','room':'e_lockers','x':775,'y':360,'label':'Atelier EVA · Banc de charge'}
 ]
}
room_ids={r['id'] for r in c['rooms']}
c['signals']['interferenceRooms']=[s for s in c['signals']['interferenceRooms'] if s in room_ids]
for s in c['signals']['stations']:
 r=next(r for r in c['rooms'] if r['id']==s['room'])
 r['props'].append({'id':s['id'],'kind':'engineering_console','x':s['x'],'y':s['y'],'w':56,'d':30,'solid':False,'cover':False,'purpose':'Banc de recharge du détecteur : 2,4 s, courant normal, aucune pile consommée. Ne protège pas des ennemis.','interactive':'signal-charge','addedV07':True})
rules=[
 'Le détecteur consomme 0,44 point de charge par seconde, uniquement lorsqu’il est levé. La charge initiale est 100.',
 'À zéro, la lecture s’éteint sans tuer Amanda ni bloquer un objectif. Le détecteur n’est pas une clé de progression.',
 'Y maintenu 1,6 seconde remplace la pile : +70 points plafonnés à 100, une pile consommée seulement à la fin.',
 'Relâcher Y, marcher, prendre un coup, ouvrir un menu ou commencer un piratage annule un remplacement inachevé sans dépense.',
 'La pile ne peut pas être remplacée dans un casier ou pendant une visée. Relâcher Y est nécessaire après succès ou refus.',
 'Quatre bancs physiques rechargent à 100 en 2,4 secondes. Ils demandent l’éclairage normal du local ; aucun stock n’est consommé.',
 'Un maintien E interrompu, un détecteur non acquis ou déjà plein refuse la charge sans coût ni validation d’objectif.',
 'Les bancs ne sont pas des zones d’invulnérabilité et ne restaurent aucune autre ressource.',
 'Les échos sont échantillonnés toutes les 0,8 seconde, pas à chaque frame graphique. La première mesure amorce l’appareil.',
 'Un acteur doit s’être déplacé de plus de 2 unités depuis la mesure précédente pour laisser un écho.',
 'Un acteur immobile finit par disparaître après 1,45 seconde. Une absence d’écho ne démontre jamais une pièce vide.',
 'Un passage instantané de pièce ou une téléportation scénaristique n’est pas interprété comme un mouvement continu mesuré.',
 'Les mesures concernent seulement la pièce du joueur, avec une portée de 750 unités. Les meubles ne bloquent pas ce capteur.',
 'Le cœur APOLLO et les points de réacteur déclarés réduisent la portée à 450 unités. Aucun faux ennemi n’est fabriqué.',
 'Un xénomorphe immobile en gaine n’a pas de coordonnées de déplacement mesurables : il ne produit pas d’écho au sol.',
 'Les personnes, synthétiques et créatures mesurés sont affichés par le même symbole, sans nom ni catégorie.',
 'Les marques conservent la dernière position mesurée, puis s’effacent. Elles ne poursuivent pas un acteur entre deux balayages.',
 'K commute le haut-parleur réel du détecteur. Le mode silencieux conserve la mesure et la consommation électrique.',
 'En mode audible, un balayage avec échos produit un bip faible à la position d’Amanda ; un ennemi assez proche peut l’entendre.',
 'Le choix Son synthétisé est seulement une préférence de restitution. Il ne coupe pas le haut-parleur dans la simulation.',
 'Dans le vide, le bip est entendu au casque mais ne propage pas de bruit extérieur vers une créature.',
 'Les sous-titres sonores décrivent uniquement des bruits effectivement à portée d’oreille, atténués par distances et obstacles.',
 'Les sous-titres indiquent un côté relatif et une famille de bruit, jamais un nom, des points de vie ou une distance exacte.',
 'Les pas simulés exigent une distance réellement parcourue. Les acteurs immobiles ou en gaine ne génèrent pas de faux pas.',
 'Tab ouvre la roue en temps réel. Flèches ou souris choisissent ; Entrée ou clic confirme. Échap annule sans consommer.',
 'La sélection d’un objet ne le lance pas. Clic droit utilise l’objet retenu ; la visée V concerne les trois objets à lancer.',
 'G, L, X et H restent disponibles. Les soins refusent une demande dans un casier, un piratage, après la mort ou pendant une pause.',
 'Une perte de focus ou d’onglet suspend aussi la simulation si l’équipement ou la roue étaient ouverts.',
 'La sauvegarde conserve charge, mode sonore, sélection et compteurs. Une reprise réamorce le balayage sans inventer des échos.',
 'Les anciens formats 0.1 à 0.6 reçoivent une charge initiale normale ; aucun poste, colis ou objectif n’est offert.',
 'Les recharges du détecteur, les rotations de roue et la lecture des sous-titres n’accordent aucun objectif supplémentaire.',
 'La roue et les sous-titres restent des interfaces du prototype autonome, sans intégration native au moteur Tantalus.'
]
c['rules']+=['SIG07/ '+s for s in rules]
p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
(R/'src/content.js').write_text('export const CONTENT = '+json.dumps(c,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'integration/dlc-manifest.json').write_text(json.dumps({'id':c['meta']['id'],'version':c['meta']['version'],'title':c['meta']['title'],'entry':'index.html','standalone':True,'nativeIntegration':False,'saveKey':c['meta']['saveKey']},ensure_ascii=False,indent=2)+'\n')
print('0.7 registry:',len(c['rooms']),'rooms',sum(len(r['props']) for r in c['rooms']),'props',len(c['rules']),'rules')
