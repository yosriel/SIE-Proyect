import Cuaderno, { Acta, Tabla } from './Cuaderno.jsx';
import { revisarBacklog, dependencias, intervalo, decisionPrioridad } from './plan.js';
import casos from './casos1.json';
import base from './backlog.json';

const {historias, requisitos} = base;
const revision=revisarBacklog(historias,requisitos,dependencias);
const fechas = [['18/08','31/08',1],['01/09','14/09',1],['15/09','28/09',2],['29/09','12/10',2],['13/10','26/10','2 y 3'],['27/10','09/11',3]];
const charter = [
  ['Objetivo','Integrar la información entre tiendas, web y marketplace para coordinar los procesos omnicanal.'],
  ['Alcance','Retiro, inventario, devoluciones, sellers, arquitectura, integración y gobierno de datos.'],
  ['Exclusiones','Plataformas internas de Falabella y datos reales de clientes.'],
  ['Interesados','Patrocinador académico, Product Owner, equipo Scrum y responsables operativos.'],
  ['Hitos','El Charter indica siete sprints. El backlog asigna historias hasta el sexto.'],
  ['Recursos','Equipo del curso, información pública y herramientas de modelado y prototipado.'],
  ['Criterios de éxito','Validación de entregables, cobertura de las tres unidades y propuesta priorizada por valor y riesgo.']
];
const interesados = [
  ['Patrocinador','Alto','Alto','Validar alcance e hitos en la revisión','Product Owner'],
  ['Product Owner','Alto','Alto','Priorizar y revisar entregables','Scrum Master'],
  ['Equipo de desarrollo','Bajo','Alto','Revisar dependencias en la reunión diaria','Scrum Master'],
  ['Personal de tienda','Bajo','Alto','Recorrer retiros, movimientos y devoluciones','Product Owner'],
  ['Vendedores','Bajo','Alto','Revisar afiliación y publicación','Equipo de desarrollo']
];
const documentos = ['Project Charter','Matriz de interesados','Alcance y requerimientos','Product Backlog','Priorización y estimación','Cronograma y roles'];
const puntos = lista => lista.reduce((s,h)=>s+h.puntos,0);
const porSprint = fechas.map((_,i)=>historias.filter(h=>h.sprint===i+1));
const criterio = h => h.id==='HU12' ? 'Exploración de trazabilidad' : ['HU04','HU10','HU11'].includes(h.id) ? 'Incorporación de sellers o viabilidad de un piloto' : 'Operación esencial o base de arquitectura, datos y gobierno';
function contenido(n) {
  switch(n) {
    case 1:return <><p>Resumen del Charter del APF2, sección 11. El informe sitúa el trabajo entre el 18 y el 31 de agosto de 2026. La fecha individual de aprobación requiere el documento firmado.</p><Tabla columnas={['Elemento','Contenido de la planificación']} filas={charter}/>{charter.map(([elemento],i)=><Acta key={elemento} id={"CP-S1-01-"+i} titulo={elemento} decisiones={["Pendiente","Completo y fechado","Defecto de severidad 2"]}/>)}</>;
    case 2:return <><p>Matriz de trabajo para la revisión con el equipo. Clasificación propuesta para este prototipo.</p><Tabla columnas={['Interesado','Poder','Interés','Estrategia','Responsable']} filas={interesados}/></>;
    case 3:return <><p>Correspondencia funcional propuesta para revisar el origen de cada historia. Requisitos sin historia: {revision.sinHistoria.length}. Historias sin origen: {revision.sinOrigen.length}.</p><Tabla columnas={['Requisito','Necesidad','Historias']} filas={Object.entries(requisitos).map(([r,d])=>[r,d,historias.filter(h=>h.requisitos.includes(r)).map(h=>h.id).join(', ') || 'Sin asignar'])}/></>;
    case 4:return <><p>Criterio de revisión propuesto: alta para capacidades esenciales, media para incorporación o pilotos, baja para exploración diferible. La columna de prioridad reproduce el backlog.</p><Tabla columnas={['Historia','Prioridad declarada','Prioridad calculada','Justificación de revisión']} filas={historias.map(h=>[h.id+' · '+h.nombre,h.prioridad,decisionPrioridad(h),criterio(h)])}/></>;
    case 5:return <><p>Observación O2 abierta: el Charter anuncia siete sprints y el cronograma detallado termina en el sexto. Falta conciliar el cierre con el patrocinador.</p><Tabla columnas={['Sprint','Inicio (2026)','Fin (2026)','Días de hueco (+) o solape (−)']} filas={fechas.map(([inicio,fin],i)=>[i+1,inicio,fin,fechas[i+1] ? intervalo(fin,fechas[i+1][0]) : 'Fin del cronograma'])}/></>;
    case 6:return <><p>Registra la decisión del patrocinador sobre cada documento y adjunta el acta firmada. Los seis registros comienzan pendientes.</p>{documentos.map((d,i)=><Acta key={d} id={'CP-S1-06-doc'+(i+1)} titulo={d} firma decisiones={['Pendiente','Aprobado','Aprobado con observaciones','Rechazado']}/>)}</>;
    case 7:return <><p>En HU02 y HU04 el backlog cita E01/E03. Para esta revisión se usa E01 como principal y E03 como secundaria.</p><Tabla columnas={['Épica principal','Historias','Cobertura']} filas={Array.from({length:8},(_,i)=>{const ep='E0'+(i+1), lista=historias.filter(h=>h.epicas[0]===ep);return [ep,lista.map(h=>h.id).join(', '),lista.length];})}/></>;
    case 8:return <><p>Correspondencia temática propuesta según el APF2: procesos (1), arquitectura, datos y seguridad (2), gobierno y tecnologías emergentes (3).</p><Tabla columnas={['Sprint','Unidad','Historias asignadas']} filas={porSprint.map((hs,i)=>[i+1,fechas[i][2],hs.map(h=>h.id).join(', ') || 'Planificación'])}/></>;
    case 9:return <><p>{historias.length} historias · {puntos(historias)} puntos calculados · {puntos(historias)-94} de diferencia frente a los 94 declarados.</p><Tabla columnas={['Sprint','Estimaciones por historia','Subtotal']} filas={porSprint.map((hs,i)=>[i+1,hs.map(h=>h.id+' ('+h.puntos+')').join(', ') || 'Sin historias',puntos(hs)])}/></>;
    case 10:return <><p>{new Set(historias.map(h=>h.id)).size} identificadores únicos. {historias.filter(h=>!h.criterios.length).length} historias sin criterios. {revision.invalidas.length} referencias sin destino en el mapa de trabajo propuesto. Fuente de los criterios: APF2, secciones 12 y 14.</p>{historias.map(h=><details key={h.id}><summary>{h.id} · {h.nombre}</summary><p>Sprint {h.sprint} · {h.requisitos.join(', ')} · Dependencias propuestas: {dependencias[h.id]?.join(', ') || 'Ninguna'}</p><ul>{h.criterios.map(c=><li key={c}>{c}</li>)}</ul></details>)}</>;
  }
}
export default function PlanDelEquipo(){
  return <Cuaderno titulo="Revisar la planificación" casos={casos} actas={[6]}>{contenido}</Cuaderno>;
}
