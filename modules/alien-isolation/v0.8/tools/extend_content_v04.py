"""Authored v0.4 layouts and survival-system contracts. Re-runnable after 0.3."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];C=json.loads((R/'src/content.json').read_text())
for key in ['rooms','links','optional','logs','ducts']:
 C[key]=[v for v in C[key] if not v.get('addedV04')]
C['rules']=[r for r in C['rules'] if not r.startswith('[0.4]')]
for r in C['rooms']:r['props']=[p for p in r['props'] if not p.get('addedV04')]
C['meta'].update(version='0.4.0',edition='Sous pression')
rooms={r['id']:r for r in C['rooms']}
def prop(r,kind,x,y,w,d,solid,purpose,action=None):
 p=dict(id=f"{r['id']}.v04.{len(r['props']):02d}",kind=kind,x=x,y=y,w=w,d=d,solid=solid,cover=solid or kind=='locker',purpose=purpose,addedV04=True)
 if action:p['interactive']=action
 r['props'].append(p);return p

def room(id,name,sector,deck,view,kit,w,arch,placements,mapxy,safe=False,exterior=False):
 r=dict(id=id,name=name,sector=sector,deck=deck,view=view,kit=kit,w=w,h=430,map=mapxy,architecture=arch,props=[],vents=[dict(x=w-165,y=300)],safe=safe,exterior=exterior,ordinal=len(C['rooms']),addedV04=True)
 for row in placements:prop(r,*row)
 C['rooms'].append(r);rooms[id]=r;return r
room('m_records','San Cristobal · Archives du personnel','SAN CRISTOBAL',1,'DEPTH','archive',1570,
 'Annexe des équipes de garde : une porte vers la salle de garde et un conduit vers la coursive. Les armoires longitudinales laissent deux voies avant/arrière et un passage central. Cette boucle ne donne ni la carte de Morley ni un accès direct à la pharmacie. Les terminaux documentent la fermeture progressive du service.',[
 ('shelf',530,220,140,60,True,'rayonnage dossiers A à G'),('shelf',990,221,140,60,True,'rayonnage dossiers H à Z'),('desk',775,310,155,55,True,'table de tri contournable par les deux extrémités'),('server',1270,195,75,50,True,'baie administrative'),
 ('locker',238,200,66,28,False,'casier du personnel au seuil','hide'),('case',1355,350,44,26,False,'réserve de pièces administratives','loot'),('save',150,350,42,25,False,'borne de l’annexe','save'),('terminal',1130,140,86,24,False,'registre des équipes'),('poster',430,130,65,2,False,'signalétique dossiers'),('light',1190,130,90,2,False,'rampe de consultation')],[0,5])
room('m_isolation','San Cristobal · Chambre d’isolement','SAN CRISTOBAL',1,'DEPTH','hospital',1650,
 'Chambre latérale reliée au bureau de Morley et à la stérilisation. Le lit et la desserte forment un îlot central ; le passage avant est libre. Le secteur reste dangereux et n’a pas de protection invisible. Sortir vers la stérilisation exige la même carte de Morley que le circuit médical.',[
 ('bed',680,235,178,72,True,'lit isolé, voie nord et voie sud'),('counter',1060,275,148,54,True,'paillasse de désinfection'),('cabinet',1300,186,78,50,True,'armoire des consommables'),('iv',540,180,40,25,False,'perfusion rangée près du lit'),('chair',905,180,60,35,True,'siège de surveillance'),
 ('locker',220,205,66,28,False,'placard de protection','hide'),('case',1440,352,44,25,False,'consommables de premiers soins','loot'),('relay',1160,350,54,26,False,'éclairage d’isolement','rewire'),('poster',440,130,60,2,False,'procédure d’isolement'),('light',1090,130,80,2,False,'rampe d’examen')],[4,5])
room('e_lockers','Sevastopol · Atelier des combinaisons','EXTÉRIEUR',3,'DEPTH','airlock',1640,
 'Atelier pressurisé entre le sas et l’antenne. Les bouteilles sont arrimées au fond ; deux établis ménagent une voie de service au nord et une voie de sortie au sud. Respirer ici recharge progressivement le circuit de combinaison. La sortie vers la coque impose une égalisation locale de pression.',[
 ('workbench',560,237,156,60,True,'banc de contrôle des joints'),('workbench',1020,238,156,60,True,'table de maintenance du respirateur'),('tank',1270,184,82,54,True,'bouteilles de recharge arrimées'),('suit',320,180,70,35,False,'combinaison sur support'),('suit',780,160,70,35,False,'combinaison de secours'),('locker',210,202,66,28,False,'vestiaire de technicien','hide'),('case',1420,350,44,25,False,'pièces de raccord de réserve','loot'),('save',142,350,42,25,False,'point de reprise avant EVA','save'),('terminal',1160,142,88,25,False,'registre de pression des bouteilles'),('poster',820,130,70,2,False,'consigne de contrôle avant sortie'),('light',1240,130,86,2,False,'rampe du vestiaire')],[0,14],safe=True)
room('e_catwalk','Sevastopol · Pont de maintenance','EXTÉRIEUR',3,'SIDE','exterior',1890,
 'Passerelle extérieure parallèle aux antennes, attachée à la coque par trois consoles. Une trappe mène à l’atelier pressurisé et l’autre issue rejoint l’antenne. Le câble de sécurité dessiné n’est pas une simulation de corde. Une bouteille fixe offre une recharge limitée, et un registre de maintenance motive le détour.',[
 ('gantry',410,177,90,35,False,'console porteuse du tablier'),('gantry',910,177,90,35,False,'console intermédiaire'),('gantry',1450,177,90,35,False,'console du raccord antenne'),('barrier',600,195,160,20,False,'garde-corps arrière'),('barrier',1240,195,160,20,False,'garde-corps de sortie'),('spool',1530,189,84,38,False,'câble arrimé derrière la voie'),('antenna',1080,159,110,40,False,'capteur annexe fixé au tablier'),('tank',795,300,48,26,False,'bouteille de secours O2, une utilisation','oxygen'),('terminal',530,172,85,25,False,'registre de maintenance du pont'),('light',1630,130,80,2,False,'balise de retour')],[2,14],safe=True,exterior=True)
# Inherit actual sector/deck instead of assuming their names or ordering.
for new,old in [('m_records','m_staff'),('m_isolation','m_morley'),('e_lockers','e_sas'),('e_catwalk','e_antenna')]:
 rooms[new]['sector']=rooms[old]['sector'];rooms[new]['deck']=rooms[old]['deck']
def link(a,b,ap,bp,label,kind='door',minimum=0,flag=None,deny=None):
 C['links'].append(dict(id=f'{a}__{b}',a=a,b=b,label=label,min=minimum,flag=flag,kind=kind,deny=deny,aPoint=dict(x=ap[0],y=ap[1],wall=ap[2]),bPoint=dict(x=bp[0],y=bp[1],wall=bp[2]),addedV04=True))
link('m_staff','m_records',(350,122,'N'),(80,300,'L'),'Annexe des dossiers',minimum=4)
link('m_records','m_corridor',(1490,300,'R'),(980,300,'N'),'Conduit de service','vent',4)
link('m_morley','m_isolation',(420,122,'N'),(80,300,'L'),'Chambre latérale',minimum=4)
link('m_isolation','m_sterile',(1570,300,'R'),(390,122,'N'),'Retour stérilisation',minimum=4,flag='morley')
link('e_sas','e_lockers',(450,300,'N'),(80,300,'L'),'Atelier de combinaison',minimum=15,flag='suit')
link('e_lockers','e_antenna',(1560,300,'R'),(580,300,'N'),'Sas atelier-antenne',minimum=15,flag='suit')
link('e_lockers','e_catwalk',(480,122,'N'),(80,300,'L'),'Sortie maintenance',minimum=15,flag='suit')
link('e_catwalk','e_antenna',(1810,300,'R'),(1360,300,'N'),'Raccord de la passerelle',minimum=15,flag='suit')
for rid,x in [('g_hull',1020),('e_antenna',1090),('e_clamps',730)]:
 prop(rooms[rid],'tank',x,300,48,26,False,'bouteille d’oxygène fixe : une recharge de 65 points','oxygen')
for id,rid,x,y,label,reply,reward in [
 ('O13','m_records',1170,350,'Consulter le registre des équipes','Nora a barré trois noms, puis arrêté de compter. Un lot de composants est resté sous le terminal.',{'scrap':3,'battery':1}),
 ('O14','m_isolation',1160,155,'Vérifier le chariot de premiers soins','Le kit d’urgence est intact. La fiche du patient s’arrête au milieu d’une phrase.',{'medkit':1,'chemical':1}),
 ('O15','e_lockers',1160,350,'Contrôler le circuit de combinaison','Le circuit est étanche. Les bouteilles fixes de la coque servent une seule fois ; gardez une marge pour le retour.',{'battery':2,'scrap':2}),
 ('O16','e_catwalk',530,300,'Récupérer le registre du pont','Les équipes suivaient cette ligne de retour quand les antennes étaient hors service. La balise indique encore l’atelier.',{'scrap':2,'battery':1})]:
 C['optional'].append(dict(id=id,room=rid,x=x,y=y,label=label,reply=reply,reward=reward,hold=1.1,addedV04=True))
 # Match an existing non-solid authored object, without duplicating its visual.
 candidates=[p for p in rooms[rid]['props'] if not p.get('interactive') and not p['solid']]
 carrier=min(candidates,key=lambda p:(p['x']-x)**2+(p['y']-y)**2)
 carrier.update(interactive=id,x=x,y=y,purpose=label)
 if id=='O14':carrier.update(kind='cart',w=100,d=30)
for i,(rid,title,text) in enumerate([
 ('m_records','Les derniers noms','Personne ne ramène les badges au retour des rondes. J’ai laissé la porte du service ouverte. Ne bloquez pas le conduit avec les dossiers.'),
 ('m_isolation','L’autre porte','La chambre dispose de deux issues. Une seule carte autorise le passage vers la stérilisation : celle du médecin responsable. Ne la laissez pas derrière vous.'),
 ('e_lockers','Avant le vide','Pressurisez, contrôlez, sortez. Si le sas commence son cycle, restez près du seuil. Revenir dans un local pressurisé reconstitue lentement la réserve.'),
 ('e_catwalk','Marge de retour','La bouteille de la passerelle contient assez d’air pour une recharge, pas davantage. Ne l’ouvrez pas avec une réserve déjà pleine. Le vide ne pardonne pas l’attente.')],36):
 C['logs'].append(dict(id=f'LOG{i:02}',room=rid,title=title,text=text,addedV04=True))
for edge in C['links']:
 if edge.get('addedV04') and edge['a'].startswith('m_'):
  C['ducts'].append(dict(id='duct.'+edge['id'],a=edge['a'],b=edge['b'],seconds=4,min=edge['min'],deny=None,purpose='Gaine plafonnière du détour médical, raccord temporisé au réseau existant.',addedV04=True))
C['lifeSupport']={'drain':{'recit':0.34,'survie':0.52,'cauchemar':0.7},'runMultiplier':1.65,'refillRate':8,'stationRefill':65,'airlockSeconds':3.2,'airlockReadySeconds':18,'hypoxiaDelay':5,'hypoxiaDamage':18,'vacuumRooms':[r['id'] for r in C['rooms'] if r['exterior'] and r['kit']=='exterior']}
C['flight']={'speed':520,'minimumDuration':0.28,'fuse':{'emp':0.45,'noise':0.15,'flare':0.05},'capacity':12,'cooldown':0.3,'empRadius':300}
C['rules'] += ['[0.4] '+r for r in [
 'L’oxygène est réservé aux salles déclarées sous vide. Le souvenir de LV-426 reste distinct des sorties d’Amanda.',
 'La réserve baisse uniquement avec la simulation active ; carte, codex et pause suspendent son évolution.',
 'Courir sous vide consomme 1,65 fois le débit nominal ; l’immobilité ne coupe pas le respirateur.',
 'Les modes Récit, Survie et Cauchemar appliquent des débits explicites et affichés dans le guide.',
 'La santé et l’oxygène sont distincts. Les trousses ne remplissent jamais une bouteille.',
 'À zéro, une hypoxie de cinq secondes précède les dégâts périodiques ; aucun redémarrage ne remplit gratuitement le circuit.',
 'Les avertissements à 35, 15 et zéro sont textuels autant que sonores.',
 'Un retour dans une pièce pressurisée recharge progressivement la réserve, pas instantanément au seuil.',
 'Une bouteille fixe contient une seule recharge de 65 points. Son utilisation est mémorisée dans la sauvegarde.',
 'Une réserve supérieure à 95 ne consomme pas une bouteille fixe.',
 'Le sas égalise la pression pendant 3,2 secondes avant une seconde interaction de passage.',
 'Quitter la commande de plus de 110 unités annule l’égalisation et ne téléporte jamais le joueur.',
 'Le sas prêt reste disponible 18 secondes ; une pause n’épuise pas cette fenêtre.',
 'La traversée conserve les portes réciproques et leurs drapeaux de progression.',
 'Le lance-flammes est indisponible dans les pièces déclarées sous vide, sans consommation de carburant.',
 'Un objet lancé reste un projectile jusqu’au contact du sol, puis attend son délai d’activation.',
 'Une IEM teste la position des synthétiques à l’explosion, pas leur position au moment du lancer.',
 'Les leurres commencent leur durée utile après atterrissage ; la phase de vol ne consomme pas leur autonomie.',
 'Un projectile continue dans sa pièce d’origine lorsque le joueur traverse une porte.',
 'La sauvegarde conserve pièce, trajectoire, temps de vol et amorçage des objets lancés.',
 'La trajectoire s’arrête avant le premier obstacle ; le mode CLASSIC ne modifie pas les collisions.',
 'Le confinement verrouille les issues mais ne fige plus le chasseur au milieu du laboratoire.',
 'Une saisie proche exige une ligne libre ; un meuble ne doit pas permettre une mise à mort à travers sa collision.',
 'Le serveur de lancement reste lié à 127.0.0.1 et ne sert que les chemins de jeu autorisés.',
 'Les erreurs de stockage restent visibles dans Pause. Le JSON exporté représente le dernier enregistrement.',
 'Les nouveaux locaux médicaux ne donnent pas la carte de Morley et ne contournent pas ses contrôles.',
 'Chaque capture est issue du moteur et précise si l’état provient d’un parcours ou d’une préparation de test.',
 'Un test de persistance se fait avec un profil de navigateur rouvert, pas avec un faux Storage en mémoire.'
]]
for r in C['rooms']:
 r['architecture']=r['architecture'].replace('sans physique d’apesanteur ni jauge d’oxygène simulée','avec consommation d’oxygène, sans physique d’apesanteur')
C['revision04']={'version':'0.4.0','newRooms':['m_records','m_isolation','e_lockers','e_catwalk'],'newLinks':[e['id'] for e in C['links'] if e.get('addedV04')],'note':'Interprétations originales ; aucun DLC commercial ajouté.'}
# Fail hard on an accidental wrong identifier, rather than silently dropping a link.
assert all(e['a'] in rooms and e['b'] in rooms for e in C['links'])
(R/'src/content.json').write_text(json.dumps(C,ensure_ascii=False,indent=2)+'\n')
(R/'src/content.js').write_text('export const CONTENT = '+json.dumps(C,ensure_ascii=False,separators=(',',':'))+';\n')
print({k:len(C[k]) for k in ['rooms','links','optional','rules','logs']},'props',sum(len(r['props']) for r in C['rooms']))
