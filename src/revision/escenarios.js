import { nuevaBase } from '../dominio/modelo.js';
import { operaciones } from '../dominio/operaciones.js';
import { marketplace } from '../dominio/marketplace.js';

const reserva = { tienda:'Tienda A', cantidad:1, dni:'00000001' };
const movimiento = { lugar:'Tienda A', tipo:'Traslado', destino:'Tienda B', cantidad:1, motivo:'Reposición' };
const devolucion = { id:'PED-DEMO', cantidad:1, motivo:'Falla del producto', condicion:'Buen estado' };
const vendedor = { nombre:'Audio Demo', ruc:'20000000001', documento:'EXP-001' };
const compra = (db,ctx,cambio) => operaciones.reservar(db,{...reserva,...cambio},ctx);
const mover = (db,ctx,cambio) => operaciones.mover(db,{...movimiento,...cambio},ctx);
const devolver = (db,ctx,cambio) => operaciones.devolver(db,{...devolucion,...cambio},ctx);
const alta = (db,ctx,cambio) => marketplace.seller(db,{...vendedor,...cambio},ctx);

export const caminos = [
  ['HU01','Cliente','Reserva disponible','Inventario comprometido',(d,c)=>{compra(d,c);return d.stock['Tienda A'].reservado===3;}],
  ['HU01','Cliente','Solicitud superior al disponible','Reserva bloqueada',(d,c)=>compra(d,c,{cantidad:9}),/insuficiente/i],
  ['HU01','Cliente','Documento incompleto','Reserva bloqueada',(d,c)=>compra(d,c,{dni:'123'}),/documento/i],
  ['HU01','Personal de tienda','Intento de entregar antes de preparar','Entrega bloqueada',(d,c)=>operaciones.pedido(d,{id:compra(d,c),accion:'entregar'},c),/listo/i],
  ['HU02','Inventario','Traslado entre ubicaciones','Unidad disponible en destino',(d,c)=>{mover(d,c);return d.stock['Tienda B'].fisico===1;}],
  ['HU02','Inventario','Mismo origen y destino','Traslado bloqueado',(d,c)=>mover(d,c,{destino:'Tienda A'}),/diferente/i],
  ['HU02','Caja','Venta superior al disponible','Movimiento bloqueado',(d,c)=>mover(d,c,{tipo:'Venta POS',cantidad:9}),/insuficiente/i],
  ['HU02','Inventario','Cantidad fraccionaria','Movimiento bloqueado',(d,c)=>mover(d,c,{cantidad:1.5}),/entero/i],
  ['HU03','Finanzas','Compra entregada dentro del plazo','Reembolso procesado',(d,c)=>{const id=devolver(d,c);operaciones.reembolsar(d,{id},c);return d.devoluciones[0].estado==='Reembolsada';}],
  ['HU03','Atención al cliente','Compra fuera de plazo','Devolución bloqueada',(d,c)=>devolver(d,c,{id:'PED-VENCIDO'}),/plazo/i],
  ['HU03','Atención al cliente','Unidades superiores al saldo','Devolución bloqueada',(d,c)=>devolver(d,c,{cantidad:3}),/saldo/i],
  ['HU03','Finanzas','Segundo reembolso','Reembolso bloqueado',(d,c)=>{const id=devolver(d,c);operaciones.reembolsar(d,{id},c);operaciones.reembolsar(d,{id},c);},/procesado/i],
  ['HU04','Administrador','Expediente válido revisado','Seller aprobado',(d,c)=>{const id=alta(d,c);marketplace.revisarSeller(d,{id,estado:'Aprobado'},c);return d.sellers[0].estado==='Aprobado';}],
  ['HU04','Seller','RUC con longitud distinta de once','Alta bloqueada',(d,c)=>alta(d,c,{ruc:'123'}),/RUC/i],
  ['HU04','Seller','RUC duplicado','Alta bloqueada',(d,c)=>{alta(d,c);alta(d,c);},/existe/i],
  ['HU04','Administrador','Publicación de un seller rechazado','Publicación bloqueada',(d,c)=>{const id=alta(d,c);marketplace.revisarSeller(d,{id,estado:'Rechazado',observacion:'Expediente observado'},c);marketplace.publicar(d,{seller:id},c);},/aprobado/i]
];
export function recorrer() {
  return caminos.map(([historia,actor,condicion,esperado,operar,error],i)=>{
    const ahora=Date.now(), db=nuevaBase(ahora);
    const ctx={ahora,clave:'recorrido-'+i};
    try {
      const correcto=operar(db,ctx);
      return {historia,actor,condicion,esperado,conforme:!error && correcto===true,observado:correcto===true?esperado:'Resultado inesperado'};
    } catch(e) {return {historia,actor,condicion,esperado,conforme:!!error?.test(e.message),observado:e.message};}
  });
}
