const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:900}});let errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('http://tripio.test/**',async r=>{let x=new URL(r.request().url()).pathname;if(x==='/')x='/index.html';const f=path.join(path.resolve(__dirname,'..'),x);await r.fulfill(fs.existsSync(f)?{body:fs.readFileSync(f),contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.json')?'application/json':'image/jpeg'}:{status:404,body:''})});await p.goto('http://tripio.test/');
// Warsaw: market event exists
await p.evaluate(async()=>{const c=(await searchCities('Varsovia')).cities[0];c.data=await loadCity(c);cities.clear();cityStates.clear();cityDays.clear();cities.set(c.id,c);cityDays.set(c.id,2);restoreCity(c);build();render();$('planZone').hidden=false});
let labels=await p.evaluate(()=>[...document.querySelectorAll('.pilot-seasons button')].map(b=>b.textContent));
assert.deepEqual(labels,['Resto del año','Navidad'],'two-mode filter');const title=await p.evaluate(()=>$('planTitle').textContent);assert(title.includes('Varsovia')&&title.includes('2 días'),'planTitle: '+title);console.log('two-mode filter + title PASS:',title);
await p.evaluate(()=>{[...document.querySelectorAll('.pilot-seasons button')][1].click()});
await p.waitForTimeout(50);
let st=await p.evaluate(()=>({season:pilotSelection().season,events:document.querySelectorAll('.pilot-event-status').length,advice:document.querySelectorAll('.season-advice-all p').length,summary:(document.querySelector('.day-summary')||{}).textContent||''}));
assert.equal(st.season,'christmas');assert(st.events>=1,'market event visible in Navidad');assert.equal(st.advice,4,'all four seasonal advices preserved');
const dateLine=await p.evaluate(()=>[...document.querySelectorAll('.pilot-controls small')].map(x=>x.textContent).find(t=>t.startsWith('Fecha elegida'))||'');
assert(/Fecha elegida: 25 de diciembre de 2026/.test(dateLine),'spanish date: '+dateLine);
const compact=await p.evaluate(()=>{const b=document.querySelector('.pilot-controls .pilot-event-status');return {hasDetails:!!b?.querySelector('details'),inDetails:(b?.querySelector('details p')?.textContent||'').includes('Horarios festivos'),head:(b?.querySelector('strong')?.textContent||'')}});
assert(compact.hasDetails&&compact.inDetails&&/Jarmark/.test(compact.head),'compacted market block '+JSON.stringify(compact));console.log('spanish date + compact PASS:',dateLine);
assert(st.summary.includes('paradas')&&st.summary.includes('km')&&st.summary.includes('línea recta'),'summary band with explicit straight-line label: '+st.summary);console.log('navidad mode + advice + summary PASS:',st.summary.slice(0,90));
// back to normal hides events
await p.evaluate(()=>{[...document.querySelectorAll('.pilot-seasons button')][0].click()});await p.waitForTimeout(50);
assert.equal(await p.evaluate(()=>document.querySelectorAll('.pilot-event-status').length),0,'normal mode hides events');console.log('normal mode PASS');
// Chania: no market data yet -> honest pending note, plans still non-empty
await p.evaluate(async()=>{const c=(await searchCities('Chania')).cities[0];active={...c,data:await loadCity(c)};days=3;build();render();pilotSelection().season='christmas';build();render()});
st=await p.evaluate(()=>({pending:!!document.querySelector('.christmas-pending'),lens:plan.map(x=>x.length),summary:(document.querySelector('.day-summary')||{}).textContent||''}));
assert(st.pending,'pending note without invented market');assert(st.lens.every(n=>n>0));assert(st.summary.includes('de visitas'),'summary shows visit hours');console.log('honest pending + hours PASS:',st.summary.slice(0,110));
// excursion day summary uses excursion pacing, no invented numbers
await p.evaluate(async()=>{const c=(await searchCities('Londres')).cities[0];active={...c,data:await loadCity(c)};days=3;build();render();day=0;setExcursionChoice(0,'windsor');build();render()});
st=await p.evaluate(()=>(document.querySelector('.day-summary')||{}).textContent||'');
assert(/excursión/i.test(st)&&!st.includes('km entre paradas'),'excursion summary: '+st);console.log('excursion summary PASS');
assert.equal(errors.length,0,'JS errors');await b.close();console.log('ALL CHRISTMAS-MODE TESTS PASS')})().catch(e=>{console.error(e);process.exit(1)});
