'use strict';
// Rutas editoriales por país para Asia (revisión 3 nov 2026).
// Contenido de referencia: no crea un planning editable ni toca los viajes guardados.
(function(){
let asiaIndexPromise=null;const asiaDocs=new Map();
function asiaIndex(){return asiaIndexPromise||(asiaIndexPromise=json('data/routes/index.json'))}
async function asiaMatch(query){
 const q=normalize(query);if(q.length<3)return null;
 let idx;try{idx=await asiaIndex()}catch{return null}
 const hit=(idx.countries||[]).find(c=>(c.aliases||[]).some(a=>normalize(a)===q));
 if(!hit)return null;
 if(asiaDocs.has(hit.code))return asiaDocs.get(hit.code);
 try{const doc=hit.path?await json(hit.path):null;const entry={...hit,doc};asiaDocs.set(hit.code,entry);return entry}catch{return null}
}
const asiaStyle=document.createElement('style');
asiaStyle.textContent=`.asia-route{margin-top:16px}.asia-route h2{font-size:23px;margin:0 0 6px}.asia-facts{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.asia-facts span{background:#f7f4f8;border-radius:20px;padding:8px 12px;font-size:13px}.asia-photo{width:100%;border-radius:12px;margin:10px 0}.asia-credit{font-size:11px;color:#746a79;margin:0 0 10px}.asia-notice{font-size:13px;line-height:1.5;padding:10px 12px;border-left:3px solid #ea0558;margin:10px 0;background:#fdf2f8;border-radius:0 8px 8px 0}.asia-day{border-top:1px solid #eee4ec;padding:4px 0}.asia-day summary{min-height:44px;display:flex;align-items:center;font-size:14px;font-weight:600}.asia-day p,.asia-day li{font-size:13px;line-height:1.5}.asia-day ul{margin:6px 0;padding-left:20px}.asia-links a{color:#d4004a;font-size:13px;min-height:44px;display:inline-flex;align-items:center;margin-right:14px}.asia-scope{font-size:14px;line-height:1.55}`;
document.head.append(asiaStyle);
function link(url,label){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=(label||url)+' ↗';return a}
function renderAsia(entry){
 request++;active=null;$('cityConfig').hidden=true;$('planZone').hidden=true;
 $('results').innerHTML='';$('loadStatus').textContent='';
 const root=document.createElement('section');root.className='asia-route card';
 const h=document.createElement('h2');h.textContent=entry.name;root.append(h);
 const region=document.createElement('p');region.className='hint';region.textContent=entry.region+' · revisión 3 nov 2026 · ruta de referencia, sin reservas';root.append(region);
 if(entry.status==='not_recommended'){
  const n=document.createElement('p');n.className='asia-notice';n.textContent='Aviso oficial, sin itinerario: '+(entry.stateReason||'El viaje está desaconsejado.');root.append(n);
  if(entry.advisoryUrl){const links=document.createElement('p');links.className='asia-links';links.append(link(entry.advisoryUrl,'Recomendación oficial de viaje'));root.append(links)}
  $('searchStatus').textContent=entry.name+' · aviso oficial, sin ruta propuesta';
 }else{
  const doc=entry.doc,r=(doc.routes||[])[0];
  const facts=document.createElement('div');facts.className='asia-facts';
  const nights=r.days.filter(x=>x.overnight).length;
  const bases=[...new Set(r.days.map(x=>x.overnight).filter(Boolean))];
  for(const t of [r.title,r.days.length+' días / '+nights+' noches','Bases: '+bases.join(' → ')]){const s=document.createElement('span');s.textContent=t;facts.append(s)}
  root.append(facts);
  if(doc.photo){const img=document.createElement('img');img.className='asia-photo';img.src=doc.photo.img;img.alt=doc.photo.name;root.append(img);
   const credit=document.createElement('p');credit.className='asia-credit';credit.append(document.createTextNode(doc.photo.name+' · '+doc.photo.author+' · '+doc.photo.license+'. Foto de archivo, no estado actual de toda la ruta. '));if(doc.photo.source)credit.append(link(doc.photo.source,'Original'));root.append(credit)}
  if(r.scope){const p=document.createElement('p');p.className='asia-scope';p.textContent=r.scope;root.append(p)}
  if(r.pace||r.assumptions){const n=document.createElement('p');n.className='asia-notice';n.textContent=[r.pace,r.assumptions].filter(Boolean).join(' ');root.append(n)}
  if(doc.advisory){const n=document.createElement('p');n.className='asia-notice';n.textContent='Seguridad y acceso: '+doc.advisory.text;root.append(n);if(doc.advisory.url){const links=document.createElement('p');links.className='asia-links';links.append(link(doc.advisory.url,'Aviso oficial'));root.append(links)}}
  for(const x of r.days){const det=document.createElement('details');det.className='asia-day';const sum=document.createElement('summary');sum.textContent='Día '+x.day+' · '+x.title;det.append(sum);
   if(x.transfer){const p=document.createElement('p');const b=document.createElement('b');b.textContent='Traslado: ';p.append(b,document.createTextNode(x.transfer));det.append(p)}
   if(x.stops?.length){const ul=document.createElement('ul');for(const s of x.stops){const li=document.createElement('li');li.textContent=s;ul.append(li)}det.append(ul)}
   const p=document.createElement('p');const b=document.createElement('b');b.textContent='Noche: ';p.append(b,document.createTextNode(x.overnight||'sin noche prevista, salida'));det.append(p);root.append(det)}
  if(doc.verificationLimits?.length){const det=document.createElement('details');det.className='asia-day';const sum=document.createElement('summary');sum.textContent='Comprobaciones pendientes antes de fijar fechas';det.append(sum);const ul=document.createElement('ul');for(const s of doc.verificationLimits){const li=document.createElement('li');li.textContent=s;ul.append(li)}det.append(ul);root.append(det)}
  if(r.sources?.length){const det=document.createElement('details');det.className='asia-day';const sum=document.createElement('summary');sum.textContent='Fuentes de la ruta';det.append(sum);const links=document.createElement('p');links.className='asia-links';for(const u of r.sources)links.append(link(u));det.append(links);root.append(det)}
  const note=document.createElement('p');note.className='hint';note.textContent='Ruta de referencia para orientar el viaje; no crea un planning editable ni cambia tus viajes guardados.';root.append(note);
  $('searchStatus').textContent=entry.name+' · ruta editorial de '+r.days.length+' días';
 }
 $('results').append(root);
}
const asiaPrevSubmit=$('searchForm').onsubmit;
$('searchForm').onsubmit=async e=>{
 e.preventDefault();
 const query=$('citySearch').value.trim();
 if(query.length>=3){
  const btn=$('searchForm').querySelector('button');btn.disabled=true;btn.textContent='Buscando…';
  let hit=null;try{hit=await asiaMatch(query)}catch{}
  if(hit){renderAsia(hit);btn.disabled=false;btn.textContent='Buscar';return}
  btn.disabled=false;btn.textContent='Buscar';
 }
 return asiaPrevSubmit(e);
};
})();
