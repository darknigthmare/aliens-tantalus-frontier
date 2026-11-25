"""Authored in-room defenses. The positions are resolved deterministically away from exits.
No graph, primary task, original note or inventory is replaced.
"""
def enrich(content):
    by={r['id']:r for r in content['rooms']}
    shutters=[]
    plans=[('concourse',1380,'Volet de la galerie'),('hab',1280,'Volet du bloc habitat'),
           ('med',1350,'Séparation médicale'),('garage',1450,'Rideau de manutention'),
           ('stores',1530,'Volet du magasin'),('service',1720,'Volet technique'),
           ('power',1620,'Séparation du répartiteur'),('hangar',1750,'Rideau du hangar')]
    for rid,desired,label in plans:
        r=by[rid];z=.7 if r['minZ']==r['maxZ'] else .66
        def free(x):
            return all(abs(x-p['x'])>200 for p in r['portals']) and all(abs(x-c['x'])>c['w']/2+100 for c in r['cover']) and all(not (min(p['x'] for p in d['points'])-70 < x < max(p['x'] for p in d['points'])+70) for d in content['life']['residents'] if d['room']==rid)
        xs=[x for x in range(450,r['width']-450,20) if free(x)]
        if not xs:raise ValueError('No safe shutter placement '+rid)
        points=r['objects']+[d for d in content['life']['containers']+content['life']['benches'] if d['room']==rid]
        def score(x):
            clearance=min(abs(x+offset-p['x']) for offset in [-94,94] for p in points) if points else 999
            return min(clearance,160)*4-abs(x-desired)*.15
        x=max(xs,key=score)
        shutters.append(dict(id='shutter-'+rid,room=rid,label=label,x=x,z=z,w=52,d=.10 if r['minZ']==r['maxZ'] else .46,
             height=174,controls=[dict(x=x-94,z=.7),dict(x=x+94,z=.7)],integrity=100,
             closeDuration=2.6,openDuration=1.6,childReleaseDuration=1.1,origin='original_gameplay_equipment'))
    alarms=[]
    for rid,label,offset in [('concourse','Avertisseur de la galerie',340),('med','Avertisseur médical',-340),
                              ('garage','Avertisseur du garage',340),('service','Avertisseur technique',340)]:
        r=by[rid];sh=next(d for d in shutters if d['room']==rid);target=sh['x']+offset
        pts=r['portals']+r['objects']+[d for d in content['life']['containers']+content['life']['benches'] if d['room']==rid]
        xs=[x for x in range(350,r['width']-350,20) if abs(x-sh['x'])>190 and all(abs(x-c['x'])>c['w']/2+80 or abs(.7-c['z'])>c['d']/2+.03 for c in r['cover'])]
        x=max(xs,key=lambda x:min(min(abs(x-p['x']) for p in pts),170)*4-abs(x-target)*.20)
        alarms.append(dict(id='alarm-'+rid,room=rid,label=label,x=x,z=.7,duration=10,delay=4,cooldown=45,charges=2,
             range=950,occludedRange=470,circuit=r['architecture']['circuit'],origin='original_gameplay_equipment'))
    content['defense']={'shutters':shutters,'alarms':alarms,'revision':6,
        'rules':{'shutterBulletDamage':4,'shutterAdultDamage':36,'shutterWindup':.85,
                 'alarmWorkDuration':1.2,'signalDoesNotOverrideSight':True}}
    m=content['manifest'];m['version']='0.6.0-candidate.1';m['subtitle']='Hadley’s Hope · Tenir les passages'
    m['counts'].update(localShutters=len(shutters),localAlarms=len(alarms))
    return content
