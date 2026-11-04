import json, re, shutil, sys
sys.path.insert(0,'/tmp/tripio-build')
from eu_meta import EU_META
from pathlib import Path

REPO=Path('/tmp/travel-planner-app')
SRC=Path('/tmp/tripio-review-gen5/src')
REV='2026-11-03-expansion-eu2-v1'
COORD_NOTICE='Puntos aproximados para situar lugares o zonas. No equivalen a entradas accesibles ni a rutas peatonales verificadas.'
d=json.load(open(SRC/'review-data.json'))

# images.ts mapping assets/... -> pN
src=(SRC/'images.ts').read_text()
mapping=dict(re.findall(r'"(assets/[^"]+)":p(\d+)', src))
mapping={k.replace('\\u00eda','ía'):v for k,v in mapping.items()}

idx=json.load(open(REPO/'data/pl/index.json'))
existing_ids={c['id'] for c in idx['cities']}
existing_cat={c['catalogId'] for c in idx['cities']}

added=[]
for c in d['cities']:
    cid=c['id']
    cc,country,local,aliases,caliases=EU_META[cid]
    if cid in existing_cat: raise SystemExit('catalogId collision: '+cid)
    doc={
      'schemaVersion':1,'country':cc,'id':cid,'name':c['name'],'localName':local,
      'selectionReason':'Segunda lista europea confirmada por el usuario el 2 nov 2026.',
      'reviewedAt':'2026-11-03','status':'editorially-reviewed-pilot',
      'planningAssumptions':c['scope'] or 'Primera visita de 1 a 3 días, sin fechas ni reservas.',
      'stops':c['stops'],'plans':c['plans'],
      'seasons':{},'events':[],'cautions':c['cautions'],'excludedOrOptional':[],
      'sources':c['sources'],'coordinateNotice':COORD_NOTICE,
      'seasonalVariants':{},'seasonalPlans':{},'excursions':[],
      'catalogRevision':REV,
    }
    json.dump(doc, open(REPO/f'data/eu/{cid}.json','w'), ensure_ascii=False, indent=1)
    extras={'schemaVersion':1,'cityId':cid,'reviewedAt':'2026-11-03',
      'scope':'Ideas revisadas para comer y hacer algo distinto; no son reservas ni sesiones confirmadas.',
      'catalogRevision':REV,'food':c['food'],'activities':c['activities']}
    json.dump(extras, open(REPO/f'data/eu/{cid}-extras.json','w'), ensure_ascii=False, indent=1)
    lats=[s['coordinates']['lat'] for s in c['stops'] if s.get('coordinates')]
    lons=[s['coordinates']['lon'] for s in c['stops'] if s.get('coordinates')]
    entry={'id':cc.lower()+'-'+cid,'name':c['name'],'localName':local,
      'latitude':round(sum(lats)/len(lats),4),'longitude':round(sum(lons)/len(lons),4),
      'country':country,'countryCode':cc,'countryAliases':caliases,
      'aliases':list(dict.fromkeys(aliases)),'path':f'data/eu/{cid}.json',
      'extrasPath':f'data/eu/{cid}-extras.json','catalogId':cid,'days':[1,2,3],'curated':True}
    if entry['id'] in existing_ids: raise SystemExit('id collision: '+entry['id'])
    idx['cities'].append(entry); added.append(entry['id'])
idx['reviewedAt']='2026-11-04'
json.dump(idx, open(REPO/'data/pl/index.json','w'), ensure_ascii=False, indent=1)
print('index cities:', len(idx['cities']), 'added:', len(added))

# photos
copied=0; missing=[]
for path,pn in mapping.items():
    src=SRC/f'photos/p{pn}.jpg'
    dst=REPO/path
    if not src.exists(): missing.append(path); continue
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src,dst); copied+=1
print('photos copied:', copied, 'missing:', missing)
