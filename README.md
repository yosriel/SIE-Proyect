# Omni-SI Falabella · Sprint 2

## Qué se hizo

Este sprint convirtió los cuatro procesos omnicanal del APF2 en **nueve pantallas interactivas**. La aplicación conecta las acciones del cliente con las del equipo de tienda, de modo que una reserva, una entrega y una devolución se reflejan en el inventario de la misma sesión.

| Historia | Incremento implementado |
| --- | --- |
| HU01 · Compra con retiro | Se incorporaron la ficha de producto con stock por tienda, la reserva, el seguimiento y la entrega. El cliente puede cancelar el pedido. El personal valida el código y el documento antes de entregar. |
| HU02 · Inventario | Se separaron las cantidades físicas, reservadas y disponibles. Se implementaron ingresos, ventas POS, traslados entre ubicaciones y un historial de movimientos. |
| HU03 · Devoluciones | Se habilitó la búsqueda por pedido o documento, la validación del plazo y la devolución parcial. El estado del producto determina si reingresa al stock o pasa a cuarentena. El reembolso simulado se procesa una sola vez. |
| HU04 · Marketplace | Se incorporaron el registro y la revisión de vendedores, la corrección de expedientes, la aprobación de productos, la simulación de pedidos y el despacho con guía. |

Se añadió persistencia en IndexedDB para conservar las operaciones al recargar. La navegación reúne las compras, los pedidos y las devoluciones en la barra principal. **Equipo de tienda** da acceso a las tareas del personal.

## Cómo demostrar el incremento

1. Con los datos iniciales, abre **Comprar** y reserva dos unidades en **Tienda A** con el documento ficticio `00000001`. En inventario, el disponible baja de 8 a 6 y el físico sigue en 10.
2. En **Mis pedidos**, selecciona **Abrir este pedido en tienda**, inicia la preparación y marca el pedido como listo. Consulta el código en **Mis pedidos** y confirma la entrega. El físico baja a 8.
3. En **Devoluciones**, busca la compra entregada y registra una unidad en buen estado. Comprueba que vuelve al disponible y procesa el reembolso. También puedes usar `PED-DEMO` para probar una devolución o `PED-VENCIDO` para comprobar el rechazo por plazo.
4. En **Equipo de tienda → Administrar vendedores**, registra y aprueba un vendedor ficticio, publica un producto tras su revisión y registra la guía de un pedido simulado.

## Ejecutar y probar

Requiere Node.js 22.12 o posterior y npm. Esta rama utiliza React 19.3.0 y Vite 8.3.4.

```sh
git switch Sprint2
npm ci
npm run dev
```

Abre la dirección que imprime Vite. Ejecuta `npm test` para comprobar las cinco pruebas de negocio. Para probar la versión compilada, ejecuta `npm run build` y luego `npm run preview`. [Pruebas de procesos](pruebas/procesos.test.js) · [Compra en celular](evidencias/stock-celular.png) · [Compra en PC](evidencias/stock-pc.png)
