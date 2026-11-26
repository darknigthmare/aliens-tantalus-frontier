"""Cumulative 0.5 authoring: original rescue branches; not commercial DLC content."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];C=json.loads((R/'src/content.json').read_text())
for key in ['rooms','links','optional','logs','ducts','characters']:
 C[key]=[v for v in C[key] if not v.get('addedV05')]
for r in C['rooms']:
 r['props']=[p for p in r['props'] if not p.get('addedV05')]
 # These rooms were wrongly split into a second medical tab in 0.4.
 if r['sector']=='SAN CRISTOBAL':r['sector']='MÉDICAL'
C['rules']=[r for r in C['rules'] if not r.startswith('[0.5]')]
C['meta'].update(version='0.5.0',edition='Les voix du refuge')
rooms={r['id']:r for r in C['rooms']}
def prop(r,kind,x,y,w,d,solid,purpose,action=None):
 p=dict(id=f"{r['id']}.v05.{len(r['props']):02d}",kind=kind,x=x,y=y,w=w,d=d,solid=solid,cover=solid or kind=='locker',purpose=purpose,addedV05=True)
 if action:p['interactive']=action
 r['props'].append(p);return p

def room(id,name,sector,kit,deck,mapxy,safe=False):
 r=dict(id=id,name=name,sector=sector,deck=deck,view='DEPTH',kit=kit,w=1500,h=430,map=mapxy,architecture='Deux seuils distincts et une bande de circulation continue. Mobilier central contournable par le fond ou le premier plan. '+('Refuge local protégé du chasseur ; arrivée d’escorte validée au poste à droite. Ce refuge ne garantit pas le sauvetage définitif hors station.' if safe else 'Local de passage : une alarme murale peut détourner une menace, mais attire aussi le chasseur.'),props=[],vents=[] if safe else [dict(x=1335,y=300)],safe=safe,exterior=False,ordinal=len(C['rooms']),addedV05=True)
 rows=[('cabinet',445,210,70,50,True,'armoire de rangement'),('table',750,260,155,64,True,'îlot central à contourner'),('chair',900,205,46,35,True,'siège de relève'),('locker',250,205,66,28,False,'casier d’attente discret','hide'),('locker',1230,200,66,28,False,'casier pour le personnel escorté','hide'),('case',1300,350,44,25,False,'réserve à usage unique','loot'),('save',150,355,42,25,False,'borne de sauvegarde','save'),('poster',535,130,60,2,False,'signalétique de circulation'),('light',1060,130,85,2,False,'éclairage mural'),('water',1070,210,44,32,True,'distributeur hors du passage'),('terminal',1060,350,70,24,False,'poste de suivi des équipes'),('bed' if safe else 'bench',510,270,140,54,True,'couchette du refuge' if safe else 'banc de changement d’équipe')]
 for row in rows:prop(r,*row)
 if not safe:prop(r,'relay',365,350,54,25,False,'commande d’alarme à impulsions ; active 18 secondes','alarm')
 C['rooms'].append(r);rooms[id]=r;return r
room('m_triage','San Cristobal · Préparation des soins','MÉDICAL','medical',1,[5,5])
room('m_refuge','San Cristobal · Salle de repli','MÉDICAL','hospital',1,[5,4],True)
room('d_changing','Logistique · Vestiaire des équipes','LOGISTIQUE','cargo',0,[2,5])
room('d_refuge','Logistique · Poste de relève','LOGISTIQUE','office',0,[2,4],True)
def link(a,b,ap,bp,minimum,flag=None):
 C['links'].append(dict(id=a+'__'+b,a=a,b=b,aPoint=dict(x=ap[0],y=ap[1],wall=ap[2]),bPoint=dict(x=bp[0],y=bp[1],wall=bp[2]),kind='door',min=minimum,flag=flag,deny=None,label='Passage de service',addedV05=True))
link('m_isolation','m_triage',(1050,122,'N'),(80,300,'L'),4,'morley')
link('m_triage','m_sterile',(1420,300,'R'),(1010,122,'N'),4,'morley')
link('m_triage','m_refuge',(700,122,'N'),(80,300,'L'),4,'morley')
link('m_records','m_refuge',(1050,122,'N'),(1420,300,'R'),4,'morley')
link('d_warehouse','d_changing',(1150,122,'N'),(80,300,'L'),6)
link('d_relay','d_changing',(680,122,'N'),(1420,300,'R'),6)
link('d_changing','d_refuge',(700,122,'N'),(80,300,'L'),6)
link('d_refuge','d_lift',(1420,300,'R'),(605,300,'N'),6)
for e in C['links']:
 if e.get('addedV05') and not rooms[e['a']]['safe'] and not rooms[e['b']]['safe']:
  C['ducts'].append(dict(id='duct.'+e['id'],a=e['a'],b=e['b'],seconds=4,min=e['min'],deny=None,purpose='Raccord de gaines vers les locaux de service ; pas vers les refuges.',addedV05=True))
for i,rid,label,reply,reward in [
 (17,'m_triage','Contrôler les lots du triage','Le lot stérile peut soigner une équipière à terre. Une trousse ne ramènera personne après son dernier souffle.',{'medkit':1,'chemical':2}),
 (18,'m_refuge','Consigner le plan de repli','Le tableau indique la chambre d’isolement. Nora attend derrière un casier. Le repli doit se faire à pied.',{'noise':1,'battery':1}),
 (19,'d_changing','Contrôler les accès des équipes','Elias connaît le poste de relève. Une porte verrouillée arrêtera aussi votre escorte.',{'scrap':3,'battery':1}),
 (20,'d_refuge','Récupérer la caisse des équipes','Le refuge dispose d’une réserve. Il protège ce poste, pas toute la station.',{'emp':1,'chemical':1})]:
 C['optional'].append(dict(id=f'O{i:02}',room=rid,x=1060,y=350,label=label,reply=reply,reward=reward,hold=1.1,addedV05=True))
 p=next(p for p in rooms[rid]['props'] if p['kind']=='terminal');p['interactive']=f'O{i:02}';p['purpose']=label
for i,rid,title,text in [
 (40,'m_triage','Arrêter la sirène','La commande pulse pendant dix-huit secondes. Coupez-la depuis le même poste. Une fois entendu, le son ne disparaît pas de la mémoire de ce qui l’a suivi.'),
 (41,'m_refuge','Une porte pour deux','Nora n’avance pas à la vitesse d’une personne qui court. Revenez sur vos pas si sa voix s’éloigne. Le détecteur ne sait pas distinguer une amie d’une menace.'),
 (42,'d_changing','Deux pas derrière','Elias attendra si vous le lui demandez. Pour le cacher, montrez-lui un casier libre : il devra encore l’atteindre sans être vu.'),
 (43,'d_refuge','Le dernier nom','Le panneau ne dit pas « évacué ». Il dit « arrivé au poste ». Personne ici ne peut promettre ce qui viendra après.')]:
 C['logs'].append(dict(id=f'LOG{i:02}',room=rid,title=title,text=text,addedV05=True))
C['rescues']=[
 dict(id='nora',name='Nora Velez',role='Infirmière de garde · personnage original',room='m_isolation',x=365,y=350,min=4,home='m_refuge',homePoint=dict(x=1150,y=350),allowed=[r['id'] for r in C['rooms'] if r['sector']=='MÉDICAL'],reward=dict(medkit=2,noise=1),intro='Nora · Je vous suivrai, mais pas en courant. La salle de repli est derrière le triage. Attendez que j’aie passé chaque porte.',thanks='Nora · Je reste près de cette borne. Vous avez ramené une personne, pas un simple badge.'),
 dict(id='elias',name='Elias Kwan',role='Technicien de manutention · personnage original',room='d_changing',x=970,y=350,min=6,home='d_refuge',homePoint=dict(x=1150,y=350),allowed=[r['id'] for r in C['rooms'] if r['sector']=='LOGISTIQUE'],reward=dict(emp=1,battery=3),intro='Elias · Je n’ai pas de combinaison. Le poste de relève est de l’autre côté du vestiaire. Je passerai les portes après vous.',thanks='Elias · Le circuit de relève tient encore. Je vous laisse les cellules. Je ne quitte plus ce poste.')]
for spec in C['rescues']:
 C['characters'].append(dict(name=spec['name'],role=spec['role'],text=spec['intro']+' Escorte physique facultative : suivre, attendre, rejoindre un casier, blessure récupérable et arrivée locale persistante. Ce personnage n’est pas présenté comme canonique.',addedV05=True))
C['encounterRules']=dict(alarmSeconds=18,alarmCooldown=30,warningSeconds=2.0,deescalationSeconds=6.0,bleedSeconds=25,escortMaxHealth=70,escortCrouchSpeed=140,escortWalkSpeed=218,commandRange=360,hideRange=240,predatorRange=380,predatorWindup=.7,predatorRecovery=2.2)
C['rules'] += ['[0.5] '+r for r in [
 'Les deux personnages escortables sont des créations pour cette adaptation, pas une revendication de contenu canonique.',
 'Le sauvetage est facultatif. Mort ou abandon ne bloque aucun objectif principal.',
 'Un contact abrité reste dissimulé tant qu’Amanda ne l’appelle pas au moyen d’une interaction proche.',
 'Une escorte marche réellement vers Amanda, contourne le mobilier et ne se téléporte pas quand elle prend du retard.',
 'Courir peut distancer une escorte. Sa position exacte est indiquée dans le journal des liaisons.',
 'E auprès d’un compagnon alterne suivre et attendre. La commande n’est pas envoyée à travers un mur.',
 'U commande au compagnon proche de rejoindre un casier libre. L’animation de trajet n’est jamais remplacée par une apparition dans le casier.',
 'Un casier occupé par Amanda ou une autre escorte ne reçoit pas un second occupant.',
 'Une entrée de casier vue par le chasseur reste une cachette compromise.',
 'Les seuils suivis sont ceux réellement traversés par Amanda ; aucune recherche télépathique de sa position entre les secteurs.',
 'Une porte scellée arrête aussi le compagnon jusqu’à ouverture ou expiration du verrou.',
 'Les escortes ne prennent ni tram, navette, ascenseur ni sortie spatiale ; elles attendent à la limite de leur secteur déclaré.',
 'Le changement de pièce d’un compagnon exige une approche physique et un bref temps de passage.',
 'Le refuge est un abri local : ce n’est pas une promesse d’évacuation définitive de Sevastopol.',
 'L’arrivée doit être confirmée auprès du compagnon après son déplacement au point d’accueil.',
 'Les récompenses de sauvetage ne sont accordées qu’une fois et ne modifient pas les drapeaux de la campagne.',
 'Une escorte à zéro santé tombe à terre. Une trousse et une interaction de 2,4 secondes permettent de la stabiliser avant 25 secondes.',
 'Le délai de blessure continue hors de la pièce et dans l’équipement. La pause explicite le suspend.',
 'Une escorte morte ne peut pas être ressuscitée par une autre interaction ; seule une sauvegarde antérieure change le résultat.',
 'Le chasseur perçoit les humains actifs proches par vision et bruit. Il n’évalue pas toutes leurs coordonnées à travers la station.',
 'Une poursuite visuelle d’Amanda prime sur une nouvelle proie secondaire ; perdre la vue permet à une distraction humaine d’agir.',
 'Les Working Joes ne sont pas des proies de ce chasseur. Les leurres et IEM restent deux outils différents.',
 'Un humain armé repéré avertit avant de devenir hostile. Sortir de sa vue six secondes lui permet de redescendre en vigilance.',
 'Un tir hostile émet un bruit dans sa pièce ; il peut attirer une créature déjà active, pas en créer une.',
 'Les corps d’humains armés restent au sol et ne fournissent qu’une collecte ; aucun respawn de ressources.',
 'Le journal des liaisons et les sauvegardes conservent blessures, trajets en attente, cachettes, récompenses et alarmes.',
 'Les nouvelles annexes médicales restent regroupées dans le même secteur sur la carte ; la carte de Morley reste nécessaire.',
 'Les états préparés de test, les parcours sous menace et les contrôles sans dégâts sont distingués dans le rapport.'
]]
C['revision05']=dict(version='0.5.0',newRooms=[r['id'] for r in C['rooms'] if r.get('addedV05')],nativeIntegration=False)
assert len({r['id'] for r in C['rooms']})==len(C['rooms'])
(R/'src/content.json').write_text(json.dumps(C,ensure_ascii=False,indent=2)+'\n')
(R/'src/content.js').write_text('export const CONTENT = '+json.dumps(C,ensure_ascii=False,separators=(',',':'))+';\n')
print({k:len(C[k]) for k in ['rooms','links','optional','rules','logs','characters','rescues']},'props',sum(len(r['props']) for r in C['rooms']))
