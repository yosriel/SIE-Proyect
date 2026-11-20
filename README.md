# Omni-SI Falabella

Web responsiva del proyecto académico SIE Proyect. El punto 8 del APF3 pide mostrar la evolución del prototipo o software por sprint. La fuente de alcance es el informe APF2, en especial las secciones 16, 17 y 21.

## Ramas y demostraciones

| Rama | Uso |
| --- | --- |
| `main` | Versiones aceptadas para entrega. |
| `dev` | Integración de incrementos revisados. |
| `Sprint1` | Primera versión demostrable. |
| `Sprint2` | Segundo incremento, a partir del primero integrado. |
| `Sprint3` | Tercer incremento, a partir del segundo integrado. |

Cada rama de sprint nace de `dev`. Al cerrar una demostración, integrar la rama en `dev` y conservarla en su último commit para volver a mostrarla. Antes de iniciar el sprint siguiente, actualizar su rama reservada desde `dev` con `git merge --ff-only dev`. Para ver qué añadió un sprint ya integrado, usar, por ejemplo, `git diff Sprint1..Sprint2`. La integración final a `main` se realiza tras la revisión de la entrega.

## Consultar un incremento

Con Git 2.23 o posterior, ejecutar `git switch Sprint1` para consultar la primera demo y sus instrucciones. Los sprints posteriores se implementan en orden. El informe describe el Sprint 1 como planificación, el Sprint 2 como modelado de procesos y el Sprint 3 como arquitectura e integración. Las demos del APF3 traducen ese trabajo previo en software.

## Sprint 1 · Producto y tienda de retiro

El APF2 recoge la planificación en su sección 16.1. Como primera demostración de software para el APF3, esta rama hace interactiva la pantalla «Producto y tienda de retiro» del apartado 21.1.1 (HU01). Permite elegir la tienda y la cantidad, y consultar existencias ficticias. La consulta conserva el stock. La reserva, el pedido y la entrega son pasos posteriores.

### Ejecutar desde una copia limpia

Abrir `index.html` en un navegador moderno o, con Python 3, ejecutar desde la raíz:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8000/`. HTML, CSS y JavaScript se sirven directamente, sin instalación de paquetes, compilación, credenciales ni variables de entorno.

### Reproducir la demo

1. Consultar 1 y 8 unidades en Tienda A. En ambos casos se informa disponibilidad y un stock de 8.
2. Solicitar 9 en A y luego 1 en Tienda B. La primera consulta informa el máximo disponible y la segunda indica falta de stock.
3. Cambiar de tienda o de cantidad tras una consulta. El resultado previo desaparece. Dejar la cantidad vacía o escribir 0 o 1.5 e intentar consultar. El navegador solicita una cantidad entera positiva.
4. Repetir en un viewport de celular (390 px) y en uno de escritorio (1280 px). Comprobar que el formulario y su resultado se ven completos.

Capturas del incremento con una consulta válida en la Tienda A: [celular](evidencias/celular.png) y [PC](evidencias/pc.png).
