const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:900}});let errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('http://tripio.test/**',async r=>{let x=new URL(r.request().url()).pathname;if(x==='/')x='/index.html';const f=path.join(path.resolve(__dirname,'..'),decodeURIComponent(x));await r.fulfill(fs.existsSync(f)?{body:fs.readFileSync(f),contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.json')?'application/json':f.endsWith('.css')?'text/css':'image/jpeg'}:{status:404,body:''})});await p.goto('http://tripio.test/');
// 1. All 45 new destinations: search, load, build 1/2/3 days, render
const cities=await p.evaluate(async()=>{const idx=await (await fetch('data/pl/index.json')).json();return idx.cities.filter(c=>c.path&&c.path.startsWith('data/eu/')&&!['amsterdam','athens','barcelona','berlin','bologna','bruges','brussels','budapest','chania','copenhagen','corfu','delft','dublin','dubrovnik','florence','genoa','ghent','hague','lisbon','london','milan','milos','munich','mykonos','naples','naxos','palermo','paris','plitvice','porto','prague','rhodes','rome','santorini','split','stockholm','tallinn','thessaloniki','turin','venice','verona','vienna','zadar','zagreb','zakynthos'].includes(c.catalogId)).map(c=>({name:c.name,aliases:c.aliases}))});
assert.equal(cities.length,45,'45 new destinations');
for(const c of cities){const r=await p.evaluate(async(name)=>{try{const res=await searchCities(name);const c=res.cities.find(x=>x.curated);if(!c)return name+': not found curated';c.data=await loadCity(c);cities.clear();cityStates.clear();cityDays.clear();cities.set(c.id,c);cityDays.set(c.id,3);restoreCity(c);for(const n of [1,2,3]){days=n;cityStates.delete(c.id);build();render();if(plan.length!==n)return name+': plan length '+plan.length+'!='+n;if(plan.some(d=>!d.length))return name+': empty day for '+n;}return null}catch(e){return name+': '+e.message}},c.name);if(r){console.log('FAIL',r);errors.push(r)}}
console.log('45 new destinations load/build/render PASS');
// 2. Persistence round-trip on a new city, mixed with an old one
await p.evaluate(async()=>{cities.clear();cityStates.clear();cityDays.clear();for(const name of ['Londres','Sevilla']){const c=(await searchCities(name)).cities.find(x=>x.curated);c.data=await loadCity(c);cities.set(c.id,c);cityDays.set(c.id,3);restoreCity(c);build();render();saveCity()}restoreCity([...cities.values()][1]);render();day=1;plan[1].reverse();plan[1].pop();saveCity();persistPilot()});
const before=await p.evaluate(()=>plan[1].map(x=>x.localId));
await p.reload();await p.waitForTimeout(200);
const restored=await p.evaluate(()=>({names:[...cities.values()].map(x=>x.name),sevillaDay1:cityStates.get([...cities.values()].find(c=>c.name==='Sevilla').id).plan[1].map(x=>x.localId)}));
assert.deepEqual(restored.names,['Londres','Sevilla']);assert.deepEqual(restored.sevillaDay1,before);
console.log('new-city persistence + order/removal + multicity PASS');
// 3. Season UI on a seasonless new city
const seasonUI=await p.evaluate(async()=>{const c=(await searchCities('Sevilla')).cities.find(x=>x.curated);c.data=await loadCity(c);active=c;days=3;build();render();const chips=[...document.querySelectorAll('.pilot-seasons button')].map(b=>b.textContent);return chips});
assert(seasonUI.includes('Resto del año')&&seasonUI.includes('Navidad'),'season chips');
await p.evaluate(()=>{[...document.querySelectorAll('.pilot-seasons button')].find(b=>b.textContent==='Navidad').click()});
await p.waitForTimeout(100);
const pending=await p.evaluate(()=>document.querySelector('.christmas-pending')?.textContent||'');
assert(pending.includes('pendientes de verificar'),'honest christmas pending');
console.log('seasonless city: Normal/Navidad chips + honest pending PASS');
// 4. Extras (food) for a new city
await p.evaluate(async()=>{const c=(await searchCities('Sevilla')).cities.find(x=>x.curated);c.data=await loadCity(c);active=c;days=3;build();render();enrichMode='food';enrichRender();await enrichLoad()});
await p.waitForTimeout(200);
const food=await p.evaluate(()=>{enrichMode='food';enrichRender();return document.querySelectorAll('.enrich-card').length});
assert(food>=1,'food cards');console.log('extras food render PASS');
// 5. Asia routes and advisories
await p.evaluate(()=>{$('citySearch').value='Japón';$('searchForm').dispatchEvent(new Event('submit',{cancelable:true}))});
await p.waitForTimeout(400);
const jp=await p.evaluate(()=>({title:document.querySelector('.asia-route h2')?.textContent,days:document.querySelectorAll('.asia-route .asia-day').length,status:$('searchStatus').textContent}));
assert.equal(jp.title,'Japón');assert(jp.days>=15,'JP days '+jp.days);console.log('asia route JP PASS:',jp.status);
await p.evaluate(()=>{$('citySearch').value='Corea del Norte';$('searchForm').dispatchEvent(new Event('submit',{cancelable:true}))});
await p.waitForTimeout(400);
const kp=await p.evaluate(()=>({notice:document.querySelector('.asia-notice')?.textContent||'',days:document.querySelectorAll('.asia-route .asia-day').length,link:document.querySelector('.asia-links a')?.href||''}));
assert(kp.notice.includes('Aviso oficial')&&kp.days===0&&kp.link.includes('exteriores.gob.es'),'KP advisory');
console.log('asia advisory KP PASS');
// 6. Asia view must not touch saved plans
const saved=await p.evaluate(()=>localStorage.getItem('tripio-poland-pilot-v1'));
await p.evaluate(()=>{$('citySearch').value='Vietnam';$('searchForm').dispatchEvent(new Event('submit',{cancelable:true}))});
await p.waitForTimeout(400);
assert.equal(await p.evaluate(()=>localStorage.getItem('tripio-poland-pilot-v1')),saved,'saved plans untouched');
const vn=await p.evaluate(()=>document.querySelectorAll('.asia-route .asia-day').length);
assert(vn>=12,'VN days');console.log('asia read-only, saved plans untouched PASS');
assert.deepEqual(errors,[],'page errors: '+errors.join(' | '));
await b.close();console.log('ALL EXPANSION TESTS PASS')})().catch(e=>{console.error(e);process.exit(1)});
