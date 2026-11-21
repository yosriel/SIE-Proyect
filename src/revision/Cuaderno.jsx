import { useEffect, useState } from 'react';
import './cuaderno.css';

function abrir() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('omni-si-revisiones:' + new URL('.', location.href).pathname, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('actas');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function registro(id, valor) {
  const db = await abrir();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('actas', valor ? 'readwrite' : 'readonly');
      const store = tx.objectStore('actas');
      const req = valor ? store.put(valor, id) : store.get(id);
      tx.oncomplete = () => resolve(req.result);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Acta({ id, titulo = 'Registrar resultado', decisiones = ['Conforme', 'Con observaciones', 'Pendiente'], firma = false }) {
  const [dato, poner] = useState(null);
  const [aviso, avisar] = useState('');
  const [listo, habilitar] = useState(false);
  useEffect(() => {
    let activo = true;
    registro(id).then(v => { if (activo) { poner(v || null); habilitar(true); } })
      .catch(() => { if (activo) avisar('No se pudo leer el registro local.'); });
    return () => { activo = false; };
  }, [id]);
  async function guardar(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const adjunto = f.get('archivo');
    const archivo = adjunto?.size ? adjunto : dato?.archivo;
    if (adjunto?.size && (adjunto.size > 4 * 1024 * 1024 || await adjunto.slice(0,5).text() !== '%PDF-')) {
      avisar('Selecciona un PDF de hasta 4 MB.'); return;
    }
    if (firma && f.get('decision') !== 'Pendiente' && !archivo) {
      avisar('Adjunta el acta firmada para registrar la decisión.'); return;
    }
    const valor = { decision:f.get('decision'), responsable:f.get('responsable').trim(), observacion:f.get('observacion').trim(), fecha:new Date().toISOString(), archivo };
    if (!valor.responsable || !valor.observacion) { avisar('Escribe el responsable y las observaciones.'); return; }
    try { await registro(id, valor); poner(valor); avisar('Registro guardado en este navegador.'); }
    catch { avisar('No se pudo guardar. Verifica el espacio y los permisos del navegador.'); }
  }
  return <details className="acta"><summary>{titulo} · {dato?.decision || 'Pendiente'}</summary>
    {listo && <form onSubmit={guardar}>
      <label>Decisión<select name="decision" defaultValue={dato?.decision || 'Pendiente'}>{decisiones.map(d=><option key={d}>{d}</option>)}</select></label>
      <label>Responsable de la revisión<input name="responsable" required maxLength="100" defaultValue={dato?.responsable}/></label>
      <label>Resultado observado y pendientes<textarea name="observacion" required maxLength="3000" defaultValue={dato?.observacion}/></label>
      {firma && <label>Acta firmada (PDF, hasta 4 MB)<input type="file" name="archivo" accept="application/pdf"/></label>}
      <button>Guardar registro</button>
    </form>}
    {dato && <div><p>Último registro: {new Date(dato.fecha).toLocaleString('es-PE')}</p>
      <button type="button" onClick={()=>descargar(new Blob([JSON.stringify({id,...dato,archivo:dato.archivo?.name},null,2)],{type:'application/json'}),id+'.json')}>Descargar registro</button>
      {dato.archivo && <button type="button" onClick={()=>descargar(dato.archivo,dato.archivo.name)}>Descargar acta firmada</button>}</div>}
    <p role="status">{aviso}</p>
  </details>;
}
export function Tabla({ columnas, filas }) {
  return <div className="tabla-cuaderno" tabIndex="0" aria-label={columnas.join(', ')}><table><thead><tr>{columnas.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{filas.map((fila,i)=><tr key={i}>{fila.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>;
}
export default function Cuaderno({ titulo, casos, children, actas = [] }) {
  const [indice, elegir] = useState(0);
  const caso = casos[indice];
  return <article className="cuaderno"><h2>{titulo}</h2>
    <label>Qué quieres revisar<select value={indice} onChange={e=>elegir(Number(e.target.value))}>{casos.map((c,i)=><option key={c.id} value={i}>{c.id} · {c.nombre}</option>)}</select></label>
    <div key={caso.id} className="hoja"><h3>{caso.nombre}</h3>{children(indice+1)}
      <details><summary>Criterio de aceptación</summary><p>{caso.esperado}</p></details>
      {!actas.includes(indice+1) && <Acta id={caso.id}/>}</div>
  </article>;
}
