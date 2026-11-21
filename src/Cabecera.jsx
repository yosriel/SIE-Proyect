import { useEffect, useRef } from 'react';
import Marca from './Marca.jsx';

const cliente = [['retiro','Comprar'], ['seguimiento','Mis pedidos'], ['validar','Devoluciones']];
const equipo = [
  ['entrega','Preparar y entregar pedidos'],
  ['existencias','Revisar el inventario'],
  ['sellers','Administrar vendedores'],
  ['planificacion','Ver la planificación']
];

export default function Cabecera({ vista, integracion }) {
  const menu = useRef(null);
  const operaciones = integracion ? [...equipo, ['integracion','Comprobar los canales']] : equipo;
  const activo = {devoluciones:'validar',movimientos:'existencias',productos:'sellers'}[vista] || vista;
  useEffect(() => {
    function cerrar(e) {
      if (e.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary').focus();
      } else if (e.type === 'pointerdown' && !menu.current?.contains(e.target)) {
        menu.current.open = false;
      }
    }
    document.addEventListener('keydown',cerrar);
    document.addEventListener('pointerdown',cerrar);
    return () => {
      document.removeEventListener('keydown',cerrar);
      document.removeEventListener('pointerdown',cerrar);
    };
  }, []);
  return <header className="mastil">
    <div className="envoltura barra">
      <Marca href="?vista=retiro"/>
      <nav className="tienda-nav" aria-label="Compras">{cliente.map(([id,nombre]) =>
        <a key={id} href={'?vista='+id} aria-current={activo===id?'page':undefined}>{nombre}</a>)}</nav>
      <details className="equipo" ref={menu}>
        <summary>Equipo de tienda</summary>
        <nav aria-label="Operaciones del equipo">{operaciones.map(([id,nombre])=>
          <a key={id} href={'?vista='+id} aria-current={activo===id?'page':undefined}>{nombre}</a>)}</nav>
      </details>
    </div>
  </header>;
}
