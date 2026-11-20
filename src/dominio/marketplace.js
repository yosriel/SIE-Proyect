import { entero, evento, exigir, registro, texto, uid } from './modelo.js';

export const categorias = ['Audio', 'Hogar', 'Accesorios'];
export const marketplace = {
  seller(db, a, ctx) {
    const nombre = texto(a.nombre, 'razón social');
    exigir(/^\d{11}$/.test(a.ruc), 'El RUC debe contener 11 dígitos.');
    const documento = texto(a.documento, 'referencia del expediente');
    exigir(!db.sellers.some(s => s.ruc === a.ruc && s.id !== a.id), 'Ya existe un expediente con ese RUC.');
    const s = a.id ? registro(db.sellers, a.id) : { id: 'SEL-' + uid().slice(0, 8) };
    if (a.id) exigir(s.estado === 'Por corregir', 'El expediente no admite cambios.');
    else db.sellers.unshift(s);
    Object.assign(s, { nombre, ruc: a.ruc, documento, estado: 'En revisión', observacion: '' });
    evento(db, ctx, s.id, 'Expediente enviado', 'Seller', nombre);
    return s.id;
  },
  revisarSeller(db, a, ctx) {
    const s = registro(db.sellers, a.id);
    exigir(s.estado === 'En revisión', 'El expediente ya fue revisado.');
    exigir(['Aprobado', 'Por corregir', 'Rechazado'].includes(a.estado), 'Decisión inválida.');
    s.observacion = a.estado === 'Aprobado' ? '' : texto(a.observacion, 'observación');
    s.estado = a.estado;
    evento(db, ctx, s.id, s.estado, 'Administrador', s.observacion || s.nombre);
    return s.id;
  },
  publicar(db, a, ctx) {
    const s = registro(db.sellers, a.seller);
    exigir(s.estado === 'Aprobado', 'Se requiere un seller aprobado.');
    const nombre = texto(a.nombre, 'producto');
    exigir(categorias.includes(a.categoria), 'Categoría inválida.');
    const precio = Math.round(Number(a.precio) * 100);
    exigir(Number.isSafeInteger(precio) && precio > 0 && precio <= 99999999, 'Precio inválido.');
    const cantidad = entero(a.cantidad);
    const id = 'SKU-' + uid().slice(0, 8);
    db.productos.unshift({ id, seller: s.id, nombre, categoria: a.categoria, precio, cantidad, estado: 'En revisión' });
    evento(db, ctx, id, 'Producto enviado', 'Seller', s.nombre);
    return id;
  },
  revisarProducto(db, a, ctx) {
    const p = registro(db.productos, a.id);
    exigir(p.estado === 'En revisión', 'El producto ya fue revisado.');
    exigir(['Publicado', 'Rechazado'].includes(a.estado), 'Decisión inválida.');
    p.observacion = a.estado === 'Rechazado' ? texto(a.observacion, 'observación') : '';
    p.estado = a.estado;
    evento(db, ctx, p.id, p.estado, 'Administrador', p.nombre);
    return p.id;
  },
  ventaSeller(db, a, ctx) {
    const p = registro(db.productos, a.id);
    const cantidad = entero(a.cantidad);
    exigir(p.estado === 'Publicado' && p.cantidad >= cantidad, 'No hay unidades publicadas suficientes.');
    const id = 'ENV-' + uid().slice(0, 8);
    p.cantidad -= cantidad;
    db.despachos.unshift({ id, producto: p.id, seller: p.seller, cantidad, estado: 'Pendiente' });
    evento(db, ctx, id, 'Pedido de marketplace', 'Marketplace', p.nombre);
    return id;
  },
  despachar(db, a, ctx) {
    const d = registro(db.despachos, a.id);
    exigir(d.estado === 'Pendiente', 'Ya se registró el despacho.');
    d.guia = texto(a.guia, 'guía de despacho', 32);
    d.estado = 'Despachado';
    evento(db, ctx, d.id, 'Despachado', 'Seller', d.guia);
    return d.id;
  }
};
