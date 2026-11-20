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
