# 0006 - Estrategia de auditoria inmutable

## Status
Accepted

## Date
2026-06-29

## Context
El producto quiere demostrar trazabilidad enterprise, no solo logs tecnicos. Las acciones sensibles de tenant y de plataforma deben dejar evidencia consultable y coherente, especialmente en flujos de autenticacion, usuarios y operaciones administrativas sobre tenants.

Tambien se decidio que `PlatformAdmin` y usuarios de tenant son actores distintos, por lo que la auditoria debe poder registrar ambos tipos sin mezclar responsabilidades.

## Alternatives
- Confiar solo en logs tecnicos de infraestructura.
- Guardar auditoria mutable o editable desde la aplicacion.
- Mantener un `AuditLog` aplicativo e inmutable.

## Decision
Mantener un `AuditLog` aplicativo e inmutable para acciones sensibles del MVP, empezando por autenticacion, usuarios y operaciones de plataforma que afecten a tenants.

Cada evento debe registrar como minimo actor, accion, recurso, `requestId` y `tenantId` cuando aplique. Las acciones de `PlatformAdmin` deben auditarse siempre y, si afectan a un tenant, deben quedar asociadas tambien a ese tenant. La lectura de auditoria se limita a `TENANT_ADMIN` dentro de su tenant y a `PlatformAdmin` en solo lectura global.

## Consequences
### Positivas
- Aporta trazabilidad util para seguridad, soporte y portfolio.
- Refuerza la frontera entre acciones del tenant y acciones de plataforma.
- Permite diagnosticar impactos por request y por tenant con mejor precision.
- Encaja con la narrativa de producto orientado a fiabilidad y operacion.

### Negativas
- Incrementa volumen de escritura y superficie de modelado.
- Exige disciplina para decidir que acciones son auditables y con que detalle.
- Puede requerir mas adelante una politica de retencion o archivado si el volumen crece mucho.
