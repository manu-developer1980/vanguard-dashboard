# 0003 - Motor de monitorizacion basado en checks programados

## Status
Accepted

## Date
2026-06-29

## Context
El nucleo funcional de `Vanguard Dashboard` es monitorizar sites `Web/API` de empresas clientes. El MVP debe ser demostrable, entendible y operativo sin introducir demasiada complejidad de infraestructura. Se definio que cada `Site` representa una sola URL `HTTP/HTTPS` y que la plataforma debe medir salud de forma periodica.

El producto necesita recoger:
- Codigo HTTP.
- Latencia `TTFB`.
- Dias restantes de SSL cuando la URL usa `https`.

## Alternatives
- Agentes externos o collectors avanzados desde el inicio.
- Monitorizacion basada en multiples endpoints por site.
- Checks programados propios sobre una sola URL por `Site`.

## Decision
Implementar un motor de monitorizacion basado en checks programados propios, donde cada `Site` representa una URL `HTTP/HTTPS` monitorizada mediante peticiones `GET`.

Cada ejecucion generara un `CheckResult`, actualizara `SiteHealth` y podra derivar en `Alert` segun las reglas del sistema. El umbral de latencia sera configurable por `Site`, y el chequeo de SSL solo se aplicara automaticamente cuando la URL use `https`.

## Consequences
### Positivas
- Reduce complejidad del MVP y acelera entrega de valor visible en el dashboard.
- Hace el sistema mas facil de explicar y defender en portfolio.
- Permite separar con claridad configuracion (`Site`), historico (`CheckResult`) y estado agregado (`SiteHealth`).
- Encaja bien con politicas por tier y scheduler controlado.

### Negativas
- No cubre escenarios mas avanzados de observabilidad distribuida o agentes remotos.
- Limita el alcance inicial a una URL principal por recurso monitorizado.
- Obliga a evolucionar el modelo si mas adelante se quieren checks personalizados o multi-endpoint.
