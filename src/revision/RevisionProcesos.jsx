import { useState } from 'react';
import Cuaderno, { Acta, Tabla } from './Cuaderno.jsx';
import { caminos, recorrer } from './escenarios.js';
import casos from './casos2.json';
import tablero from './tablero.json';

const procesos=[
 ['HU01','Retiro en tienda','Cliente → tienda','Disponibilidad por tienda','Reserva y entrega → inventario y devoluciones','Preparar y avisar al cliente','Pedido entregado o cancelado'],
 ['HU02','Inventario','Caja → inventario','Reserva, venta, devolución o traslado','Disponible por ubicación → compra y retiro','Actualizar existencias de la ubicación','Movimiento aplicado o rechazado'],
 ['HU03','Devoluciones','Atención al cliente → finanzas','Compra entregada','Reposición o cuarentena → inventario','Registrar devolución y emitir reembolso','Reembolso registrado o devolución denegada'],
 ['HU04','Marketplace','Seller → administrador','Expediente y producto del seller','Pedido de marketplace → seller para despacho','Validar publicación y registrar la venta','Despacho registrado o publicación rechazada']
];
const pantallas=[
 ['HU01','Consultar producto y tienda','retiro'],['HU01','Seguir la reserva','seguimiento'],['HU01','Preparar y entregar','entrega'],
 ['HU02','Consultar existencias','existencias'],['HU02','Registrar movimiento','movimientos'],['HU03','Validar la compra','validar'],
 ['HU03','Procesar el reembolso','devoluciones'],['HU04','Registrar o revisar seller','sellers'],['HU04','Revisar producto y despacho','productos']
];
const decisiones=['Pendiente','Aceptado','Aceptado con pendientes','Rechazado'];
function Ensayo(){
  const [filas,poner]=useState(null);
  return <><p>Los recorridos usan copias de la tienda con datos de prueba. Cada fila ejecuta la regla de negocio correspondiente.</p>
    <button onClick={()=>poner(recorrer())}>Ejecutar los 16 recorridos</button>
    {filas && <p role="status">{filas.filter(f=>f.conforme).length} de {filas.length} resultados esperados.</p>}
    <Tabla columnas={['Historia','Responsable','Condición','Salida esperada','Resultado observado']} filas={caminos.map(([hu,actor,condicion,salida],i)=>[hu,actor,condicion,salida,filas?(filas[i].conforme?'Conforme · ':'Revisar · ')+filas[i].observado:'Sin ejecutar'])}/></>;
}
function contenido(n){
  switch(n){
    case 1:return <Tabla columnas={['Proceso','Entrada','Salida y destinatario']} filas={procesos.map(([hu,nombre,,entrada,salida])=>[hu+' · '+nombre,entrada,salida])}/>;
    case 2:return <>{procesos.map(([hu,nombre])=><Acta key={hu} id={'CP-S2-02-'+hu} titulo={nombre} decisiones={decisiones}/>)}</>;
    case 3:return <Tabla columnas={['Proceso','Condición y límite','Efecto']} filas={[
      ['Retiro','1 ≤ unidades ≤ físico − reservado, documento de ocho dígitos','Compromete el stock. El código de retiro tiene una vigencia de 48 horas desde el aviso.'],
      ['Inventario','Cantidad entera de 1 a 99 999. La salida debe caber en el saldo disponible.','Descuenta del origen. En traslados ingresa en un destino distinto.'],
      ['Devoluciones','Compra entregada hace 30 días o menos y cantidad hasta el saldo pendiente','Buen estado repone stock. Dañado pasa a cuarentena. Cada devolución admite un reembolso.'],
      ['Seller','RUC único de once dígitos y referencia de expediente. Para publicar, el expediente debe estar aprobado.','La observación es obligatoria al rechazar o pedir correcciones.']
    ]}/>;
    case 4:case 7:return <Ensayo/>;
    case 5:return <><p>Corte del APF2 · Los cuatro procesos figuran en progreso. Conteo del tablero: {['Completado','En progreso','Pendiente'].map(e=>e+' '+tablero.filter(f=>f[3]===e).length).join(' · ')}.</p><Tabla columnas={['Historia','Actividad','Responsable','Estado']} filas={tablero}/></>;
    case 6:return <><p>Revisar {procesos.map(p=>p[1]).join(', ')}. Deja por escrito los pendientes aceptados y la decisión del Product Owner.</p><Acta id="CP-S2-06" titulo="Acta del Sprint Review" decisiones={decisiones}/></>;
    case 8:return <Tabla columnas={['Proceso','Carriles','Actividad entre carriles','Cierre']} filas={procesos.map(([hu,,c,,,a,z])=>[hu,c,a,z])}/>;
    case 9:return <Tabla columnas={['Proceso','Evento de inicio','Evento intermedio y consumidor','Fin']} filas={procesos.map(([hu,,,e,s,,z])=>[hu,e,s,z])}/>;
    case 10:return <><p>Abre el paso que quieras demostrar. La liberación por caducidad y los asientos de stock se ejecutan como operaciones internas.</p><Tabla columnas={['Historia','Paso y pantalla']} filas={pantallas.map(([hu,t,v])=>[hu,<a href={'?vista='+v}>{t}</a>])}/></>;
  }
}
export default function RevisionProcesos(){
  return <Cuaderno titulo="Revisión de los cuatro procesos" casos={casos} actas={[2,6]}>{contenido}</Cuaderno>;
}
