"""Cumulative 0.6 authoring: improve the existing station instead of adding empty rooms."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];C=json.loads((R/'src/content.json').read_text())
C['meta'].update(version='0.6.0',edition='Ceux qui restent')
for r in C['rooms']:r['props']=[p for p in r['props'] if not p.get('addedV06')]
C['logs']=[v for v in C['logs'] if not v.get('addedV06')]
C['rules']=[v for v in C['rules'] if not v.startswith('[0.6]')]
rooms={r['id']:r for r in C['rooms']}
C['refuges']=[
 dict(id='medical',npc='nora',room='m_refuge',name='Poste médical',project='Protocole de stabilisation',description='Les futures blessures des escortes laissent 35 secondes pour intervenir ; une stabilisation restaure 50 PV au lieu de 35.',powerCost={'scrap':2,'battery':1},installCost={'scrap':1,'chemical':1},serviceCost={'chemical':1},service='Soins locaux +40 santé',charges=3,hold=2.8,
  parts=[dict(id='med_protocol',room='m_records',x=650,y=350,kind='medical_pack',label='Dossier de stabilisation'),dict(id='med_injector',room='m_sterile',x=525,y=350,kind='medical_pack',label='Injecteur scellé')]),
 dict(id='technical',npc='elias',room='d_refuge',name='Atelier de relève',project='Régulateur EVA',description='Réduit de 20 % la consommation d’oxygène dans les zones sous vide, y compris en course. Ne recharge pas la réserve.',powerCost={'scrap':2,'battery':1},installCost={'scrap':2,'battery':1},serviceCost={'scrap':2,'chemical':1},service='Entretien +40 carburant',charges=3,hold=2.8,
  parts=[dict(id='eva_valve',room='d_relay',x=455,y=350,kind='engineering_pack',label='Valve de régulation'),dict(id='eva_filter',room='d_gantry',x=460,y=300,kind='engineering_pack',label='Filtre de combinaison')])
]
def prop(room,id,kind,x,y,purpose,interactive,**fields):
 p=dict(id=id,kind=kind,x=x,y=y,w=50 if 'pack' in kind else 60,d=24,solid=False,cover=False,purpose=purpose,interactive=interactive,addedV06=True,**fields)
 rooms[room]['props'].append(p);return p
for refuge in C['refuges']:
 rid=refuge['id'];room=refuge['room']
 prop(room,'refuge.'+rid+'.power','relay',365,350,'Alimentation des services : 2 pièces + 1 pile. Nécessite le contact arrivé au refuge.','refuge',refuge=rid,action='power')
 prop(room,'refuge.'+rid+'.project','clinic_console' if rid=='medical' else 'engineering_console',650,350,refuge['project']+' : deux colis et installation physique.','refuge',refuge=rid,action='install')
 prop(room,'refuge.'+rid+'.service','medical_pack' if rid=='medical' else 'engineering_pack',950,350,refuge['service']+' ; trois interventions au maximum, coût affiché.','refuge',refuge=rid,action='service')
 for part in refuge['parts']:prop(part['room'],'supply.'+part['id'],part['kind'],part['x'],part['y'],part['label']+' ; à rapporter au refuge.','supply',refuge=rid,part=part['id'])
C['escortComfort']=dict(separation=44,yieldSpeed=88,carefulSpeed=140,carefulNoise=.03,orderRange=360,stabilizedHealth=50,improvedBleed=35)
for n in C['rescues']:
 n['art']=n['id'];n['portrait']='characters/'+n['id']+'_portrait.svg'
for i,rid,title,text in [
 (44,'m_refuge','Il faut encore des mains','Nora · Le poste peut remettre quelqu’un debout, mais ses trois lots sont tout ce qu’il reste. Rapportez le dossier des archives et l’injecteur de stérilisation. Je préparerai le protocole de terrain.'),
 (45,'d_refuge','La fuite silencieuse','Elias · Une combinaison perd de l’air par petites quantités. Le filtre de la passerelle et la valve du local des relais peuvent réduire cette perte. Ils ne fabriqueront pas d’oxygène.')]:
 C['logs'].append(dict(id=f'LOG{i:02}',room=rid,title=title,text=text,addedV06=True))
C['rules'] += ['[0.6] '+r for r in [
 'Aucune pièce ajoutée : les projets relient les refuges aux annexes existantes. Les 64 lieux et 88 liaisons antérieurs restent présents.',
 'Les deux survivants disposent de silhouettes originales distinctes et de portraits stylisés ; aucune photographie ni ressource commerciale.',
 'N transmet un ordre prudent à la seule escorte active la plus proche, à 360 unités au maximum et en ligne de vue.',
 'Le mode prudent est individuel et sauvegardé. Il réduit vitesse et bruit sans rendre invisible ni invulnérable.',
 'Une escorte dans une autre pièce ne lit plus la posture actuelle d’Amanda pour choisir sa vitesse : elle garde son ordre individuel.',
 'Les compagnons s’écartent progressivement d’Amanda quand les empreintes se chevauchent. La séparation ne déplace jamais Amanda.',
 'Une séparation vérifie chaque petit pas contre les solides. Elle ne pousse pas un personnage à travers une armoire, une paroi ou un seuil.',
 'Dans une coursive sans profondeur, le compagnon cède latéralement. Si aucun déplacement sûr n’existe, il ne se téléporte pas.',
 'Une escorte blessée, cachée ou en cours de stabilisation n’est pas déplacée par la séparation de confort.',
 'Les postes de refuge ne sont accessibles qu’après l’arrivée physique confirmée de leur survivant.',
 'E sur le relais paie deux pièces et une pile pour alimenter le poste, une seule fois ; aucune action distante depuis le journal.',
 'Le projet médical nécessite le dossier des archives, l’injecteur de stérilisation, une pièce et un produit.',
 'Le régulateur EVA nécessite la valve du local des relais, le filtre de la passerelle, deux pièces et une pile.',
 'Les colis sont uniques. Leur récupération ouvre visiblement le conteneur ; un rechargement ne recrée pas son contenu.',
 'Ramasser un colis n’avance aucun objectif principal et ne le transforme pas en composant de fabrication générique.',
 'L’installation exige le maintien d’E au poste du refuge ; l’état est revalidé avant toute consommation.',
 'Le protocole médical porte les futures fenêtres de secours à 35 secondes et les stabilisations à 50 PV ; une blessure déjà en cours ne gagne pas de temps.',
 'Le régulateur réduit le débit d’oxygène de 20 %, course comprise ; les bouteilles et la recharge pressurisée restent inchangées.',
 'Le poste de Nora soigne 40 PV pour un produit et une charge ; trois charges au total, aucune dépense à santé maximale.',
 'Le poste d’Elias apporte 40 unités de carburant pour deux pièces, un produit et une charge ; trois charges au total, outil acquis requis.',
 'Un projet installé n’est ni empilable ni répétable. Les colis consommés restent enregistrés pour empêcher un second ramassage.',
 'Les anciens fichiers 0.1 à 0.5 initialisent des postes éteints, sans améliorer gratuitement le personnage.',
 'L’import filtre les identifiants de colis et les postes ; stocks et compteurs sont bornés et les charges dépensées ne sont pas rendues.',
 'Le journal J expose les conditions, colis et stocks ; sa consultation est en pause et ne déclenche aucun service.',
 'Les services, colis, projets, ordres et déplacements de confort sont inclus dans les tests ciblés et distingués des parcours de campagne.',
 'Les refuges restent des abris locaux. Il ne s’agit toujours pas d’une extraction finale hors de Sevastopol.'
]]
C['revision06']=dict(version='0.6.0',newRooms=[],projects=2,parts=4,addedProps=10,nativeIntegration=False)
for name,value in [('content.json',json.dumps(C,ensure_ascii=False,indent=2)+'\n'),('content.js','export const CONTENT = '+json.dumps(C,ensure_ascii=False,separators=(',',':'))+';\n')]:
 (R/'src'/name).write_text(value)
print('v06',len(C['rooms']),'rooms',sum(len(r['props']) for r in C['rooms']),'props',len(C['rules']),'rules')
