"""Original gameplay specifications, not official vehicle specifications."""
def enrich(data):
    data['manifest']['version']='0.8.0-candidate.1'
    data['manifest']['subtitle']='Hadley’s Hope · La piste des prospecteurs'
    data['mobility']={
      'revision':8,
      'rover':{'id':'prospector-01','name':'Tracteur de prospection 01','room':'road','x':660,'z':0.79,'width':304,'depth':0.1,'height':130},
      'rooms':['road','plateau'],
      'links':[['road','plateau']],
      'rules':{'maxForward':520,'maxReverse':220,'acceleration':300,'braking':850,'rollingResistance':135,'steerSpeed':150,'boardingTime':1.5,'exitTime':1.1,'repairTime':3.2,'chargeTime':2.8,'hornTime':1.2,'hornCooldown':5,'minimumBattery':0.5},
      'stations':[
        {'id':'service-road','room':'road','label':'Borne du périmètre','x':900,'z':0.38,'radius':290,'repairKits':1,'charges':1},
        {'id':'service-plateau','room':'plateau','label':'Dépôt de prospection','x':2430,'z':0.38,'radius':290,'repairKits':1,'charges':1}
      ],
      'surfaces':[
        {'id':'road-gravel','room':'road','label':'GRAVIER MEUBLE','x':1940,'w':350,'minZ':0.25,'maxZ':0.9,'speedLimit':260},
        {'id':'plateau-ruts','room':'plateau','label':'ORNIÈRES','x':1530,'w':290,'minZ':0.25,'maxZ':0.9,'speedLimit':225}
      ]
    }
    data['manifest']['counts'].update({'driveableVehicles':1,'drivingRooms':2,'vehicleServiceStations':2,'drivingSurfaces':2})
    # Remove false stationary copies of the same vehicle; replace only vehicle-like props.
    replaced=[]
    for r in data['rooms']:
        if r['id']=='plateau':r['landmark']='Jalons de prospection, dépôt de service et accès à pied vers l’épave'
        for p in r['props']:
            if r['id'] in ['road','plateau','garage'] and p.get('kind',p.get('type')) in ['tractor','rover','vehicle']:
                kind='tools' if r['id']=='garage' else 'rock'
                p['kind']=kind;p['type']=kind;p['purpose']='Matériel de maintenance rangé' if kind=='tools' else 'Affleurement rocheux hors trajectoire';replaced.append(p.get('id'))
    data['mobility']['replacedStaticCopies']=replaced
    return data
