export function revisarBacklog(historias, requisitos, dependencias) {
  const ids=new Set(historias.map(h=>h.id));
  const sinHistoria=Object.keys(requisitos).filter(r=>!historias.some(h=>h.requisitos.includes(r)));
  const invalidas=historias.flatMap(h=>[...h.requisitos.filter(r=>!Object.hasOwn(requisitos,r)),...(dependencias[h.id] || []).filter(id=>!ids.has(id))]);
  return {duplicados:historias.length-ids.size, sinHistoria, invalidas, sinOrigen:historias.filter(h=>!h.requisitos.length), sinCriterio:historias.filter(h=>!h.criterios.length)};
}
export function intervalo(fin,inicio) {
  function dia(valor){const [d,m]=valor.split('/').map(Number);return Date.UTC(2026,m-1,d)/86400000;}
  return dia(inicio)-dia(fin)-1;
}
export const dependencias={HU01:['HU02'],HU03:['HU01'],HU06:['HU05'],HU07:['HU06'],HU08:['HU05'],HU09:['HU07'],HU10:['HU07'],HU11:['HU02'],HU12:['HU04']};
export function decisionPrioridad(h){
  if(h.epicas[0]==='E08' && h.nombre.includes('blockchain'))return 'Baja';
  if(['E07','E08'].includes(h.epicas[0]) || h.nombre.includes('sellers'))return 'Media';
  return 'Alta';
}
