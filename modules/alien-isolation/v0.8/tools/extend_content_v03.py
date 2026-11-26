"""Authored cumulative 0.3 layout. All additions are original interpretations.
Run after the 0.2 generator. This script is idempotent.
"""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];C=json.loads((R/'src/content.json').read_text())
C['rooms']=[r for r in C['rooms'] if not r.get('addedV03')]
C['links']=[e for e in C['links'] if not e.get('addedV03')]
C['optional']=[t for t in C['optional'] if not t.get('addedV03')]
C['logs']=[t for t in C['logs'] if not t.get('addedV03')]
C['rules']=[t for t in C['rules'] if not t.startswith('[0.3]')]
for r in C['rooms']:r['props']=[p for p in r['props'] if not p.get('addedV03')]
C['meta'].update(version='0.3.0',edition='Protocoles de survie')
rooms={r['id']:r for r in C['rooms']}
def prop(r,kind,x,y,w,d,solid,purpose,action=None):
 p=dict(id=f"{r['id']}.v03.{len(r['props']):02}",kind=kind,x=x,y=y,w=w,d=d,solid=solid,cover=solid or kind=='locker',purpose=purpose,addedV03=True)
 if action:p['interactive']=action
 r['props'].append(p);return p

def room(id,name,sector,deck,view,kit,w,arch,placements,mapxy,safe=False,exterior=False):
 r=dict(id=id,name=name,sector=sector,deck=deck,view=view,kit=kit,w=w,h=430,map=mapxy,architecture=arch,props=[],vents=[{'x':w-160,'y':300}],safe=safe,exterior=exterior,ordinal=len(C['rooms']),addedV03=True)
 for row in placements:prop(r,*row)
 C['rooms'].append(r);rooms[id]=r;return r
room('g_observation','Gemini · Galerie d’observation','GEMINI',2,'DEPTH','lab',1710,
 'Galerie de contrôle adjacente à KG-348, séparée par une vitre étanche. Une fenêtre de supervision restitue la position réelle de la créature dans le module ; elle ne crée aucun double. Le sas de secours mène à l’issue extérieure, le retour ouest à la régulation. Deux pupitres laissent une voie arrière et une voie avant. La galerie est hors du volume détachable.',[
 ('desk',520,253,156,62,True,'pupitre de surveillance du volet amont'),('desk',1040,254,160,64,True,'pupitre de surveillance du sas aval'),
 ('server',1330,193,78,52,True,'baie de commande des clapets de ventilation'),('chair',700,198,55,36,True,'siège rangé hors de la circulation frontale'),
 ('locker',235,205,65,28,False,'casier du contrôleur près de la sortie ouest','hide'),('case',1490,350,44,26,False,'réserve de maintenance inventoriée','loot'),
 ('save',140,355,42,25,False,'borne située côté station, avant le confinement','save'),('relay',850,350,52,25,False,'commande locale de l’éclairage','rewire'),
 ('radio',1120,156,60,25,False,'retour acoustique des capteurs du module'),('poster',805,130,65,2,False,'consigne : présence au sol, sas libre, clapets fermés'),('light',400,130,70,2,False,'rampe au-dessus du pupitre')],[1,7])
room('g_plenum','Gemini · Plénum de maintenance','GEMINI',2,'SIDE','coolant',1450,
 'Gaine visitable entre la régulation et KG-348. Les réservoirs sont accrochés derrière le chemin unique, jamais dans la bande de marche. Deux trappes imposent l’accroupissement ; cette boucle ne contourne pas la condition de confinement. La dérivation mécanique fournit un retour de capteur, pas une téléportation de la créature.',[
 ('pipe',400,160,180,18,False,'collecteur plafonnier du module'),('pipe',900,160,180,18,False,'collecteur de retour Gemini'),('tank',610,180,100,55,False,'ballon mural en retrait du chemin'),
 ('pump',1040,180,108,45,False,'pompe fixée sur le support arrière'),('locker',250,300,65,28,False,'placard de protection à l’entrée de la gaine','hide'),
 ('case',1230,300,44,25,False,'boîte de raccords du réseau','loot'),('relay',800,220,52,25,False,'lecture de pression du clapet, derrière sa zone d’approche'),
 ('poster',550,130,60,2,False,'flèche vers le module détachable'),('light',980,130,70,2,False,'balise de gaine')],[1,9])
room('g_hull','KG-348 · Traversée de coque','GEMINI',2,'SIDE','exterior',2050,
 'Après séparation, le sas ouvre sur la coque. La route extérieure rejoint un sas de la station : aucun retour par le laboratoire ou la galerie n’est possible. Garde-corps, treuils et antennes sont fixés derrière la passerelle. La traversée est condensée, sans physique d’apesanteur ni jauge d’oxygène simulée.',[
 ('gantry',480,178,90,35,False,'support arrière du câble de guidage'),('gantry',980,178,90,35,False,'support intermédiaire du câble'),('gantry',1530,178,90,35,False,'ancrage du sas de retour'),
 ('antenna',800,165,126,40,False,'antenne de secours hors du passage'),('barrier',530,200,160,20,False,'garde-corps arrière de la passerelle'),('barrier',1230,200,160,20,False,'garde-corps arrière avant le sas'),
 ('spool',1670,190,80,38,False,'treuil arrimé sur le berceau'),('suit',180,195,70,35,False,'station de contrôle de combinaison au seuil'),('light',1750,130,70,2,False,'balise de retour station')],[3,8],safe=True,exterior=True)
room('n_coolant','Anesidora · Boucle de refroidissement','ANESIDORA',0,'DEPTH','coolant',1630,
 'La boucle technique relie la salle moteur à un couloir de service qui rejoint la navette. Deux pompes au fond et un ballon central séparent les voies de contournement. Le robinet accessible au sud permet une seule stabilisation (+40 s pendant l’urgence), mais ne sauve pas le vaisseau. Le jet de vapeur a une empreinte et une phase d’avertissement visibles ; il s’arrête après la stabilisation.',[
 ('pump',420,192,127,58,True,'pompe du circuit primaire'),('pump',1130,190,127,58,True,'pompe de retour vers les moteurs'),('tank',745,245,115,76,True,'ballon central : contournement au nord et au sud'),
 ('pipe',590,133,160,20,False,'collecteur des pompes'),('pipe',1200,133,160,20,False,'évacuation vers le moteur'),('workbench',1260,276,142,54,True,'banc de mesure hors de la commande du robinet'),
 ('locker',215,205,65,28,False,'casier de sécurité hors du jet','hide'),('case',1430,350,42,25,False,'réserve avant le couloir de fuite','loot'),('radio',995,150,60,22,False,'retour des alarmes de pression'),
 ('poster',615,130,60,2,False,'schéma de fermeture du retour'),('light',1140,130,70,2,False,'éclairage des pompes')],[2,12],safe=True)
room('n_service','Anesidora · Coursive de retour','ANESIDORA',0,'SIDE','maintenance',1780,
 'Coursive longitudinale menant de la boucle de refroidissement à la navette. Les coffres et gaines sont en retrait, le centre reste libre sur toute sa longueur. Une alcôve abrite une batterie de secours ; le détour reste soumis au compte à rebours, même lorsque la salle moteur est quittée.',[
 ('locker',280,300,65,28,False,'casier au seuil du circuit moteur','hide'),('case',1330,300,42,25,False,'réserve de connecteurs, sans remise à zéro du compte à rebours','loot'),('cabinet',550,180,75,42,False,'armoire fixée derrière la ligne de marche'),
 ('spool',950,185,74,44,False,'touret fixé sous la desserte arrière'),('pipe',850,130,160,18,False,'gaine du faisceau de la navette'),('pipe',1280,130,160,18,False,'retour de ventilation vers le dock'),
 ('barrier',1050,190,160,20,False,'protection arrière du faisceau'),('poster',650,130,60,2,False,'flèche SHUTTLE vers le dock'),('light',1440,130,70,2,False,'balise de la navette')],[1,13],safe=True)
# New reciprocal portals use unique wall slots. Existing return EVA becomes a real room.
old=next((e for e in C['links'] if e['id']=='g_airlock__s_transit'),None)
if old:C['links'].remove(old)
def link(a,b,ap,bp,label,kind='door',minimum=0,flag=None,deny=None):
 C['links'].append(dict(id=f'{a}__{b}',a=a,b=b,label=label,min=minimum,flag=flag,kind=kind,deny=deny,aPoint=dict(x=ap[0],y=ap[1],wall=ap[2]),bPoint=dict(x=bp[0],y=bp[1],wall=bp[2]),addedV03=True))
link('g_control','g_observation',(370,122,'N'),(80,300,'L'),'Galerie de contrôle',minimum=9,flag='gemini')
link('g_observation','g_airlock',(1630,300,'R'),(490,300,'N'),'Issue côté station',minimum=9,flag='gemini',deny='detached')
link('g_control','g_plenum',(1090,122,'N'),(80,300,'L'),'Trappe technique','vent',9,'gemini','detached')
link('g_plenum','g_lab',(1370,300,'R'),(520,122,'N'),'Trappe KG-348','vent',9,'gemini','detached')
link('g_airlock','g_hull',(1610,300,'R'),(80,300,'L'),'Sortie vers la coque','transfer',9,'detached')
link('g_hull','s_transit',(1970,300,'R'),(1657.142857142857,122,'N'),'Sas de retour station','transfer',9,'detached')
link('n_engine','n_coolant',(520,122,'N'),(80,300,'L'),'Circuit de refroidissement',minimum=14)
link('n_coolant','n_service',(1550,300,'R'),(80,300,'L'),'Coursive technique',minimum=14)
link('n_service','n_dock',(1700,300,'R'),(430,300,'N'),'Retour vers la navette',minimum=14)
for e in C['links']:
 if e['id']=='n_engine__n_dock':e['deny']='anesidora';e['label']='Porte coupe-feu (condamnée en surcharge)'
 if e['id']=='g_lab__g_airlock':e['deny']='detached'
 if e['id']=='s_transit__n_dock':e['deny']=None;e['blockedTo']='n_dock';e['blockFlag']='anesidoraEscaped'
rooms['g_airlock'].update(kit='airlock',exterior=False,architecture='Vestibule étanche entre le module et la coque. La commande de séparation vérifie la présence physique de la créature au sol dans KG-348, verrouille les portes et les clapets pendant quatre secondes, puis autorise le détachement. Le panneau affiche l’état réel du capteur. La sortie EVA reste fermée avant cette procédure.')
# Convert the old exterior staging props into sealed-vestibule equipment.
for pid,kind,purpose in [('g_airlock.p00','suit','râtelier de combinaison avant la sortie EVA'),('g_airlock.p01','tank','ballon de compensation de pression du vestibule'),('g_airlock.p02','cabinet','armoire de sécurité du sas')]:
 p=next(p for p in rooms['g_airlock']['props'] if p['id']==pid);fp=C['footprints'][kind];p.update(kind=kind,purpose=purpose)
 if isinstance(fp,dict):p.update({k:fp[k] for k in ['w','d','solid','cover'] if k in fp})
 elif isinstance(fp,list):p.update(w=fp[0],d=fp[1])
# The corporate label belongs on an opaque wall, not across the observation glass.
next(p for p in rooms['g_observation']['props'] if p['kind']=='poster')['x']=335

# Side tasks: 4 authored positions, checked against the movement graph by tests.
for id,rid,x,y,label,reply,reward in [
 ('O09','g_observation',1330,338,'Recopier les plans de confinement','Le schéma distingue les deux portes et les clapets. Aucun verrou ne peut isoler un module vide.',{'battery':2,'noise':1}),
 ('O10','g_plenum',800,300,'Contrôler la pression de la gaine','La gaine mène bien à KG-348. Les mouvements dans le plafond suivront les raccords du réseau.',{'scrap':3}),
 ('O11','n_coolant',1030,345,'Stabiliser la boucle de refroidissement','Le retour de refroidissement est fermé. Quarante secondes de répit, pas davantage.',{'battery':1}),
 ('O12','n_service',780,300,'Récupérer la batterie de la navette','Le pack auxiliaire peut encore alimenter les outils portatifs.',{'battery':2})]:
 t=dict(id=id,room=rid,x=x,y=y,label=label,reply=reply,reward=reward,hold=1.1,addedV03=True)
 if id=='O11':t['flag']='anesidora';t['protocol']='coolant'
 C['optional'].append(t);p=prop(rooms[rid],'relay' if id=='O11' else 'terminal',x,y-(42 if rooms[rid]['view']!='SIDE' else 42),56,24,False,'poste de tâche : '+label,id);t['propId']=p['id']
# Circuit labeling corresponds to actual mission terminals, with separate safety relief.
for g in C['goals']:
 if g['id']=='C10_04':g['label']='Confiner la créature puis détacher KG-348';g['reply']='Amanda — Les capteurs confirment la créature dans le module. Waits a lancé la séparation : je dois rejoindre le sas de retour par la coque.'
 if g['id']=='C10_02':g['reply']='Amanda — Le réseau de clapets répond. Le leurre du laboratoire pourra guider la créature par les gaines.'
 if g['id']=='C10_03':g['reply']='Amanda — Le leurre fixe fonctionne. Je peux surveiller le capteur depuis le sas ou la galerie. Le module doit contenir la créature avant de se séparer.'
 if g['id']=='C15_03':g['flag']='anesidoraEscaped';g['reply']='Amanda — La navette est prête. L’Anesidora est perdue ; ne retournons pas dans ses coursives.'
 if g['id']=='C12_02':g['label']='Isoler D-01 · Diagnostic'
 if g['id']=='C12_03':g['label']='Isoler C-02 · Refroidissement'
 if g['id']=='C12_04':g['label']='Isoler P-03 · Ligne principale'
# Chapters carry mirrored goal objects, not outdated copies.
for ch in C['chapters']:ch['goals']=[g for g in C['goals'] if g['chapter']==ch['id']-1]
prop(rooms['a_samuels'],'relay',360,307,50,24,False,'purge thermique de sécurité : refroidit l’interface, disponible toutes les quinze secondes','thermal')
# An explicitly authored ceiling-duct graph, separate from player teleportation/doors.
station={r['id'] for r in C['rooms'] if r['sector'] not in ['TORRENS','SOUVENIR','ANESIDORA','EXTÉRIEUR'] and not r['exterior'] and r['id']!='g_airlock'}
C['ducts']=[]
for e in C['links']:
 if e['a'] in station and e['b'] in station and e['kind'] not in ['memory','transfer','shuttle']:
  C['ducts'].append(dict(id='duct.'+e['id'],a=e['a'],b=e['b'],seconds=6 if e['kind'] in ['tram','lift'] else 4,min=e['min'],deny=e.get('deny'),purpose='Gaine plafonnière entre '+rooms[e['a']]['name']+' et '+rooms[e['b']]['name']+' ; trajet hors champ chronométré, sans apparition dans les locaux intermédiaires.'))
# Obstacles never sit on an exit, goal or loot. Hazard footprint/phase is shared by renderer and simulation.
C['hazards']=[
 dict(id='steam-engine',room='n_engine',x=780,y=330,w=160,d=104,period=6,offset=0,warning=1.5,on=1.8,damage=9,disabledByCooling=False),
 dict(id='steam-bridge',room='n_bridge',x=1210,y=200,w=190,d=118,period=7,offset=2,warning=1.5,on=2,damage=8,disabledByCooling=False),
 dict(id='steam-coolant',room='n_coolant',x=835,y=340,w=148,d=85,period=6,offset=1,warning=1.5,on=1.8,damage=9,disabledByCooling=True)]
for h in C['hazards']:
 p=prop(rooms[h['room']],'pipe',h['x'],h['y'],h['w'],12,False,'collecteur fissuré : '+h['id']+' ; empreinte vapeur '+str(h['w'])+'×'+str(h['d'])+' ; avertissement avant émission')
 h['propId']=p['id']
for i,(rid,title,text) in enumerate([
 ('g_observation','Ne jamais fermer sur une hypothèse','Le voyant de présence suit le volume réel du laboratoire, pas l’alarme. La créature doit avoir quitté la gaine. Maintenir le confinement ferme aussi les clapets du plafond.'),
 ('g_plenum','Registre des raccords','Les conduites empruntent les cloisons techniques et le faisceau des transports. Le relais ne rapproche pas une chose instantanément : chaque segment doit être parcouru.'),
 ('g_hull','Une ligne vers la station','Le câble rejoint le sas du terminal. Après largage, le couloir intérieur ne mène plus nulle part. Garder la station devant soi et suivre les balises.'),
 ('n_coolant','Une mesure provisoire','Refermer le retour soulage la boucle quarante secondes. Ne pas recommencer : la réserve de fluide est unique. La navette reste la seule sortie.'),
 ('n_service','Le dernier quart','La porte coupe-feu du moteur tombe quand la pression dépasse le seuil. Le pont et la coursive technique rejoignent toujours le dock. Ne pas attendre devant une porte condamnée.')]):
 C['logs'].append(dict(id=f'LOG_V03_{i+1}',room=rid,title=title,text=text,addedV03=True))
for rule in [
 'Le confinement vérifie le volume actuel de KG-348 ; un simple objectif validé ne suffit pas.',
 'Le déclenchement du leurre ne modifie pas instantanément les coordonnées de la créature.',
 'Le réseau de gaines est distinct des portes du joueur et expose chaque liaison dans le codex.',
 'Un trajet en gaine est chronométré par segment et ne provoque aucune émergence intermédiaire.',
 'Le capteur distingue gaine, présence au sol, fermeture, confinement et module détaché.',
 'Les clapets et les deux portes du module restent bloqués après confinement, sans possibilité de forçage ordinaire.',
 'La séparation n’est autorisée que depuis le vestibule extérieur au volume de chasse.',
 'La galerie montre la créature réelle à travers sa fenêtre ; elle ne crée pas une deuxième IA.',
 'La fermeture de confinement ne bloque jamais la sortie EVA une fois la séparation validée.',
 'La coque est une pièce jouable à seuils réciproques, pas une téléportation de carte.',
 'Le retour vers KG-348 est définitivement condamné après sa séparation.',
 'Les trois circuits de Samuels sont tous accessibles : un mauvais ordre déclenche une surtension, pas une validation.',
 'La purge thermique fournit une récupération avec délai ; les surchauffes ne rendent pas la campagne insoluble.',
 'Les légendes D-01, C-02, P-03 correspondent aux coordonnées des disjoncteurs du niveau.',
 'Le compte à rebours de l’Anesidora continue dans toutes ses pièces et pendant l’équipement.',
 'Une sauvegarde récente conserve le temps restant ; recharger n’accorde pas un nouveau délai.',
 'Le robinet de refroidissement est unique : +40 secondes une fois, et suppression du jet local seulement.',
 'Les jets de vapeur utilisent la même empreinte pour les dégâts, le rendu et le plan technique.',
 'Chaque jet possède une préalerte distincte de sa phase dangereuse et une phase silencieuse.',
 'La visée d’un objet s’arrête avant un obstacle ; la trajectoire affichée est celle utilisée au lancement.',
 'La visée est annulée par un changement de pièce, un menu, une cachette ou une perte de focus.',
 'Les sauvegardes précédentes sont conservées dans trois copies tournantes du seul espace Isolation.',
 'Une récupération de sauvegarde indique sa provenance ; aucune progression Tantalus n’est modifiée.',
 'Le son reste facultatif ; les alertes importantes disposent aussi de texte et d’un état de machine visible.'
]:C['rules'].append('[0.3] '+rule)
(R/'src/content.json').write_text(json.dumps(C,ensure_ascii=False,indent=2))
(R/'src/content.js').write_text('export const CONTENT = '+json.dumps(C,ensure_ascii=False,separators=(',',':'))+';\n')
print('V03:',len(C['rooms']),'rooms',len(C['links']),'links',sum(len(r['props']) for r in C['rooms']),'props',len(C['ducts']),'duct segments')
