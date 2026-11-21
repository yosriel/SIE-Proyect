import { useState } from 'react';
import { caminos } from './escenarios.js';

const etapas={
  HU01:[['Cliente','Consultar stock y reservar','retiro'],['Tienda','Preparar y emitir aviso','entrega'],['Cliente','Consultar código de retiro','seguimiento'],['Tienda','Validar código y entregar','entrega']],
  HU02:[['Inventario','Consultar unidades por ubicación','existencias'],['Caja o inventario','Registrar ingreso, venta o traslado','movimientos'],['Inventario','Comprobar saldo e historial','existencias']],
  HU03:[['Atención al cliente','Buscar la compra y validar el plazo','validar'],['Atención al cliente','Registrar cantidad y condición','validar'],['Finanzas','Tramitar el reembolso','devoluciones']],
  HU04:[['Seller','Enviar expediente','sellers'],['Administrador','Aprobar u observar al vendedor','sellers'],['Seller','Enviar el producto','productos'],['Administrador','Revisar la publicación','productos'],['Seller','Registrar pedido y despacho','productos']]
};
export default function MapaProceso({procesos}){
  const [hu,seleccionar]=useState('HU01');
  const proceso=procesos.find(p=>p[0]===hu);
  return <><label>Proceso para recorrer<select value={hu} onChange={e=>seleccionar(e.target.value)}>{procesos.map(([id,nombre])=><option key={id} value={id}>{nombre}</option>)}</select></label>
    <p><strong>Inicio</strong> · {proceso[3]}</p>
    <ol className="ruta-proceso">{etapas[hu].map(([rol,tarea,vista])=><li key={tarea}><strong>{rol}</strong><a href={'?vista='+vista}>{tarea}</a></li>)}</ol>
    <p><strong>Cierre</strong> · {proceso[6]}</p>
    <details><summary>Decisiones y salidas alternativas</summary><ul>{caminos.filter(c=>c[0]===hu).map(([,actor,regla,salida])=><li key={regla}>{regla} → {salida} ({actor})</li>)}</ul></details>
  </>;
}
