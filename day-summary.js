'use strict';
// Resumen del día: paradas, distancia y horas con cobertura explícita.
// No convierte líneas rectas en kilómetros a pie ni suma un total de jornada.
(function(){
const style=document.createElement('style');
style.textContent=`.day-summary{font-size:13px;line-height:1.55;background:#fdf2f8;border:1px solid #f3d7e6;border-radius:12px;padding:10px 14px;margin:0 0 14px;color:#5f5567}.day-summary strong{color:#302936;font-weight:750}.day-summary details{border:0;background:none;padding:0;margin:6px 0 0;box-shadow:none}.day-summary summary{font-size:11px;min-height:32px;display:flex;align-items:center;color:#8a8092}.day-summary details p{font-size:11px;color:#8a8092;margin:2px 0 0}`;
document.head.append(style);
const round5=x=>Math.round(x*2)/2;
const es=x=>String(x).replace('.',',');
const horas=min=>es(round5(min/60))+' h';
function summaryData(){
 if(!active?.data||!plan[day]?.length)return null;
 const ex=typeof selectedExcursion==='function'&&typeof currentExcursionSlot==='function'?selectedExcursion(currentExcursionSlot()):null;
 if(ex&&plan[day].length===1&&plan[day][0].kind==='excursion')return {excursion:ex};
 const stops=plan[day];
 const geo=stops.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
 let straight=0;for(let i=1;i<geo.length;i++)straight+=km(geo[i-1],geo[i]);
 const withMinutes=stops.filter(p=>Number.isFinite(p.minutes));
 const visitMin=withMinutes.reduce((s,p)=>s+p.minutes,0);
 return {count:stops.length,straightKm:straight,visitMin,visitCoverage:withMinutes.length,geoCoverage:geo.length,curated:!!active.data.curated};
}
function renderSummary(){
 document.querySelectorAll('.day-summary').forEach(x=>x.remove());
 const d=summaryData();if(!d)return;
 const box=document.createElement('div');box.className='day-summary';
 const head=document.createElement('div');
 if(d.excursion){
  head.innerHTML='<strong>Resumen del día:</strong> jornada de excursión'+(d.excursion.pacing?' · '+esc(d.excursion.pacing):'');
  box.append(head);
 }else{
  let html='<strong>Resumen del día:</strong> '+d.count+(d.count===1?' parada':' paradas');
  if(d.geoCoverage>1){const m=Math.round(d.straightKm*1000/50)*50;html+=' · <strong>≈ '+(d.straightKm<0.5?m+' m':es(round5(d.straightKm))+' km')+'</strong> entre paradas (línea recta)'+(d.geoCoverage<d.count?' · '+d.geoCoverage+' de '+d.count+' paradas con punto':'')}
  if(d.visitMin>0)html+=' · <strong>≈ '+horas(d.visitMin)+'</strong> de visitas';
  head.innerHTML=html;box.append(head);
  const det=document.createElement('details');const sum=document.createElement('summary');sum.textContent='Cómo se estima';det.append(sum);
  const p=document.createElement('p');
  let t='Los kilómetros (o metros) son la distancia en línea recta entre los puntos del mapa: la caminata real es mayor y la ruta exacta está en el enlace de Google Maps del día.';if(d.geoCoverage<d.count)t+=' Sólo '+d.geoCoverage+' de '+d.count+' paradas tienen punto en el mapa en esta revisión.';
  if(d.visitMin>0)t+=' Las horas suman los tiempos orientativos de cada ficha'+(d.visitCoverage<d.count?' ('+d.visitCoverage+' de '+d.count+' paradas tienen tiempo estimado)':'')+'; no incluyen desplazamientos, comidas ni pausas.';
  else t+=' Esta búsqueda no tiene tiempos editoriales por parada.';
  p.textContent=t;det.append(p);box.append(det);
 }
 const body=$('dayBody');if(body)body.insertBefore(box,body.firstChild);
}
const prevRenderDay=renderDay;renderDay=function(){prevRenderDay();renderSummary()};
const prevRender=render;render=function(){prevRender();renderSummary()};
if(active?.data)renderSummary();
})();
