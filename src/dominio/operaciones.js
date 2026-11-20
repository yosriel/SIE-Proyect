import { DIA, PRECIO, condiciones, disponible, entero, evento, exigir, motivos, registro, texto, ubicaciones, uid } from './modelo.js';

export function saldoDevolucion(db, p) {
  return p.cantidad - db.devoluciones.filter(d => d.pedido === p.id).reduce((sum, d) => sum + d.cantidad, 0);
}
export function elegibilidad(db, p, ahora = Date.now()) {
  if (p.estado !== 'Entregado') return 'Solo se aceptan compras entregadas.';
  if (ahora > p.entrega + 30 * DIA) return 'El plazo de 30 días venció.';
  if (!saldoDevolucion(db, p)) return 'Todas las unidades ya tienen devolución.';
  return '';
}
function stock(db, lugar) {
  exigir(ubicaciones.includes(lugar), 'Selecciona una ubicación válida.');
  return db.stock[lugar];
}

export const operaciones = {
  reservar(db, a, ctx) {
    exigir(ubicaciones.slice(0, 2).includes(a.tienda), 'Selecciona una tienda de retiro.');
    exigir(/^\d{8}$/.test(a.dni), 'El documento de demostración debe tener ocho dígitos.');
    const cantidad = entero(a.cantidad);
    const s = stock(db, a.tienda);
    exigir(disponible(s) >= cantidad, 'Stock insuficiente para confirmar el pedido.');
    const id = 'PED-' + uid().slice(0, 8).toUpperCase();
    s.reservado += cantidad;
    db.pedidos.unshift({ id, dni: a.dni, tienda: a.tienda, cantidad, precio: PRECIO, estado: 'Reservado', creado: ctx.ahora });
    evento(db, ctx, id, 'Pedido reservado', 'Cliente', a.tienda);
    evento(db, ctx, id, 'Inventario reservado', 'Inventario', cantidad + ' unidades · ' + a.tienda);
    return id;
  },
  pedido(db, a, ctx) {
    const p = registro(db.pedidos, a.id);
    const s = stock(db, p.tienda);
    const anterior = p.estado;
    if (a.accion === 'cancelar') {
      exigir(['Reservado', 'En preparación', 'Listo para retiro'].includes(anterior), 'Ya no se puede cancelar.');
      s.reservado -= p.cantidad;
      p.estado = 'Cancelado';
    } else if (a.accion === 'preparar' && anterior === 'Reservado') {
      p.estado = 'En preparación';
    } else if (a.accion === 'listo' && anterior === 'En preparación') {
      p.estado = 'Listo para retiro';
      p.codigo = uid().slice(0, 8).toUpperCase();
      p.vence = ctx.ahora + 2 * DIA;
      evento(db, ctx, p.id, 'Aviso de retiro', 'Notificaciones', p.tienda + ' · 10:00–20:00 · plazo de 48 horas');
    } else if (a.accion === 'entregar') {
      exigir(anterior !== 'Entregado', 'El pedido ya fue entregado.');
      exigir(anterior === 'Listo para retiro', 'El pedido aún no está listo para retiro.');
      exigir(ctx.ahora <= p.vence, 'El código de retiro venció.');
      exigir(a.codigo?.trim().toUpperCase() === p.codigo, 'Código de retiro inválido.');
      exigir(a.dni === p.dni, 'El documento no coincide.');
      s.reservado -= p.cantidad;
      s.fisico -= p.cantidad;
      p.estado = 'Entregado';
      p.entrega = ctx.ahora;
    } else {
      throw new Error('Transición de pedido inválida.');
    }
    evento(db, ctx, p.id, 'Pedido ' + p.estado, a.accion === 'cancelar' ? 'Cliente' : 'Personal de tienda', anterior + ' → ' + p.estado);
    if (['Cancelado', 'Entregado'].includes(p.estado)) evento(db, ctx, p.id, 'Inventario actualizado', 'Inventario', p.tienda);
    return p.id;
  },
  mover(db, a, ctx) {
    const s = stock(db, a.lugar);
    const n = entero(a.cantidad);
    const motivo = texto(a.motivo, 'motivo');
    exigir(['Ingreso', 'Venta POS', 'Traslado'].includes(a.tipo), 'Tipo de movimiento inválido.');
    if (a.tipo !== 'Ingreso') exigir(disponible(s) >= n, 'Stock disponible insuficiente.');
    if (a.tipo === 'Traslado') {
      exigir(a.destino !== a.lugar, 'El destino debe ser diferente del origen.');
      stock(db, a.destino).fisico += n;
    }
    s.fisico += a.tipo === 'Ingreso' ? n : -n;
    evento(db, ctx, a.lugar, a.tipo, 'Inventario', [n + ' unidades', a.destino && a.tipo === 'Traslado' ? a.destino : '', motivo].filter(Boolean).join(' · '));
    return a.lugar;
  },
  devolver(db, a, ctx) {
    const p = registro(db.pedidos, a.id);
    const error = elegibilidad(db, p, ctx.ahora);
    exigir(!error, error);
    const n = entero(a.cantidad);
    exigir(n <= saldoDevolucion(db, p), 'La cantidad supera el saldo de la compra.');
    exigir(motivos.includes(a.motivo) && condiciones.includes(a.condicion), 'Selecciona motivo y condición válidos.');
    const id = 'DEV-' + uid().slice(0, 8).toUpperCase();
    const destino = a.condicion === 'Buen estado' ? 'Reingreso' : 'Cuarentena';
    db.devoluciones.unshift({ id, pedido: p.id, cantidad: n, motivo: a.motivo, condicion: a.condicion, destino, importe: n * p.precio, estado: 'Registrada' });
    db.stock[p.tienda][destino === 'Reingreso' ? 'fisico' : 'cuarentena'] += n;
    evento(db, ctx, id, 'Devolución registrada', 'Atención al cliente', p.id + ' · ' + destino);
    evento(db, ctx, p.id, 'Inventario devuelto', 'Inventario', n + ' · ' + destino);
    return id;
  },
  reembolsar(db, a, ctx) {
    const d = registro(db.devoluciones, a.id);
    exigir(d.estado === 'Registrada', 'El reembolso ya fue procesado.');
    d.estado = 'Reembolsada';
    evento(db, ctx, d.id, 'Reembolso simulado', 'Finanzas', d.pedido);
    return d.id;
  }
};

export function vencerReservas(db, ctx) {
  for (const p of db.pedidos) {
    if (p.estado === 'Listo para retiro' && p.vence < ctx.ahora) {
      db.stock[p.tienda].reservado -= p.cantidad;
      p.estado = 'Vencido';
      evento(db, ctx, p.id, 'Reserva vencida', 'Inventario', 'Stock liberado en ' + p.tienda);
    }
  }
}
