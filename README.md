# Omni-SI Falabella · Sprint 3

## Qué se hizo

Este sprint conectó los procesos de tienda con un **gateway local y dos canales simulados, Web y POS**. El incremento permite observar qué ocurre con una venta cuando un canal se desconecta y cómo recupera el saldo al volver a conectarse.

- **HU05 · Arquitectura modular.** Se incorporó un gateway que dirige las solicitudes a los módulos de pedidos, inventario, devoluciones y marketplace. Se publicó un contrato OpenAPI v1 para la consulta de estado y once operaciones. [Consultar el contrato](public/contrato-v1.json)
- **HU06 · Integración.** Se añadió una cola persistente de eventos. Cada canal conserva su secuencia de procesamiento, y la correlación permite seguir una operación desde la solicitud hasta su entrega. Repetir una solicitud con la misma clave y los mismos datos devuelve el resultado anterior.
- **Monitor de canales.** Se incorporó la pantalla **Equipo de tienda → Comprobar los canales** para comparar saldos, simular desconexiones, consultar intentos fallidos y reprocesar eventos. Al abrir una base del Sprint 2, los canales se inicializan a partir de sus existencias y pedidos.

## Cómo demostrar el incremento

1. Con los datos iniciales, abre **Comprobar los canales**. Web y POS muestran 8 unidades disponibles en Tienda A.
2. Desconecta POS y pulsa **Registrar venta POS de prueba**. Web baja a 7 y POS conserva 8. Tras tres intentos fallidos, el historial identifica el evento pendiente de recuperación.
3. Pulsa **Repetir última solicitud**. Comprueba que Web sigue en 7. En la respuesta técnica aparece `repetida: true`.
4. Reconecta POS y pulsa **Reintentar POS**. Ambos canales terminan con 7 unidades y el evento figura como entregado. [Canal interrumpido](evidencias/canal-interrumpido.png) · [Canales conciliados](evidencias/canales-conciliados.png)

## Ejecutar y probar

Requiere Node.js 22.12 o posterior y npm. Esta rama utiliza React 19.3.0 y Vite 8.3.4.

```sh
git switch Sprint3
npm ci
npm run dev
```

Ejecuta `npm test` para comprobar las cinco pruebas de negocio y las cuatro de integración. Estas últimas cubren el contrato, las solicitudes repetidas, la recuperación del canal y la migración de datos. Para probar la compilación estática, ejecuta `npm run build` y luego `npm run preview`. [Pruebas de integración](pruebas/integracion.test.js)

El cierre del sprint incluye las tres versiones ejecutables y el documento del punto 8 del APF3. [Descargar la demostración](entrega/Omni-SI-Falabella-APF3.zip) · [Abrir el informe en Word](entrega/Punto-8-APF3.docx)

En **Equipo de tienda → Probar los contratos** puedes recorrer los diez casos de arquitectura, medir una línea base y probar las doce operaciones con un consumidor simulado. El laboratorio enlaza el monitor para demostrar desconexiones, reintentos y recuperación.
