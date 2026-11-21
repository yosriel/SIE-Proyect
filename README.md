# Omni-SI Falabella

Web responsiva del proyecto académico SIE Proyect para el punto 8 del APF3. Los tres sprints usan React en el navegador. Vite ejecuta el servidor de desarrollo y compila la aplicación estática.

## Ejecutar desde una copia limpia

Versiones probadas: Node.js 26.13.1, npm 11.20.0, React y React DOM 19.3.0, Vite 8.3.4. El proyecto requiere Node.js 22.12 o posterior. Las dependencias están fijadas en el archivo de bloqueo.

```sh
npm ci
npm run dev
```

Abrir la dirección local que imprime Vite. Para probar desde un celular conectado a la misma red de confianza, ejecutar `npm run dev -- --host 0.0.0.0` y abrir la dirección de red que imprime Vite.

## Compilar y verificar

```sh
npm run build
npm run preview
```

El resultado está en `dist/`. Abrir la dirección que imprime la vista previa y comprobar el incremento en celular y en PC. Con acceso al registro de npm, ejecutar `npm audit` para revisar dependencias directas y transitivas.

## Trabajar por sprint

| Rama | Propósito |
| --- | --- |
| main | Entregas aceptadas. |
| dev | Base común e integración de los incrementos revisados. |
| Sprint1 | Inicio y planificación del proyecto. |
| Sprint2 | Modelado de procesos omnicanal y demostración de sus flujos. |
| Sprint3 | Arquitectura e integración. |

Usar `git switch Sprint1`, `git switch Sprint2` o `git switch Sprint3` para abrir una rama. Cada incremento parte del anterior y se conserva en su rama para la exposición. Tras la revisión, integrar en dev. Actualizar las ramas reservadas desde dev antes de continuar su implementación. La fuente académica es APF2, secciones 16, 17 y 21.

## Demo del Sprint 1

Abrir la página inicial, desplegar «Actividades y responsables del sprint» y comprobar las diez actividades SP1-01 a SP1-10 del APF2 (sección 17.1). Al cerrar el detalle vuelve a quedar visible el resumen. Repetir a 390 y 1280 px de ancho. Las capturas están en [celular](evidencias/celular.png) y [PC](evidencias/pc.png).

## Sprint 2 · Procesos omnicanal

Las nueve pantallas del APF2 (sección 21) se recorren desde Comprar, Mis pedidos, Devoluciones y el menú Equipo de tienda. Los perfiles de cliente, tienda, finanzas y administrador son pasos de una simulación guiada. Usar únicamente documentos y expedientes ficticios. Los datos persisten en IndexedDB por navegador y origen.

| Historia | Recorrido de demostración |
| --- | --- |
| HU01 Compra con retiro | En Comprar, elegir Tienda A, ajustar a 2 unidades y pulsar Reservar para retiro. Confirmar con el documento ficticio 00000001. En Mis pedidos, usar «Abrir este pedido en tienda». Allí iniciar preparación y marcarlo listo. Consultar el código en Seguimiento del pedido y validar código y documento en Entrega. En otro pedido, probar Cancelar y comprobar la liberación de la reserva. |
| HU02 Inventario | Consultar el físico, reservado y disponible por ubicación. Registrar un ingreso, una venta POS o un traslado entre tiendas, revisar el saldo y el historial. La cuarentena se controla por separado. |
| HU03 Devoluciones | Buscar el pedido entregado o PED-DEMO, seleccionar la compra, el motivo, la cantidad y la condición. Registrar y procesar el reembolso simulado. Una unidad dañada va a cuarentena. PED-VENCIDO permite demostrar el rechazo por plazo. |
| HU04 Marketplace | Registrar razón social, RUC ficticio de 11 dígitos y referencia del expediente. Solicitar corrección con una observación, reenviar y aprobar. En Productos y despachos registrar un artículo, aprobar su publicación, simular un pedido y registrar el número de guía. |

Cada tienda parte de existencias de ejemplo. La Tienda A inicia con 10 unidades físicas y 2 reservadas previas. Las compras nuevas reservan existencias hasta la entrega. El plazo ilustrativo de retiro es de 48 horas y el de devolución de 30 días. El aviso de retiro, los pagos, las referencias a documentos y los despachos son simulados. Las pestañas del mismo origen comparten el estado. Para iniciar otro ensayo independiente se puede usar un perfil de navegador nuevo.

Para probar las reglas de negocio ejecutar `npm test`. Para revisar la interfaz, repetir los recorridos a 390 y 1280 px y comprobar que el estado persiste al recargar.
