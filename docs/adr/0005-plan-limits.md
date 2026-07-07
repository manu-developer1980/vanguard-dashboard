# 0005 - Limites operativos por tier

## Status
Accepted

## Date
2026-06-29

## Context
`Vanguard Dashboard` necesita traducir planes comerciales a limites operativos reales. El tier del tenant no puede ser una etiqueta decorativa; debe afectar capacidad de monitorizacion, frescura de datos y volumen de historico retenido. Esto tambien protege infraestructura y coste de operacion.

## Alternatives
- No diferenciar planes en el MVP.
- Diferenciar planes solo por frecuencia de checks.
- Definir limites completos por tier desde el inicio.

## Decision
Definir una entidad separada `TenantPlan` con tiers `BASIC`, `BUSINESS` y `PREMIUM`, y hacer que cada tier gobierne limites reales del sistema.

Configuracion inicial:
- `BASIC`: `10` sites, checks cada `15` minutos, retencion de `7` dias.
- `BUSINESS`: `50` sites, checks cada `5` minutos, retencion de `30` dias.
- `PREMIUM`: `200` sites, checks cada `1` minuto, retencion de `90` dias.

En caso de downgrade, los datos se conservan, pero se congela el exceso y no se permite crear mas capacidad hasta volver a estar dentro de los limites del nuevo plan.

## Consequences
### Positivas
- Convierte el plan en una politica tecnica real y no en una etiqueta comercial.
- Protege coste de infraestructura y acota consumo por tenant.
- Hace visible el valor diferencial de cada tier dentro del producto.
- Facilita futuras pantallas y reglas de upgrade/downgrade.

### Negativas
- Introduce logica adicional de validacion y enforcement de limites.
- Obliga a coordinar scheduler, creacion de sites y retencion de historico con el tier.
- Requiere reglas claras de UX cuando un tenant queda congelado por exceso tras un downgrade.
