'use strict';
// Modo Navidad: un único filtro Navidad junto al plan normal.
// El consejo de cada época se conserva completo bajo un desplegable.
(function(){
const LABELS={summer:'Verano',winter:'Invierno',christmas:'Navidad',springAutumn:'Primavera / otoño'};
function normalizeSeason(choice){if(choice.season!=='christmas')choice.season='summer'}
function christmasMode(){
 const nav=document.querySelector('.pilot-seasons');
 if(!nav||!active?.data?.curated)return;
 const doc=active.data.doc,choice=pilotSelection();normalizeSeason(choice);
 const title=nav.querySelector('.filter-group-title');
 nav.replaceChildren();if(title){title.textContent='Época del viaje';nav.append(title)}
 for(const [value,label]of [['summer','Resto del año'],['christmas','Navidad']]){
  const b=document.createElement('button');b.className='chip'+(choice.season===value?' on':'');b.textContent=label;
  b.onclick=()=>{choice.season=value;cityStates.delete(active.id);build();saveCity();render()};nav.append(b);
 }
 // Conserva los consejos de las cuatro épocas dentro del desplegable del día.
 const advice=document.querySelector('.pilot-season-advice');if(advice)advice.remove();
 if(!document.querySelector('.season-advice-all')){
  const det=document.createElement('details');det.className='season-advice-all';
  const sum=document.createElement('summary');sum.textContent='Consejos por época del año';det.append(sum);
  for(const key of ['summer','winter','christmas','springAutumn']){
   const s=doc.seasons[key];if(!s?.advice)continue;
   const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=LABELS[key]+': ';
   p.append(strong,document.createTextNode(s.advice));det.append(p);
  }
  const host=document.querySelector('.pilot-day-details')||document.querySelector('.pilot-controls');
  if(host)host.append(det);
 }
 // Fecha elegida en formato español (el input nativo depende del navegador).
 const controls0=document.querySelector('.pilot-controls');
 if(controls0){for(const small of controls0.querySelectorAll('small')){const m=/^Fecha elegida: (\d{4})-(\d{2})-(\d{2})$/.exec(small.textContent);if(m){const meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];small.textContent='Fecha elegida: '+Number(m[3])+' de '+meses[Number(m[2])-1]+' de '+m[1]}}}
 // Compacta el bloque Navidad: estado del mercado visible; notas y retiradas bajo desplegable.
 for(const box of document.querySelectorAll('.pilot-controls .pilot-event-status')){
  if(box.classList.contains('christmas-pending'))continue;
  const text=box.textContent;
  const strong=box.querySelector('strong');
  if(strong&&box.childNodes.length>2){
   const rest=[...box.childNodes].filter(n=>n!==strong&&!(n.nodeType===1&&n.tagName==='BR')).map(n=>n.textContent).join('').trim();
   if(rest){box.replaceChildren(strong);const det=document.createElement('details');const sum=document.createElement('summary');sum.textContent='Horarios y condiciones';const p=document.createElement('p');p.textContent=rest;det.append(sum,p);box.append(det)}
  }
  if(/^Retirado de la propuesta/.test(text)){const host=document.querySelector('.pilot-day-details');if(host){host.append(box)}}
 }
 // Modo Navidad sin mercadillo verificado todavía: decirlo, no inventarlo.
 if(choice.season==='christmas'&&!doc.events?.length&&!document.querySelector('.christmas-pending')){
  const p=document.createElement('p');p.className='pilot-event-status christmas-pending';
  p.textContent='Mercadillos de Navidad en '+doc.name+': fechas de 2026 pendientes de verificar; no mostramos mercadillos sin confirmar.';
  const controls=document.querySelector('.pilot-controls');if(controls)controls.append(p);
 }
}
const style=document.createElement('style');
style.textContent='.season-advice-all{border:0!important;padding:0!important;margin:10px 0 0!important;background:none!important;box-shadow:none!important}.season-advice-all>summary{min-height:44px;display:flex;align-items:center;font-size:12px;font-weight:600}.season-advice-all p{font-size:12px;line-height:1.5;margin:8px 0 0}.pilot-event-status details{border:0;background:none;padding:0;margin:6px 0 0;box-shadow:none}.pilot-event-status summary{font-size:11px;min-height:32px;display:flex;align-items:center;color:#8a8092}.pilot-event-status details p{font-size:11px;color:#8a8092;margin:2px 0 0;line-height:1.5}';
document.head.append(style);
const prevRender=render;render=function(){prevRender();christmasMode()};
const prevRenderDay=renderDay;renderDay=function(){prevRenderDay();if(active?.data?.curated){const nav=document.querySelector('.pilot-seasons');if(nav&&!nav.querySelector('button'))christmasMode()}};
if(active?.data?.curated)christmasMode();
})();

