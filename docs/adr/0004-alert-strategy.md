# 0004 - Estrategia de alertado por umbral y estado

## Status
Accepted

## Date
2026-06-29

## Context
La plataforma no debe generar ruido operativo ni falsos positivos por microcaidas o fluctuaciones temporales. El dashboard debe distinguir entre sintomas, fallos reales y situaciones resueltas, manteniendo una experiencia util para el tenant y trazable para soporte.

Tambien se decidio separar la logica de disponibilidad de la logica SSL, porque no representan el mismo tipo de riesgo.

## Alternatives
- Generar alerta ante cualquier fallo unico.
- Resolver toda la politica de alertas con un esquema binario abierto/cerrado.
- Usar umbrales y lifecycle explicito para cada alerta.

## Decision
Usar una estrategia de alertado con lifecycle explicito (`OPEN`, `ACKNOWLEDGED`, `RESOLVED`) y una unica alerta abierta por `site + tipo`.

Las alertas de disponibilidad nacen tras `3` checks fallidos consecutivos. Las alertas SSL nacen cuando faltan menos de `30` dias para expirar. Las alertas pueden resolverse de forma automatica o manual, y solo `TENANT_ADMIN` y `MANAGER` pueden reconocerlas o resolverlas dentro del tenant. `PlatformAdmin` puede verlas en solo lectura.

## Consequences
### Positivas
- Reduce ruido por fallos transitorios y mejora la calidad operativa del panel.
- Hace visible el estado real de una alerta durante su ciclo de vida.
- Evita duplicidad de alertas iguales abiertas al mismo tiempo.
- Encaja bien con dashboards corporativos y flujo de gestion de incidentes.

### Negativas
- Introduce mas logica de estado y transiciones que un modelo binario simple.
- Obliga a coordinar bien `CheckResult`, `SiteHealth` y `Alert`.
- Requiere reglas claras para resolucion automatica frente a resolucion manual.
