# 0002 - Separacion entre PlatformAdmin y User

## Status
Accepted

## Date
2026-06-29

## Context
El sistema necesita dos planos de control distintos:
- Plano de tenant: usuarios de la empresa cliente que operan su dashboard.
- Plano de plataforma: operadores del SaaS que gobiernan tenants, planes, suspension y herramientas globales.

Mezclar ambos perfiles en una sola entidad de usuario genera ambiguedad de permisos, complica RBAC y erosiona el aislamiento entre operador de plataforma y cliente.

## Alternatives
- Usar una sola tabla `User` con roles de tenant y plataforma mezclados.
- Usar una sola tabla `User` con usuarios sin `tenantId` para plataforma.
- Separar `PlatformAdmin` de `User`.

## Decision
Crear una entidad separada `PlatformAdmin` para el plano de plataforma y mantener `User` exclusivamente para usuarios ligados a un `Tenant`.

`PlatformAdmin` tendra sus propios roles (`SUPER_ADMIN`, `SUPPORT`), su propio lifecycle y auditoria obligatoria. No podra impersonar usuarios del tenant ni entrar al contexto funcional del cliente.

## Consequences
### Positivas
- Hace explicita la frontera entre gobierno de plataforma y operacion del tenant.
- Simplifica el modelo de permisos y evita usuarios "especiales" dentro de `User`.
- Refuerza la narrativa de seguridad y aislamiento del producto.
- Facilita auditar acciones de plataforma por separado.

### Negativas
- Introduce una entidad adicional y mas logica de autenticacion/autorizacion.
- Obliga a pensar integraciones y auditoria en dos planos distintos.
- Requiere mas cuidado al disenar pantallas y consultas globales de plataforma.
