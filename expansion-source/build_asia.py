import json
from pathlib import Path
REPO=Path('/tmp/travel-planner-app')
SRC=Path('/tmp/tripio-review-gen5/src')
d=json.load(open(SRC/'review-data.json'))
ALIASES={
 'KZ':['Kazajstán','Kazakhstan'],'KG':['Kirguistán','Kirguizistán','Kyrgyzstan'],
 'TJ':['Tayikistán','Tajikistan'],'TM':['Turkmenistán','Turkmenistan'],
 'UZ':['Uzbekistán','Uzbekistan'],'CN':['China'],'HK':['Hong Kong'],
 'MO':['Macao','Macau'],'KP':['Corea del Norte','North Korea'],
 'JP':['Japón','Japan'],'MN':['Mongolia'],'KR':['Corea del Sur','South Korea'],
 'BN':['Brunéi','Brunei'],'KH':['Camboya','Cambodia'],'ID':['Indonesia'],
 'LA':['Laos'],'MY':['Malasia','Malaysia'],'MM':['Myanmar','Birmania','Burma'],
 'PH':['Filipinas','Philippines'],'SG':['Singapur','Singapore'],
 'TH':['Tailandia','Thailand'],'TL':['Timor-Leste','Timor Oriental','East Timor'],
 'VN':['Vietnam','Viet Nam'],'AF':['Afganistán','Afghanistan'],
 'BD':['Bangladesh','Bangladés'],'BT':['Bután','Bhutan'],'IN':['India'],
 'IR':['Irán','Iran'],'MV':['Maldivas','Maldives'],'NP':['Nepal'],
 'PK':['Pakistán','Pakistan'],'LK':['Sri Lanka'],'AM':['Armenia'],
 'AZ':['Azerbaiyán','Azerbaijan'],'BH':['Bahrein','Bahréin','Bahrain'],
 'CY':['Chipre','Cyprus'],'GE':['Georgia'],'IQ':['Iraq','Irak'],
 'IL':['Israel'],'JO':['Jordania','Jordan'],'KW':['Kuwait'],
 'LB':['Líbano','Lebanon'],'OM':['Omán','Oman'],'QA':['Qatar','Catar'],
 'SA':['Arabia Saudita','Arabia Saudí','Saudi Arabia'],'PS':['Palestina','Palestine'],
 'SY':['Siria','Syria'],'TR':['Turquía','Turkey','Türkiye'],
 'AE':['Emiratos Árabes Unidos','Emiratos','United Arab Emirates','EAU'],
 'YE':['Yemen'],'TW':['Taiwán','Taiwan'],
 'RU-AS':['Rusia asiática','Siberia','Asian Russia'],
}
(REPO/'data/routes').mkdir(exist_ok=True)
countries=[]
for a in d['asia']:
    code=a['code']; path=f"data/routes/{code.lower()}.json"
    if a['status']!='not_recommended':
        json.dump(a['doc'], open(REPO/path,'w'), ensure_ascii=False, indent=1)
    countries.append({'code':code,'name':a['name'],'region':a['region'],
      'status':a['status'],'path':path if a['status']!='not_recommended' else None,
      'stateReason':a.get('stateReason'),'advisoryUrl':a.get('advisoryUrl'),
      'aliases':ALIASES[code]})
idx={'schemaVersion':1,'id':'ASIA','name':'Asia','reviewedAt':'2026-11-03',
 'scope':'Rutas de primera visita por país, revisadas una a una; avisos oficiales sin itinerario cuando el viaje está desaconsejado.',
 'countries':countries}
json.dump(idx, open(REPO/'data/routes/index.json','w'), ensure_ascii=False, indent=1)
print('routes written:', sum(1 for c in countries if c['path']), 'advisories:', sum(1 for c in countries if not c['path']))
