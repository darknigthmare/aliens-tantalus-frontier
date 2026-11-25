"""Five original maintenance ducts, not new player portals or canonical floor plans."""
def enrich(content):
    by={r['id']:r for r in content['rooms']}
    routes=[]; mouths=[]
    plans=[('reprise','concourse','garage','Reprise de manutention'),
           ('fret','stores','power','Descente du fret'),
           ('collecteur','service','pump','Collecteur de maintenance'),
           ('sterile','med','science','Retour de filtration'),
           ('echangeur','hive','coolant','Retour des échangeurs')]
    for idx,(rid,a,b,label) in enumerate(plans):
        ends=[]
        for side,roomid in enumerate((a,b)):
            r=by[roomid]
            stations=[o for o in content['life']['containers']+content['life']['benches']+content['defense']['alarms'] if o['room']==roomid]
            stations+=r['portals']+r['objects']
            shutters=[d for d in content['defense']['shutters'] if d['room']==roomid]
            def safe(x):
                return all(abs(x-c['x'])>c['w']/2+35 or abs(.7-c['z'])>c['d']/2+.06 for c in r['cover']) and all(abs(x-d['x'])>160 for d in shutters)
            xs=[x for x in range(375,r['width']-280,25) if safe(x)]
            if not xs: raise ValueError(roomid)
            def score(x):
                clear=min((abs(x-p['x']) for p in stations),default=400)
                return min(clear,160)*8-abs(x-(r['width']-420))*.32
            x=max(xs,key=score)
            mid='duct-'+roomid;ends.append(mid)
            mouths.append(dict(id=mid,route=rid,room=roomid,x=x,z=.7,label=label+' · '+('A' if side==0 else 'B'),
                               code=f'G{idx+1:02d}'+('A' if side==0 else 'B'),height=118,
                               origin='original_gameplay_not_novel_floorplan'))
        routes.append(dict(id=rid,label=label,ends=ends,duration=4+idx*.4,minPhase=2))
    content['ducts']=dict(revision=7,routes=routes,mouths=mouths,rules=dict(entryDuration=1.1,warningDuration=2.4,
        clearance=300,closeDuration=2.0,openDuration=1.2,listenDuration=1.7,hitDamage=34,hitWindup=.9,
        retryCooldown=24,routeCooldown=12,hearingDistance=630,maxRoomEnemies=12))
    content['manifest']['version']='0.7.0-candidate.1'
    content['manifest']['subtitle']='Hadley’s Hope · Dans le souffle des gaines'
    content['manifest']['counts'].update(maintenanceDucts=len(routes),ductMouths=len(mouths))
    return content
