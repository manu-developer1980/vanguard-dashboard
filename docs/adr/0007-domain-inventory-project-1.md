# 0007 - Inventario final del dominio para Proyecto 1

## Status
Accepted

## Date
2026-06-29

## Context
Antes de rehacer `schema.prisma` y consolidar el backend de `Vanguard Dashboard`, era necesario congelar el dominio funcional del Proyecto 1 para evitar seguir modelando sobre supuestos ambiguos. El sistema ya tiene decisiones cerradas sobre multi-tenancy, RBAC, planes, monitorizacion, alertado, auditoria y separacion entre plano tenant y plano plataforma.

Este ADR fija el inventario final del dominio del MVP para que Prisma, servicios, queries, constraints y pantallas se construyan sobre una base coherente.

## Alternatives
- Seguir evolucionando el esquema actual sin congelar antes el dominio.
- Documentar solo entidades sueltas dentro del roadmap.
- Consolidar el inventario completo del dominio como decision formal.

## Decision
Consolidar el dominio del Proyecto 1 con el siguiente inventario final:

### Enums
- `TenantStatus`: `PENDING`, `ACTIVE`, `SUSPENDED`
- `TenantTier`: `BASIC`, `BUSINESS`, `PREMIUM`
- `UserRole`: `TENANT_ADMIN`, `MANAGER`, `MEMBER`
- `UserStatus`: `INVITED`, `ACTIVE`, `DISABLED`
- `PlatformAdminRole`: `SUPER_ADMIN`, `SUPPORT`
- `PlatformAdminStatus`: `ACTIVE`, `DISABLED`
- `SiteStatus`: `ACTIVE`, `PAUSED`, `ARCHIVED`
- `CheckStatus`: `SUCCESS`, `DEGRADED`, `FAILURE`
- `CheckErrorType`: `HTTP_ERROR`, `TIMEOUT`, `NETWORK_ERROR`, `SSL_EXPIRING`
- `SiteHealthStatus`: `HEALTHY`, `DEGRADED`, `CRITICAL`
- `AlertType`: `AVAILABILITY`, `SSL_EXPIRING`, `LATENCY_DEGRADED`, `MANUAL`
- `AlertStatus`: `OPEN`, `ACKNOWLEDGED`, `RESOLVED`
- `AuditActorType`: `TENANT_USER`, `PLATFORM_ADMIN`
- `AuditResourceType`: `TENANT`, `USER`, `INVITATION`, `SITE`, `ALERT`, `TENANT_PLAN`, `PLATFORM_ADMIN`
- `AuditActionType`: `LOGIN`, `INVITE_CREATED`, `INVITE_REVOKED`, `USER_ACTIVATED`, `USER_DISABLED`, `ROLE_CHANGED`, `SITE_CREATED`, `SITE_UPDATED`, `SITE_PAUSED`, `SITE_ARCHIVED`, `ALERT_ACKNOWLEDGED`, `ALERT_RESOLVED`, `TENANT_SUSPENDED`, `TENANT_REACTIVATED`, `PLAN_CHANGED`

### Models
- `Tenant`
- `TenantPlan`
- `User`
- `Invitation`
- `Site`
- `CheckResult`
- `SiteHealth`
- `Alert`
- `AuditLog`
- `PlatformAdmin`

### Relaciones
- `Tenant` es la raiz del dominio y representa directamente a la organizacion cliente.
- `Tenant` tiene relacion `1 -> 1` con `TenantPlan`.
- `Tenant` tiene relacion `1 -> N` con `User`, `Invitation`, `Site`, `CheckResult`, `SiteHealth`, `Alert` y `AuditLog`.
- `User` pertenece a un solo `Tenant`.
- `PlatformAdmin` es una entidad separada y nunca impersona tenants.
- `Site` representa una sola URL `HTTP/HTTPS`.
- `Site` tiene relacion `1 -> N` con `CheckResult` y `Alert`, y `1 -> 1` con `SiteHealth`.

### Constraints e indices clave
- `Tenant.slug` unico global.
- `TenantPlan.tenantId` unico.
- `Invitation.tokenHash` unico.
- `Site.name` unico por tenant.
- `Site.url` recomendado unico por tenant.
- `SiteHealth.siteId` unico.
- Una sola alerta abierta por `site + tipo`.
- Todas las tablas de negocio relevantes deben incluir `tenantId` e indexarlo.
- `CheckResult` debe incluir tambien `tenantId` para facilitar filtrado y aislamiento.

### Reglas de negocio congeladas
- `Tenant = Organizacion`.
- `TenantPlan` gobierna limites de sites, frecuencia de checks y retencion de historico.
- Tiers del MVP:
  - `BASIC`: `10` sites, checks cada `15` minutos, retencion `7` dias.
  - `BUSINESS`: `50` sites, checks cada `5` minutos, retencion `30` dias.
  - `PREMIUM`: `200` sites, checks cada `1` minuto, retencion `90` dias.
- En downgrade se conservan datos, pero se congela el exceso.
- `Site` monitoriza `HTTP status`, `TTFB` y SSL si usa `https`.
- El umbral de latencia es configurable por `Site`.
- Las alertas de disponibilidad nacen tras `3` fallos consecutivos.
- Las alertas SSL nacen con menos de `30` dias restantes.
- `Alert` usa lifecycle `OPEN`, `ACKNOWLEDGED`, `RESOLVED`.
- `AuditLog` es aplicativo e inmutable.

## Consequences
### Positivas
- Reduce ambiguedad antes de rehacer `schema.prisma`.
- Alinea roadmap, ADRs, backend y futura UI sobre el mismo lenguaje de dominio.
- Hace mas facil justificar decisiones en portfolio y entrevistas tecnicas.
- Disminuye el riesgo de rehacer relaciones, enums o constraints a mitad del desarrollo.

### Negativas
- Congela decisiones que mas adelante podrian necesitar evolucion o ruptura controlada.
- Obliga a mantener sincronizados ADRs, esquema y codigo si el dominio cambia.
- Hace visibles recomendaciones pendientes como `Site.url` unico por tenant o unicidad global de `User.email`, que podrian revisarse en futuras iteraciones.
