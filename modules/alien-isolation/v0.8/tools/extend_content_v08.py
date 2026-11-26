"""Authored spatial revision. Run after v07; includes deterministic door mounts.
Reference sector names: public campaign-map index, not copied map geometry.
All layouts, connections, notes and optional interventions below are original.
"""
from pathlib import Path
import json, math, copy
R=Path(__file__).resolve().parents[1]; P=R/'src/content.json'; C=json.loads(P.read_text())
if C['meta']['version']!='0.7.0':
 raise SystemExit('Run content:rebuild to apply v08 from the v07 generator output.')
C['meta'].update(version='0.8.0',edition='Une station, des chemins')
rooms={r['id']:r for r in C['rooms']}; modifications=[]
# New functional spaces. These are condensed adaptations, not official floor plans.
specs=[
 ('sc_station','SciMed · Station Towerlink','SCIMED',0,'DEPTH','transit',1960,False,'Quai de transit fermé par des cloisons de service. Deux cages desservent les soins et la logistique ; ce quai ne remplace pas un couloir entre deux étages.',['bench','vending','kiosk','case']),
 ('h_galleria_low','Solomons · Galleria basse','HABITATION',0,'DEPTH','shop',2100,False,'Galerie de boutiques avec allée centrale libre, escalier vers la mezzanine et retour balisé au poste des Marshals.',['counter','vending','table','case']),
 ('h_galleria_high','Solomons · Galleria haute','HABITATION',1,'DEPTH','terminal',1800,False,'Palier supérieur de la galerie. Les gardes-corps bordent le vide ; le passage latéral rejoint les logements au même niveau.',['bench','planter','kiosk','case']),
 ('h_habitation','Solomons · Quartiers d’habitation','HABITATION',1,'HYBRID','cryo',2080,False,'Coursive desservant des alcôves domestiques. Le transit supérieur exige un escalier ; les portes de logement ne sont pas des portails disposés au sol.',['bed','cabinet','table','case']),
 ('h_upper','Solomons · Transit supérieur','HABITATION',2,'DEPTH','transit',1900,False,'Plateforme de correspondance. Un transport explicitement nommé rejoint les communications ; un ascenseur revient à la galerie basse.',['bench','kiosk','spool','case']),
 ('m_morgue','San Cristobal · Maintenance et morgue','MÉDICAL',0,'DEPTH','hospital',1760,False,'La chambre mortuaire suit un couloir de manutention. Les équipements froids laissent libres l’issue vers le refroidissement et l’escalier de service pharmaceutique.',['gurney','cabinet','bed','case']),
 ('d_fluid','Seegson · Production de fluide synthétique','LOGISTIQUE',0,'DEPTH','coolant',2020,False,'Deux batteries de pompes encadrent le circuit de purge. Un passage rejoint les stocks, l’autre les relais, sans traverser les cuves.',['tank','pump','pipe','case']),
 ('d_orientation','Seegson · Orientation des androïdes','APOLLO',-1,'DEPTH','synthetic',1810,True,'Les alcôves d’orientation se distinguent des postes de réparation. Les baies sont décoratives, les deux seuils latéraux restent praticables.',['androidrack','server','terminal','case']),
 ('r_maintenance','Ingénierie · Pont de maintenance','RÉACTEUR',-3,'HYBRID','maintenance',2050,False,'Coursive technique contournant la plateforme du réacteur. Les raccords rejoignent la plateforme et la branche bêta au même niveau.',['pump','spool','workbench','case']),
 ('g_hazard','KG-348 · Laboratoires à risques','GEMINI',1,'DEPTH','lab',1770,False,'Sous-niveau du module détachable. Deux escaliers de confinement remontent au plateau et au plénum ; toutes les issues ferment avec le module.',['tank','desk','cabinet','case']),
 ('t_galley','Torrens · Carré de l’équipage','TORRENS',1,'DEPTH','bridge',1510,True,'Le carré raccorde la cryostase à la passerelle. Tables et sièges sont hors de l’allée, les deux portes appartiennent aux cloisons d’extrémité.',['table','chair','counter','case']),
 ('f_pilot','Souvenir · Chambre du pilote','SOUVENIR',0,'DEPTH','derelict',1950,True,'Le récit de Marlow mène de la corniche à une chambre organique puis vers les œufs. Les seuils sont des arches, jamais des portes Seegson.',['rib','rock','resin','case'])
]
foot=C['footprints']
for i,(id,name,sector,deck,view,kit,w,safe,description,kinds) in enumerate(specs):
 r=dict(id=id,name=name,sector=sector,deck=deck,view=view,kit=kit,w=w,h=430,map=[i%4,16+i//4],architecture=description,props=[],vents=[dict(x=round(w*.8),y=300)],safe=safe,exterior=False,ordinal=len(C['rooms']),addedV08=True)
 def prop(kind,x,y,solid=False,interactive=None,purpose='Équipement de service'):
  fp=foot[kind]; fw,fd=(fp[:2] if isinstance(fp,list) else (fp['w'],fp['d']))
  p=dict(id=id+'.v08.p'+str(len(r['props'])).zfill(2),kind=kind,x=round(x),y=y,w=fw,d=fd,solid=solid,cover=solid or kind=='locker',purpose=purpose,addedV08=True)
  if interactive:p['interactive']=interactive
  r['props'].append(p);return p
 # Two separate furniture clusters, preserving the full central circulation strip.
 prop(kinds[0],w*.27,205,True,purpose='Batterie ou mobilier principal, hors de la circulation')
 prop(kinds[1],w*.62,195,True,purpose='Équipement de fond ; contournement par l’allée')
 prop(kinds[2],w*.70,325,True,purpose='Îlot de service ; accès libre au centre')
 prop('locker',w*.16,215,False,'hide','Casier individuel ; entrée et recherche observables')
 prop('save',w*.39,365,False,'save','Borne de sauvegarde adossée au service')
 prop('case',w*.83,350,False,'loot','Réserve finie, contenant ouvert après collecte')
 prop('relay',w*.48,360,False,'rewire','Tableau électrique local')
 prop('poster',w*.52,130,False,purpose='Signalétique du secteur')
 prop('light',w*.72,130,False,purpose='Éclairage mural')
 # Lore has a real readable terminal at the engine log coordinates.
 prop('terminal',w*.38,170,False,purpose='Terminal d’archive du service')
 C['rooms'].append(r);rooms[id]=r

# Explicit graph, with narrative locks retained on alternate paths.
def link(a,b,kind='door',minimum=0,flag=None,deny=None,label=None):
 id=a+'__'+b
 assert not any(e['id']==id for e in C['links'])
 C['links'].append(dict(id=id,a=a,b=b,kind=kind,min=minimum,flag=flag,deny=deny,label=label or {'stairs':'Escalier de service','lift':'Ascenseur de secteur','tram':'Towerlink','passage':'Arche de passage'}.get(kind,'Porte de service'),addedV08=True))
link('y_lobby','sc_station','tram',4,label='Towerlink · Quai SciMed')
link('sc_station','m_reception','lift',4,label='Ascenseur des soins')
link('sc_station','d_warehouse','lift',6,label='Ascenseur de la logistique')
link('w_bureau','h_galleria_low',minimum=7)
link('h_galleria_low','s_terminal',minimum=10,label='Retour au terminal des voyageurs')
link('h_galleria_low','h_galleria_high','stairs',7)
link('h_galleria_high','h_habitation',minimum=7)
link('h_habitation','h_upper','stairs',15)
link('h_upper','c_server','tram',15,label='Transit supérieur · Correspondance communications')
link('h_upper','h_galleria_low','lift',15)
link('m_coolant','m_morgue',minimum=5)
link('m_morgue','m_pharmacy','stairs',5,flag='morley')
link('d_warehouse','d_fluid',minimum=6)
link('d_fluid','d_relay',minimum=6)
link('a_labo','d_orientation',minimum=11)
link('d_orientation','a_samuels',minimum=11)
link('r_entry','r_maintenance',minimum=13)
link('r_maintenance','r_beta',minimum=13)
link('g_lab','g_hazard','stairs',9,flag='gemini',deny='detached')
link('g_hazard','g_plenum','stairs',9,flag='gemini',deny='detached')
link('t_cryo','t_galley')
link('t_galley','t_bridge')
link('f_surface','f_pilot','passage',8)
link('f_pilot','f_derelict','passage',8)

# Different decks are represented by a stair/lift, never an ordinary door.
for e in C['links']:
 a,b=rooms[e['a']],rooms[e['b']]
 if e['kind']=='door' and a['deck']!=b['deck']:
  modifications.append(dict(type='vertical-connector',id=e['id'],before='door',after='stairs',decks=[a['deck'],b['deck']]))
  e['kind']='stairs';e['label']='Escalier · '+e['label'];e['verticalV08']=True
 if e['kind']=='stairs' and a['deck']==b['deck']:
  modifications.append(dict(type='level-connector',id=e['id'],before='stairs',after='door'))
  e['kind']='door';e['label']='Passage logistique de plain-pied'
 if e['a'].startswith('f_') and e['b'].startswith('f_'):
  e['kind']='passage';e['label']='Arche du vaisseau abandonné'
 if rooms[e['a']]['exterior'] and rooms[e['b']]['exterior'] and e['kind']=='door':
  e['kind']='walkway';e['label']='Passerelle extérieure ouverte'
# This is a pressurized airlock, not an exposed walking area.
rooms['g_airlock']['exterior']=False;rooms['g_airlock']['kit']='airlock'
rooms['m_coolant']['architecture']='Le refroidissement est sous la pharmacie : un escalier la rejoint. La sortie logistique est de plain-pied au niveau 0, avec un passage de manutention.'

# Same pharmacy card on every entrance, including the maintenance stair.
edge=next(e for e in C['links'] if e['id']=='m_pharmacy__m_coolant')
edge['flag']='morley';modifications.append(dict(type='lock-consistency',id=edge['id'],before=None,after='morley'))
# Synthetics' repair/orientation spaces are not labelled as APOLLO core rooms.
for id in ['a_labo','a_samuels','d_orientation']:
 before=rooms[id]['sector'];rooms[id]['sector']='SYNTHÉTIQUES'
 modifications.append(dict(type='sector-label',id=id,before=before,after='SYNTHÉTIQUES'))

# Notes and optional engineering actions in every new room.
texts=[
 ('La correspondance','Le panneau conserve les anciens départs. La ligne directe dessert l’admission ; le quai de correspondance permet aussi de rejoindre la logistique.'),
 ('Rideaux baissés','Les boutiques ont fermé avant la quarantaine. Une trace de chaussures relie encore le comptoir au palier supérieur.'),
 ('Au-dessus des vitrines','Les enseignes éclairent un étage désert. Sous le garde-corps, la galerie basse porte les mêmes marques de fuite.'),
 ('Des chambres, pas des stocks','Un avis d’évacuation est resté sous une porte. Les affaires du prochain quart sont encore rangées sur la couchette.'),
 ('Une autre ligne','Le réseau supérieur rejoint les communications. Les panneaux de destination désignent un transport, pas la porte de la pièce voisine.'),
 ('Le dernier inventaire','Les tiroirs froids sont fermés. Le chariot de transfert occupe sa place de rangement, loin de l’issue de service.'),
 ('Liquide de service','La pompe a continué de tourner après le départ des opérateurs. Le circuit de retour contourne les cuves par le couloir central.'),
 ('Orientation interrompue','Les cabines de formation affichent une procédure d’accueil. Personne ne semble avoir chargé les instructions d’évacuation.'),
 ('Sur le même pont','Les équipes passaient ici pour éviter la plateforme principale. Les deux sorties sont sur le pont -3 ; seules les branches du nid descendent.'),
 ('Le module entier','Le sous-niveau est solidaire du laboratoire. Quand les cloisons de confinement tombent, les escaliers de service ferment aussi.'),
 ('Le café a refroidi','Une table attend le prochain repas de quart. Derrière la cloison, les alarmes de cryostase sont déjà éteintes.'),
 ('Un volume impossible','Marlow décrit une chambre plus haute que les coursives. Ce souvenir ne relie pas physiquement la planète à Sevastopol.')
]
for i,(spec,(title,text)) in enumerate(zip(specs,texts)):
 id=spec[0];r=rooms[id];lid='L'+str(len(C['logs'])+1).zfill(2)
 C['logs'].append(dict(id=lid,room=id,title=title,text=text,addedV08=True))
 tid='O'+str(len(C['optional'])+1).zfill(2)
 label=['Vérifier le panneau de correspondances','Consulter le registre des boutiques','Sécuriser le palier supérieur','Relever le registre des logements','Réarmer la signalisation du transit','Fermer le circuit de transport mortuaire','Purger le circuit de fluide','Mettre les cabines en veille','Contrôler le retour de maintenance','Consigner les échantillons à risque','Récupérer les effets du quart','Examiner le relief de la chambre'][i]
 t=dict(id=tid,room=id,x=round(r['w']*.55),y=300,label=label,reply='Amanda — '+text if not id.startswith('f_') else 'Marlow — '+text,reward={'scrap':1} if i%3==0 else {'chemical':1} if i%3==1 else {'battery':1},addedV08=True)
 C['optional'].append(t);r['props'].append(dict(id=id+'.v08.task',kind='terminal' if not id.startswith('f_') else 'rock',x=t['x'],y=t['y'],w=45,d=24,solid=False,cover=False,purpose=label,interactive=tid,addedV08=True))

# The flashback is an organic chamber, without modern lockers or powered terminals.
for p in rooms['f_pilot']['props']:
 if p['kind'] in ['locker','save','case','relay','poster','light','terminal']:
  old=p['kind'];p['kind']='rock' if old in ['case','save','relay'] else 'rib'
  p.pop('interactive',None);p['cover']=False;p['solid']=False
  p['w'],p['d']=foot[p['kind']][:2]
  p['purpose']='Relief organique du vaisseau abandonné ; aucun équipement Seegson'
for p in rooms['f_pilot']['props']:
 if p['solid']:p['purpose']='Relief nervuré ancien ; contournement conservé dans la chambre organique'
for t in C['optional']:
 if t['id']=='O32':
  t['reward']={}
  t['reply']='Marlow — La chambre dépassait largement les coursives. Il fallait contourner les nervures pour atteindre le siège.'

# Move previously unreachable interactive furniture into the actual walking plane.
def free(r,x,y,radius=17):
 if not (35<=x<=r['w']-35 and 110<=y<=390):return False
 if r['view']=='SIDE' and abs(y-300)>.01:return False
 if r['view']=='HYBRID' and (x<260 or x>r['w']-260) and abs(y-300)>22:return False
 return not any(p['solid'] and abs(x-p['x'])<p['w']/2+radius and abs(y-p['y'])<p['d']/2+radius for p in r['props'])
def segment(r,a,b,radius=17):
 n=max(1,int(math.hypot(a['x']-b['x'],a['y']-b['y'])/5)+1)
 return all(free(r,a['x']+(b['x']-a['x'])*i/n,a['y']+(b['y']-a['y'])*i/n,radius) for i in range(n+1))
for r in C['rooms']:
 for p in r['props']:
  if not p.get('interactive') or p['solid'] or free(r,p['x'],p['y']):continue
  # SIDE wall-mounted equipment is deliberately approached along y=300.
  if r['view']=='SIDE':continue
  old={'x':p['x'],'y':p['y']}
  candidates=[{'x':x,'y':y} for x in range(90,r['w']-89,10) for y in range(120,381,10) if free(r,x,y) and math.hypot(x-p['x'],y-p['y'])<170]
  if not candidates:raise ValueError('No approach for prop '+p['id'])
  q=min(candidates,key=lambda q:math.hypot(q['x']-p['x'],q['y']-p['y']))
  p.update(q);modifications.append(dict(type='furniture-approach',id=p['id'],room=r['id'],before=old,after=q))

# New branches also belong to the ceiling graph, preventing a stranded hunter.
# Original transit/safe sector exceptions are preserved.

for id,neighbor in [('sc_station','m_reception'),('h_galleria_low','w_bureau'),('h_galleria_high','h_galleria_low'),('h_habitation','h_galleria_high'),('h_upper','h_habitation'),('m_morgue','m_coolant'),('d_fluid','d_warehouse'),('r_maintenance','r_entry'),('g_hazard','g_lab')]:
 C['ducts'].append(dict(id='duct.v08.'+id+'__'+neighbor,a=id,b=neighbor,seconds=5.0,min=9 if id=='g_hazard' else 0,deny='detached' if id=='g_hazard' else None,purpose='Gaine de service raccordée à '+neighbor,addedV08=True))
# New annexes of the same medical/logistics sector can be traversed by escorts.
for r in C['rescues']:
 if r['id']=='nora':r['allowed'].append('m_morgue')
 if r['id']=='elias':r['allowed'].append('d_fluid')

# Door placement is authored from room boundaries. Points are approach positions;
# opening planes are stored separately and shared by game/codex/map/auditor.
for r in C['rooms']:
 adjacent=[e for e in C['links'] if r['id'] in (e['a'],e['b'])]
 used_walls=set()
 for e in adjacent:
  side='a' if e['a']==r['id'] else 'b';p=e.get(side+'Point')
  if p:used_walls.add(p['wall'])
 for e in adjacent:
  side='a' if e['a']==r['id'] else 'b'
  if side+'Point' not in e:
   wall='L' if 'L' not in used_walls else 'R' if 'R' not in used_walls else 'N';used_walls.add(wall)
   e[side+'Point']=dict(x=80 if wall=='L' else r['w']-80 if wall=='R' else round(r['w']*.52),y=300 if wall!='N' or r['view']=='SIDE' else 122,wall=wall)
 # Correct the first room's reversed entry without changing the paired exit.
 if r['id']=='t_cryo':
  e=next(e for e in adjacent if e['id']=='t_cryo__t_bridge');e['aPoint']=dict(x=r['w']-80,y=300,wall='R')
  e=next(e for e in adjacent if e['id']=='t_cryo__t_galley');e['aPoint']=dict(x=80,y=300,wall='L')
 # Dense transport facades are laid out together, not squeezed into leftover slots.
 rear=[e for e in adjacent if e[('a' if e['a']==r['id'] else 'b')+'Point']['wall']=='N']
 if len(rear)>=7:
  for j,e in enumerate(rear):
   side='a' if e['a']==r['id'] else 'b'; old=copy.deepcopy(e[side+'Point']); e[side+'Point']['x']=round(230+j*(r['w']-460)/(len(rear)-1),3)
   modifications.append(dict(type='facade-layout',id=e['id'],room=r['id'],before=old,after=copy.deepcopy(e[side+'Point'])))
 occupied=[]
 for e in sorted(adjacent,key=lambda e:(e.get('addedV08',False),C['links'].index(e))):
  side='a' if e['a']==r['id'] else 'b';p=e[side+'Point'];old=copy.deepcopy(p)
  if p['wall']=='N':
   margin=300 if r['view']=='HYBRID' else 225
   candidates=[p['x']]+list(range(margin,r['w']-margin+1,10))
   candidates=sorted(set(candidates),key=lambda x:abs(x-p['x']))
   def valid(x):
    if not margin<=x<=r['w']-margin:return False
    if any(abs(x-o)<205 for o in occupied):return False
    if r['view']!='SIDE' and any(q['solid'] and abs(q['x']-x)<q['w']/2+28 and q['y']-q['d']/2<173 for q in r['props']):return False
    # No small usable prop competing for precisely the same threshold.
    if any(q.get('interactive') and abs(q['x']-x)<66 and abs(q['y']-(300 if r['view']=='SIDE' else 122))<55 for q in r['props']):return False
    return True
   x=next((x for x in candidates if valid(x)),None)
   if x is None:raise ValueError('No free architectural mount '+r['id']+' '+e['id'])
   p.update(x=round(x,3),y=300 if r['view']=='SIDE' else 122);occupied.append(p['x'])
  if p!=old:modifications.append(dict(type='anchor',id=e['id'],room=r['id'],before=old,after=copy.deepcopy(p)))
  wall=p['wall'];ox=35 if wall=='L' else r['w']-35 if wall=='R' else p['x'];oy=100 if wall=='N' else 300
  dest=rooms[e['b'] if side=='a' else e['a']]
  mount='narrative' if e['kind']=='memory' else 'open' if e['kind'] in ['walkway','passage'] else 'hull' if r['exterior'] and not dest['exterior'] else 'wall'
  e[side+'Portal']=dict(wall=wall,x=ox,y=oy,width=124 if e['kind']=='vent' else 156 if e['kind']=='stairs' else 112,mount=mount,approach=copy.deepcopy(p),arrival=dict(x=128 if wall=='L' else r['w']-128 if wall=='R' else p['x'],y=300 if r['view']=='SIDE' or wall!='N' else 190),labelId='P'+str(C['links'].index(e)+1).zfill(3))
 # Arrival is authored and verified, rather than silently repaired at every load.
 for e in adjacent:
  side='a' if e['a']==r['id'] else 'b';m=e[side+'Portal'];old=copy.deepcopy(m['arrival'])
  if not segment(r,m['approach'],m['arrival']):
   candidates=[dict(x=m['approach']['x']+dx,y=y) for dx in range(-50,51,10) for y in ([300] if r['view']=='SIDE' or m['wall']!='N' else range(142,203,10))]
   candidates=[q for q in candidates if segment(r,m['approach'],q)]
   if not candidates:raise ValueError('No arrival clearance '+r['id']+' '+e['id'])
   m['arrival']=min(candidates,key=lambda q:math.hypot(q['x']-old['x'],q['y']-old['y']))
   modifications.append(dict(type='arrival-clearance',id=e['id'],room=r['id'],before=old,after=copy.deepcopy(m['arrival'])))
 r['shell']=dict(schema=1,closed=not r['exterior'],bounds=dict(left=35,right=r['w']-35,rear=100,front=400),projection='cutaway-side' if r['view']=='SIDE' else 'cutaway-depth',note='Gauche, droite et fond sont locaux à la caméra ; le réseau global est schématique, sans échelle métrique.')
 r['coverage']='original-addition' if r.get('addedV02') or r.get('addedV03') or r.get('addedV04') or r.get('addedV05') else 'condensed-adaptation'

# Render cave passages in organic rooms as openings; modern airlock images are forbidden there.
for e in C['links']:
 a,b=rooms[e['a']],rooms[e['b']]
 e['spatial']=dict(labelId='P'+str(C['links'].index(e)+1).zfill(3),decks=[a['deck'],b['deck']],vertical=a['deck']!=b['deck'],profile='connector' if e['kind']!='door' else 'straight' if {e['aPoint']['wall'],e['bPoint']['wall']}=={'L','R'} else 'angled',note='Seuils locaux avec changement de caméra ; le raccord hors champ est condensé.')

# Wall posters/lights cannot cover a door, stair throat or ventilation opening.
# Their new positions remain in the shared data, not only in the renderer.
for r in C['rooms']:
 portals=[e[('a' if e['a']==r['id'] else 'b')+'Portal'] for e in C['links'] if r['id'] in (e['a'],e['b'])]
 for p in r['props']:
  if p['kind'] not in ['poster','light']:continue
  half=p['w']*256/(155 if p['kind']=='poster' else 220)*(.8+p['y']/1300)/2
  clear=lambda x: all(abs(x-q['x'])>=half+q['width']/2+16 for q in portals)
  if clear(p['x']):continue
  candidates=[x for x in range(100,r['w']-99,5) if clear(x)]
  if not candidates:raise ValueError('No wall segment for '+p['id'])
  old=p['x'];p['x']=min(candidates,key=lambda x:abs(x-old));modifications.append(dict(type='wall-decoration',id=p['id'],room=r['id'],before=old,after=p['x']))

rules=[
'Toute liaison possède exactement deux seuils, avec destination réciproque et identifiant stable.',
'La position d’interaction et le plan de l’ouverture sont séparés : le joueur reste du côté praticable.',
'Une porte latérale appartient à une cloison d’extrémité ; son mur est rendu jusqu’au plafond et au sol.',
'Un accès de fond est monté sur la paroi de fond, pas au centre d’une salle en profondeur.',
'En profil, l’accès de fond se lit comme une alcôve, avec seuil et bande d’approche, pas comme une porte autonome.',
'Les ouvertures de fond sont espacées d’au moins 205 unités pour éviter les chevauchements de cadres.',
'Une différence de pont exige un escalier ou un ascenseur, jamais une porte de plain-pied.',
'Un escalier de plain-pied doit être requalifié ; sa hauteur ne doit pas contredire les niveaux annoncés.',
'Une passerelle entre deux espaces extérieurs n’est pas dessinée comme une porte de pression flottante.',
'Une ouverture extérieure vers un volume pressurisé reçoit un sas avec enveloppe de coque.',
'Les seuils du souvenir sont des arches organiques ; le récit ne constitue pas une liaison physique à la planète.',
'Les 64 lieux précédents et leurs identifiants sont conservés ; les nouveaux sites ne remplacent pas les anciens.',
'Les raccords ajoutés gardent les conditions narratives ; aucune annexe ne donne accès gratuitement à la pharmacie.',
'Les annexes du module KG-348 sont condamnées avec le confinement et le détachement.',
'Chaque nouvelle branche dangereuse dispose d’un raccord dans le réseau de gaines du chasseur.',
'Les plans d’approche sont contrôlés avec une marge de collision ; l’arrivée ne peut pas être dans un meuble.',
'La carte utilise les mêmes seuils et les mêmes empreintes que le moteur, sans positions corrigées uniquement dans le document.',
'Le schéma de réseau n’est pas un plan métrique ; un trait ne prouve pas une contiguïté de murs.',
'Le plan local distingue paroi, ouverture, approche et arrivée ; les flèches ne téléportent pas le joueur.',
'Un repère cartographique sélectionne une destination ; aucun déplacement ni objectif ne se valide dans le menu.',
'Un accès fermé indique sa condition : progression, carte, fermeture de module ou verrou temporaire.',
'Le choix manuel d’un repère conserve l’objectif principal et peut être effacé sans perdre la progression.',
'La circulation est vérifiée de chaque seuil vers chaque autre seuil et chaque poste utilisable.',
'Les parcours géométriques et les campagnes avec dégâts sont publiés séparément.',
'Les images de salle préparées pour inspection ne sont pas présentées comme un parcours naturel.',
'Les principales familles de lieux sont recensées ; cette version ne reproduit pas chaque pièce du jeu commercial.',
'Les casiers restent liés à leurs identifiants lors des imports de sauvegarde.',
'Les raccords verticaux restent utilisables par le joueur sans ajouter de téléportation dans la carte.'
]
C['rules'] += ['SPACE08/'+str(i+1).zfill(2)+' · '+t for i,t in enumerate(rules)]
C['spatialRevision']=dict(schema=1,version='0.8.0',reference='https://survivorincognito.co.uk/home/the-map-hub/alien-isolation-campaign-maps/',coverage='76 lieux condensés et originaux ; pas la totalité pièce par pièce du jeu commercial.',changes=modifications,newRooms=[s[0] for s in specs],sourceVersion='0.7.0',graphScope='Tous les lieux sont reliés au graphe structurel. Les verrous et ruptures scénaristiques restent actifs.',actualSectors=[{'reference':a,'rooms':b,'status':'condensed'} for a,b in [('The Torrens',['t_cryo','t_bridge','t_galley','t_sas','t_return']),('Spaceflight Terminal',['s_airlock','s_terminal','s_shop','s_baggage','s_axel']),('Lorenz Systech',['y_lobby','y_archive','y_workshop','y_duct']),('Seegson Communications',['c_reception','c_control','c_server']),('SciMed Tower',['sc_station']),('San Cristobal',['m_reception','m_corridor','m_morley','m_pharmacy','m_morgue','m_triage']),('Seegson Synthetics',['d_warehouse','d_fluid','d_orientation','a_labo','a_samuels']),('Gemini and Project KG348',['g_control','g_observation','g_lab','g_hazard','g_airlock']),('Solomons Habitation',['h_galleria_low','h_galleria_high','h_habitation','h_upper','w_bureau','w_cells']),('APOLLO Core',['a_access','a_service','a_core']),('Engineering',['r_entry','r_maintenance','r_alpha','r_beta','r_hive']),('The Anesidora',['n_dock','n_bridge','n_engine','n_coolant','n_service']),('Station exterior',['e_sas','e_antenna','e_clamps','e_lockers','e_catwalk','g_hull']),('Marlow flashback',['f_surface','f_pilot','f_derelict'])]])
P.write_text(json.dumps(C,ensure_ascii=False,indent=2)+'\n');(R/'src/content.js').write_text('export const CONTENT = '+json.dumps(C,ensure_ascii=False,separators=(',',':'))+';\n')
print(json.dumps(dict(rooms=len(C['rooms']),links=len(C['links']),props=sum(len(r['props']) for r in C['rooms']),rules=len(C['rules']),logs=len(C['logs']),optional=len(C['optional']),changes=len(modifications)),ensure_ascii=False))

(R/'integration/dlc-manifest.json').write_text(json.dumps({'id':C['meta']['id'],'version':C['meta']['version'],'title':C['meta']['title'],'entry':'index.html','standalone':True,'nativeIntegration':False,'saveKey':C['meta']['saveKey']},ensure_ascii=False,indent=2)+'\n')
