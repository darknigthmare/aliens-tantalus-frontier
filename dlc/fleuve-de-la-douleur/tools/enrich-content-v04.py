"""Cumulative v04 metadata. No narrative or room graph replacement."""
def enrich(content):
    m=content['manifest'];m['version']='0.4.0-candidate.1';m['subtitle']='Hadley’s Hope · Le seuil du silence'
    kinds={'escalier','échelle','monte-charge','sas'}
    links=[(r,p) for r in content['rooms'] for p in r['portals'] if r['id']<p['to'] and p['kind'] in kinds]
    m['counts']['animatedConnectors']=len(links)
    m['counts']['liftConnectors']=sum(p['kind']=='monte-charge' for r,p in links)
    m['counts']['listeningThresholds']=m['counts']['links']
    content['passageDoctrine']={'spatialScope':'one adjacent room; no global AI','travel':'timed animated connectors; no free continuous shaft','listen':'1.6 seconds exposed; silence not a safety guarantee','storage':'two locally verified slots; old key kept'}
    pump=next(r for r in content['rooms'] if r['id']=='pump')
    next(o for o in pump['objects'] if o['id']=='cache-pump')['x']=1450
    return content
