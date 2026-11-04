import json, sys
from pathlib import Path
sys.path.insert(0,'/tmp/tripio-build')
from eu_meta import EU_META
REPO=Path('/tmp/travel-planner-app')
SRC=Path('/tmp/tripio-review-gen5/src')
d=json.load(open(SRC/'review-data.json'))
idx=json.load(open(REPO/'data/pl/index.json'))
errors=[]
byCat={c['catalogId']:c for c in idx['cities']}
for c in d['cities']:
    cid=c['id']; e=byCat.get(cid)
    if not e: errors.append(cid+': missing index entry'); continue
    doc=json.load(open(REPO/f'data/eu/{cid}.json'))
    if doc['id']!=e['catalogId'] or doc['country']!=e['countryCode']: errors.append(cid+': id/country mismatch')
    for k in ('1','2','3'):
        if k not in doc['plans']: errors.append(cid+': missing plan '+k); continue
        ndays=len(doc['plans'][k]['days'])
        if ndays!=int(k): errors.append(f'{cid}: plan {k} has {ndays} days')
        for day in doc['plans'][k]['days']:
            for sid in day['stopIds']:
                if not any(s['id']==sid for s in doc['stops']): errors.append(f'{cid}: plan {k} unknown stop {sid}')
    srcids={s.get('id') for s in doc['sources']}
    for s in doc['stops']:
        for x in s.get('sourceIds',[]):
            if x not in srcids: errors.append(f'{cid}: stop {s["id"]} unknown source {x}')
        if s.get('photo') and not (REPO/s['photo']['img']).exists(): errors.append(f'{cid}: missing photo {s["photo"]["img"]}')
    ex=json.load(open(REPO/f'data/eu/{cid}-extras.json'))
    if ex['cityId']!=cid: errors.append(cid+': extras cityId')
    for coll in ('food','activities'):
        for x in ex[coll]:
            if x.get('photo') and not (REPO/x['photo']['img']).exists(): errors.append(f'{cid}: missing extras photo {x["photo"]["img"]}')
# Asia
ridx=json.load(open(REPO/'data/routes/index.json'))
if len(ridx['countries'])!=52: errors.append('asia index count')
for c in ridx['countries']:
    if c['status']=='not_recommended':
        if not c.get('stateReason') or not c.get('advisoryUrl'): errors.append('asia NR incomplete: '+c['code'])
        continue
    doc=json.load(open(REPO/c['path']))
    r=doc['routes'][0]
    if not r['days']: errors.append('asia empty route: '+c['code'])
    if doc.get('photo') and not (REPO/doc['photo']['img']).exists(): errors.append('asia missing photo: '+c['code'])
    for i,day in enumerate(r['days'],1):
        if day['day']!=i: errors.append(f"asia {c['code']}: day numbering {day['day']}!={i}")
print('ERRORS:', len(errors))
for e in errors[:20]: print(' -', e)
print('asia countries:', len(ridx['countries']))
