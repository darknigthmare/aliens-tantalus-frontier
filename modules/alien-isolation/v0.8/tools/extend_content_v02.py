"""Idempotent 0.2 content extension; run after make_content.py.
Every addition is an original spatial interpretation, not a claim of original-game topology.
"""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
C=json.loads((R/'src/content.json').read_text())
# This preserves the original 0.1 registry; do not duplicate additions on repeated builds.
C['rooms']=[r for r in C['rooms'] if not r.get('addedV02')]
C['links']=[e for e in C['links'] if not e.get('addedV02')]
for r in C['rooms']:r['props']=[p for p in r['props'] if not p.get('addedV02')]
C['rules']=[x for x in C['rules'] if not x.startswith('[0.2]')]
C['logs']=[x for x in C['logs'] if not x.get('addedV02')]
C['meta'].update(version='0.2.0',edition='Traque et continuité')
rooms={r['id']:r for r in C['rooms']}
# Props: kind, x, y, width, depth, solid, exact architectural function.
def make_room(id,name,sector,deck,view,kit,w,arch,placements,mapxy,safe=False):
 r=dict(id=id,name=name,sector=sector,deck=deck,view=view,kit=kit,w=w,h=430,map=mapxy,architecture=arch,props=[],vents=[{'x':w-180,'y':300}],safe=safe,exterior=False,ordinal=len(C['rooms']),addedV02=True)
 for i,(kind,x,y,width,depth,solid,purpose) in enumerate(placements):
  r['props'].append(dict(id=f'{id}.p{i:02}',kind=kind,x=x,y=y,w=width,d=depth,solid=solid,cover=solid or kind=='locker',purpose=purpose,**({'interactive':{'locker':'hide','case':'loot','save':'save'}[kind]} if kind in ['locker','case','save'] else {})))
 C['rooms'].append(r);rooms[id]=r
 return r
make_room('m_staff','San Cristobal · Salle de garde','MÉDICAL',1,'DEPTH','medical',1540,
 'Le poste de garde donne à la fois sur la coursive publique et sur le circuit propre. Une table centrale sépare la ligne des casiers et le poste d’appel. Cette boucle constitue une alternative au face-à-face dans la coursive ; le conduit n’est pas une téléportation.',[
 ('desk',540,250,144,64,True,'poste de garde : écran tourné vers les deux portes'),('table',1000,258,166,66,True,'transmission entre équipes ; couverture centrale contournable au nord et au sud'),
 ('chair',680,248,54,40,True,'siège en retrait du poste de garde'),('locker',270,215,65,28,False,'casier personnel au débouché de la coursive ; pas de verrou inviolable'),
 ('locker',1230,205,65,28,False,'second casier pour contourner le poste en profondeur'),('save',140,365,42,25,False,'borne proche de l’entrée mais hors de son volume'),
 ('case',1340,357,42,25,False,'consommables de service, collecte unique'),('cabinet',410,182,60,40,True,'rangement administratif contre le fond'),('radio',920,168,58,20,False,'récepteur du tableau d’appel'),('poster',770,130,60,2,False,'panneau de garde et signalétique du circuit propre'),('light',550,130,70,2,False,'éclairage du poste de garde')], [1,3])
make_room('m_sterile','San Cristobal · Stérilisation','MÉDICAL',1,'DEPTH','pharmacy',1420,
 'Le sas du circuit propre dessert une salle de stérilisation puis la porte de service de la pharmacie. Deux autoclaves au fond, une desserte centrale et une voie de retour latérale séparent matériel sale et matériel propre. Le passage vers la pharmacie exige encore la carte de Morley.',[
 ('tank',350,198,72,55,True,'autoclave sale raccordé au mur technique'),('tank',650,198,72,55,True,'autoclave propre ; espace libre entre les deux chargements'),('cart',750,279,100,46,True,'desserte à instruments au centre ; les deux voies restent franchissables'),
 ('cabinet',1060,195,60,44,True,'stock de pochettes stériles'),('locker',215,212,65,28,False,'casier d’habillage en amont du traitement'),('case',1160,355,42,25,False,'lot de produits non encore utilisé'),('water',455,175,50,38,False,'lave-mains du circuit sale'),('pipe',795,130,140,4,False,'collecteur mural des autoclaves'),('poster',540,130,60,2,False,'consignes de séparation des circuits'),('light',1000,130,70,2,False,'rampe du contrôle des instruments')], [2,3])
make_room('d_relay','Logistique · Local des relais','LOGISTIQUE',0,'DEPTH','maintenance',1460,
 'Le local électrique ne traverse pas les charges de l’entrepôt. Deux baies protègent les câbles du monte-charge ; une porte de service rejoint son palier. Le détour permet d’éviter la ligne de patrouille du manutentionnaire, mais pas de sauter la remise en service du monte-charge.',[
 ('server',420,184,78,48,True,'relais amont du monte-charge'),('server',780,184,78,48,True,'relais de retour protégé'),('workbench',620,280,160,58,True,'table de mesure indépendante des armoires sous tension'),
 ('locker',235,205,65,28,False,'casier de consignation des techniciens'),('case',1220,355,42,25,False,'pièces de maintenance inventoriées'),('save',150,365,42,25,False,'borne de quart'),('spool',1060,270,80,55,True,'touret rangé dans la poche technique'),('relay',955,135,56,20,False,'relais mural au-dessus de la desserte'),('poster',480,130,60,2,False,'plan de consignation électrique'),('light',865,130,70,2,False,'rampe du local électrique')], [0,4])
make_room('d_gantry','Logistique · Passerelle de contrôle','LOGISTIQUE',1,'SIDE','maintenance',1700,
 'La passerelle se situe un niveau au-dessus du magasin. Deux escaliers reviennent vers l’entrepôt et le palier du monte-charge. Son profil étroit interdit le contournement en profondeur ; les casiers placés près des paliers permettent d’attendre un bruit en contrebas.',[
 ('locker',300,300,65,28,False,'casier au palier ouest, avant le segment exposé'),('locker',1330,300,65,28,False,'casier au palier est, hors de la zone de commande'),('case',1450,300,42,25,False,'caisse de sécurité récupérable'),('barrier',630,185,170,20,False,'garde-corps arrière continu, décor hors du chemin'),('barrier',970,185,170,20,False,'garde-corps de surveillance du monte-charge'),('spool',600,190,70,30,False,'touret fixé à l’arrière de la passerelle'),('pipe',950,130,150,4,False,'câblage mural reliant les deux paliers'),('poster',760,130,60,2,False,'signalétique des escaliers et restriction de charge'),('light',380,130,70,2,False,'éclairage du palier')], [1,4])
make_room('a_service','Seegson · Banc de diagnostic','APOLLO',-1,'DEPTH','synthetic',1500,
 'L’alcôve de diagnostic boucle entre le contrôle humain et la réparation. Les râteliers sont au fond, le poste de mesure au centre et le passage de service en façade. Cette liaison n’ouvre ni la consultation APOLLO ni l’interface de Samuels sans leurs prérequis.',[
 ('androidrack',410,186,78,48,True,'râtelier de pièces hors tension, distinct des Working Joes actifs'),('androidrack',745,186,78,48,True,'réserve de sous-ensembles documentée'),('workbench',635,278,160,58,True,'banc de contrôle contournable'),('server',1100,194,76,48,True,'terminal de diagnostic en baie'),('locker',210,205,65,28,False,'casier de protection des techniciens'),('case',1260,355,42,25,False,'cellules de décharge destinées aux essais'),('save',140,365,42,25,False,'borne à l’entrée de l’atelier'),('poster',535,130,60,2,False,'diagramme de consignation des synthétiques'),('light',920,130,70,2,False,'rampe de mesure')],[0,8],True)
make_room('r_observation','Réacteur · Poste de surveillance','RÉACTEUR',-3,'DEPTH','reactor',1600,
 'Le poste s’ouvre sur la plateforme supérieure et sur la branche alpha. La baie de contrôle reste à la même cote que ces deux accès ; elle ne descend pas au niveau du nid. Deux pupitres protègent le technicien mais un couloir arrière conserve le contournement.',[
 ('desk',420,254,140,60,True,'pupitre des pressions alpha'),('desk',910,254,140,60,True,'pupitre du retour du circuit'),('server',1140,190,70,48,True,'enregistreur des pressions du réacteur'),('locker',240,205,65,28,False,'casier au droit du vestibule'),('case',1370,355,42,25,False,'réserve d’urgence du poste de quart'),('save',140,365,42,25,False,'borne du quart avant la descente'),('pipe',650,130,145,4,False,'collecteur des capteurs, fixé au mur'),('radio',680,178,60,24,False,'poste radio du personnel réacteur'),('poster',780,130,60,2,False,'schéma alpha/bêta associé aux capteurs'),('light',1180,130,70,2,False,'éclairage du tableau de contrôle')],[0,9])

def link(a,b,ap,bp,label,kind='door',minimum=0,flag=None):
 C['links'].append(dict(id=f'{a}__{b}',a=a,b=b,label=label,min=minimum,flag=flag,kind=kind,deny=None,aPoint=dict(x=ap[0],y=ap[1],wall=ap[2]),bPoint=dict(x=bp[0],y=bp[1],wall=bp[2]),addedV02=True))
link('m_corridor','m_staff',(500,300,'N'),(80,300,'L'),'Salle de garde',minimum=4,flag='hunt')
link('m_staff','m_sterile',(1460,300,'R'),(80,300,'L'),'Circuit propre',minimum=4)
link('m_sterile','m_pharmacy',(1340,300,'R'),(360,122,'N'),'Stock propre',minimum=4,flag='morley')
link('m_reception','m_staff',(430,122,'N'),(770,122,'N'),'Accès du personnel',minimum=4,flag='hunt')
link('d_warehouse','d_relay',(570,122,'N'),(80,300,'L'),'Local électrique',minimum=6)
link('d_relay','d_lift',(1380,300,'R'),(400,300,'N'),'Commande du monte-charge',minimum=6)
link('d_warehouse','d_gantry',(1650,122,'N'),(80,300,'L'),'Escalier de supervision','stairs',6)
link('d_gantry','d_lift',(1620,300,'R'),(800,300,'N'),'Escalier du palier','stairs',6)
link('a_access','a_service',(410,300,'N'),(80,300,'L'),'Diagnostic latéral',minimum=11)
link('a_service','a_labo',(1420,300,'R'),(530,122,'N'),'Retour atelier',minimum=11)
link('r_entry','r_observation',(520,122,'N'),(80,300,'L'),'Poste de surveillance',minimum=13)
link('r_observation','r_alpha',(1520,300,'R'),(610,122,'N'),'Contrôle alpha',minimum=13)

C['optional']=[]
for id,room,x,y,label,reply,reward in [
 ('O01','s_shop',1040,350,'Inventorier le stock abandonné','Le tiroir contient encore trois piles et des pièces de connectique.',{'battery':3,'scrap':2}),
 ('O02','c_server',500,300,'Recopier la fiche de maintenance','La procédure de sécurité indique où brancher une cellule IEM.',{'emp':1}),
 ('O03','m_staff',1120,354,'Réactiver le tableau d’appel','Le poste de garde rend son dernier kit. Le voyant d’appel ne répond plus.',{'noise':1,'medkit':1}),
 ('O04','m_sterile',935,350,'Ouvrir le lot de pansements stériles','Les emballages sont restés scellés. Les produits n’ont pas été contaminés.',{'medkit':1,'chemical':3}),
 ('O05','d_relay',980,350,'Vérifier le carnet de consignation','Une ligne de réserve n’a jamais été raccordée. Ses pièces peuvent être récupérées.',{'battery':2,'scrap':4}),
 ('O06','d_gantry',1050,300,'Inspecter la réserve de sécurité','Les accessoires de sécurité du palier sont encore utilisables.',{'flare':2,'noise':1}),
 ('O07','a_service',1020,350,'Récupérer les cellules de diagnostic','Les cellules de test fourniront deux décharges IEM, pas une immunité aux synthétiques.',{'emp':2}),
 ('O08','r_observation',1240,350,'Contrôler la réserve anti-incendie','Le poste conserve un fond de carburant et une cellule de secours.',{'fuel':32,'emp':1})]:
 task=dict(id=id,room=room,x=x,y=y,label=label,reply=reply,reward=reward,flag=None)
 C['optional'].append(task)
 r=rooms[room];r['props'].append(dict(id=room+'.optional',kind='terminal' if id in ['O02','O03','O05','O07','O08'] else 'case',x=x,y=y-42,w=66,d=22,solid=False,cover=False,purpose='objectif facultatif : '+label,interactive=id,addedV02=True))

for room,x,y in [('y_lobby',1550,354),('c_control',670,350),('m_morley',1170,352),('m_pharmacy',455,355),('m_staff',360,354),('d_relay',330,350),('d_warehouse',1080,354),('g_control',830,350),('g_lab',1470,350),('r_entry',890,350)]:
 rooms[room]['props'].append(dict(id=room+'.rewire',kind='relay',x=x,y=y,w=50,d=22,solid=False,cover=False,purpose='tableau électrique : éclairage → dérivation ventilation 24 s → normal ; interaction locale',interactive='rewire',addedV02=True))

for r in C['rooms']:
 if 'addedV02' not in r:continue
 C['logs'].append(dict(id='LOG_'+r['id'],room=r['id'],title='Quart de service · '+r['name'].split(' · ')[-1],text={'m_staff':"On ne traverse plus le couloir sans regarder les portes. Passez par le circuit propre, mais ne laissez personne vous suivre jusque dans les casiers.",'m_sterile':"La porte de dispensation reste sous la responsabilité du médecin de garde. Une coupure de courant ne remplace pas son badge.",'d_relay':"Avant d’ouvrir une armoire : consigner, isoler, contrôler. La dérivation du ventilateur fait plus de bruit que l’alarme de fin de poste.",'d_gantry':"Depuis ici on voit les deux escaliers. En bas les machines continuent leur ronde même quand les manutentionnaires ne répondent plus.",'a_service':"Les pièces sur les râteliers sont consignées. Ne confondez pas une silhouette suspendue avec une unité en service : vérifiez ses témoins.",'r_observation':"Les mesures ne sont pas perdues. Alpha et bêta sont encore indépendantes. N’approchez pas de la purge avant d’avoir armé les deux branches."}[r['id']],addedV02=True))

rules=[
 'Un pas accroupi est local : distance et obstacles atténuent le son. Aucun bruit ne révèle automatiquement toutes les pièces voisines.',
 'La vision suit l’orientation de la créature, avec perception de proximité et temps de confirmation avant poursuite.',
 'Le chasseur conserve une position entendue ou vue ; sans nouvelle preuve il ne lit pas la position exacte du joueur.',
 'Une impulsion forte de leurre ne peut pas être remplacée en continu par des pas beaucoup plus faibles.',
 'Après une recherche infructueuse, la créature rejoint physiquement une grille avant de se retirer.',
 'Une descente de ventilation produit un avertissement avant la sortie ; aucune immunité au contact ne remplace cet avertissement.',
 'Le contact du Xénomorphe reste fatal, y compris en mode Récit.',
 'Une entrée de casier observée reste dangereuse ; couper la vue avant de se cacher.',
 'T maintient une porte proche pendant 18 secondes et consomme une pile. Un second appui local rouvre la porte.',
 'La créature doit atteindre le seuil puis forcer le verrou durant 3,4 secondes ; les portes ne sont pas des barrières invincibles.',
 'Une coupure de lumière diminue la portée de détection. Allumer la lampe annule cet avantage.',
 'La dérivation de ventilation émet pendant 24 secondes depuis une grille du local, pas depuis le joueur.',
 'Les états de circuits et verrous sont datés dans la simulation, suspendus par la pause et restaurés par les sauvegardes.',
 'Les six locaux ajoutés sont des interprétations spatiales originales ; pas des pièces prétendument reproduites à l’identique.',
 'La stérilisation ne contourne pas la carte de Morley ; le poste réacteur ne contourne pas alpha et bêta.',
 'Les deux escaliers de la passerelle logistique changent réellement le niveau affiché sur la carte.',
 'Les objectifs facultatifs donnent des stocks uniques, sans avancer les 52 objectifs de campagne.',
 'Les favoris et les recherches du codex ne révèlent pas le contenu des archives non consultées.',
 'La carte place les pièces par niveau ; ses liaisons explicitent portes, conduits, escaliers et transferts.',
 'Chaque scénario QA doit indiquer s’il s’agit d’un parcours, d’une restauration de parcours ou d’une scène préparée.',
]
C['rules'] += ['[0.2] '+s for s in rules]
# Facts consumed by UI, documentation and tests come from the same registry.
C['revision']={'newRooms':[r['id'] for r in C['rooms'] if r.get('addedV02')], 'newLinks':[l['id'] for l in C['links'] if l.get('addedV02')], 'originalGoals':52,'saveCompatible':'0.1.0 → 0.2.0, schema 1, same DLC namespace'}
(R/'src/content.json').write_text(json.dumps(C,ensure_ascii=False,indent=2))
(R/'src/content.js').write_text('export const CONTENT = '+json.dumps(C,ensure_ascii=False,separators=(',',':'))+';\n')
print({k:len(C[k]) for k in ['rooms','links','goals','optional','logs','rules']},'props',sum(len(r['props']) for r in C['rooms']))
