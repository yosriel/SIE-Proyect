# Omni-SI Falabella

Omni-SI Falabella es una aplicación web académica que simula la operación omnicanal de Falabella Retail Perú. Desde un celular o una PC puedes seguir una compra desde la reserva hasta el retiro en tienda y ver cómo cambia el inventario al entregar, cancelar o devolver el pedido.

**Para probarla sin instalar dependencias**, descarga el ZIP, extrae su contenido, abre `PRESENTACION.html` y selecciona **Abrir la tienda**. [Descargar la demostración](entrega/Omni-SI-Falabella-APF3.zip)

## Qué puedes hacer

| Área | Funciones |
| --- | --- |
| Compras y retiros | Consultar existencias por tienda, reservar unidades y seguir el pedido en **Mis pedidos**. El personal de tienda puede prepararlo y entregarlo tras validar el código de retiro y el documento ficticio. |
| Inventario | Consultar stock físico, reservado y disponible por ubicación. Registrar ingresos, ventas en caja y traslados, y revisar el historial de movimientos. |
| Devoluciones | Buscar una compra, comprobar el plazo y las unidades disponibles para devolución, registrar el estado del producto y tramitar un reembolso simulado. |
| Marketplace | Registrar vendedores, revisar expedientes y productos, aprobar publicaciones y registrar el despacho con su número de guía. |
| Integración | Comparar las existencias de la web y el punto de venta (POS), simular una desconexión y reintentar la entrega de eventos. |
| Planificación | Revisar backlog, requisitos, épicas, puntos y cronograma en **Equipo de tienda → Ver la planificación**. Registrar decisiones y actas firmadas por documento. |

## Revisar los incrementos

En **Equipo de tienda** puedes abrir **Ver la planificación** (Sprint 1), **Recorrer los cuatro procesos** (Sprint 2) o **Probar los contratos** (Sprint 3). Elige el caso del plan por su código. El cuaderno conserva las observaciones y las decisiones en el navegador y permite descargar el registro.

Los 16 recorridos de negocio y las 12 operaciones del laboratorio usan datos aislados. El monitor de integración muestra los cambios de la tienda de demostración.

## Un recorrido para empezar

En **Comprar**, elige **Tienda A**, selecciona dos unidades y pulsa **Reservar para retiro**. Confirma con el documento ficticio `00000001`. En **Mis pedidos**, abre el pedido en tienda, inicia la preparación y márcalo como listo. El código aparece en **Mis pedidos**. Úsalo junto con el documento para confirmar la entrega. En **Equipo de tienda → Revisar el inventario** puedes comprobar cómo la reserva primero compromete las unidades y la entrega después reduce el stock físico.

## Datos y arquitectura

La interfaz usa React y Vite. El gateway local aplica las reglas de pedidos, inventario, devoluciones y marketplace. IndexedDB conserva las operaciones al recargar la página y las pestañas del mismo origen comparten los cambios. Cada dispositivo mantiene su propia base. Los pagos, los canales comerciales y los despachos se simulan con datos ficticios. [Contrato OpenAPI v1](public/contrato-v1.json)

## Desarrollo local

Se requiere Node.js 22.12 o posterior y npm. Las versiones probadas son Node.js 26.13.1 y npm 11.20.0. El proyecto utiliza React 19.3.0 y Vite 8.3.4.

Desde la raíz del repositorio, instala las dependencias y abre la dirección que imprime Vite.

```sh
npm ci
npm run dev
```

Para probar desde un celular conectado a la misma red, ejecuta `npm run dev -- --host 0.0.0.0` y abre la dirección de red que muestra Vite.

| Comando | Resultado |
| --- | --- |
| `npm test` | Ejecuta las 15 pruebas de planificación, procesos, integración y laboratorio. |
| `npm run build` | Genera la aplicación estática en `dist/`. |
| `npm run preview` | Sirve la compilación local después del build. |

El informe del punto 8 del APF3 incluye las capturas y el alcance de la demostración. [Abrir el informe en Word](entrega/Punto-8-APF3.docx)
