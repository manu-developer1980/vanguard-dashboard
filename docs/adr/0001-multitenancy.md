# 0001 - Multitenancy con tenantId

## Status
Accepted

## Date
2026-06-29

## Context
`Vanguard Dashboard` debe servir a multiples empresas desde una sola plataforma compartida. Cada empresa necesita gestionar sus usuarios, sites monitorizados, alertas, configuracion y reportes sin mezclar datos con otros tenants. El objetivo del MVP es demostrar aislamiento fuerte, velocidad de construccion y coste razonable de operacion.

Tambien se decidio que `Tenant = Organizacion`, por lo que la entidad `Tenant` representa directamente a la empresa cliente dentro del sistema.

## Alternatives
- Base de datos por cliente.
- Schema por cliente.
- Aislamiento logico por `tenantId`.

## Decision
Usar aislamiento logico por `tenantId` en todas las tablas de negocio relevantes.

El `tenantId` se resolvera desde el contexto autenticado del usuario y se aplicara de forma explicita en la capa de servicios y consultas. El esquema de datos usara indices compuestos y constraints alineados con este patron para reducir riesgo de fuga de datos y mantener buen rendimiento.

## Consequences
### Positivas
- Reduce complejidad operativa frente a base de datos o schema por cliente.
- Facilita despliegue, migraciones y evolucion del producto en fase MVP.
- Encaja bien con la narrativa de portfolio centrada en arquitectura SaaS B2B.
- Permite demostrar aislamiento fuerte sin multiplicar infraestructura.

### Negativas
- Requiere enforcement estricto del `tenantId` en servicios, queries e indices.
- Aumenta el impacto potencial de errores de filtrado si la disciplina tecnica falla.
- Exige revisar con cuidado todos los accesos a datos para evitar `data leaks`.
