# ROADMAP: Vanguard Core Engine & Platform Architecture

Este documento define la hoja de ruta del portafolio tecnico de Manolo con un objetivo claro: convertir experiencia operativa real en evidencia visible de criterio arquitectonico, ejecucion full-stack y ownership de plataforma. Los tres proyectos no son piezas aisladas; forman una progresion coherente:

1. **Proyecto 1**: construir el core SaaS multi-tenant.
2. **Proyecto 2**: escalar capacidades mediante procesamiento asincrono desacoplado.
3. **Proyecto 3**: endurecer fiabilidad, auditoria y operacion bajo fallo.

## Como completar este roadmap

Cada proyecto incluye una primera version de:
- `Problem Statement`
- `Constraints & Risks`
- `Trade-offs`
- `Observability & Mitigation`
- `Milestones`
- `Definition of Done`
- `Portfolio Evidence`

Tambien incluye `Preguntas guia`. Esas preguntas existen para forzarte a pensar como arquitecto, no como ejecutor de features. Si una seccion no se puede responder con claridad, la arquitectura todavia no esta madura.

---

## Proyecto 1: Vanguard Dashboard Core (Multi-tenant Access & Monitoring)

**Proposito**
Construir el nucleo real de `Vanguard Dashboard`: una plataforma B2B multi-tenant donde cada organizacion administra empleados, sitios `Web/API` monitorizados, alertas y configuracion operativa sin contaminar datos ni permisos con otras empresas.

**Senal profesional**
Capacidad para disenar un panel corporativo serio donde multi-tenancy, RBAC, telemetria operativa, tiers de servicio y aislamiento de datos son requisitos de negocio visibles tanto en backend como en interfaz.

### Problem Statement
Empresas distintas necesitan operar desde una misma aplicacion para gestionar su organizacion, invitar empleados y monitorizar sus propios sitios `Web/API`. El sistema debe mostrar estado HTTP, latencia (`TTFB`) y dias restantes de certificado SSL, generando alertas utiles sin falsos positivos y aislando por completo datos, usuarios, checks, alertas y configuraciones entre tenants.

### Constraints & Risks
- Riesgo de fuga de datos si cualquier consulta omite el filtro `tenantId` en usuarios, sitios, checks, alertas o configuraciones.
- Riesgo de confusion de permisos si no se separa con claridad el plano `Platform Admin` del plano `Tenant Admin`.
- Riesgo de estados inconsistentes si el alta inicial de organizacion, tenant y admin no se ejecuta de forma atomica.
- Riesgo de falsos positivos por `flapping` si una alerta nace por un unico fallo puntual en vez de por umbral repetido.
- Riesgo de sobreconsumo de infraestructura si la frecuencia de checks no se acota por `tier`.
- Riesgo de contratos rotos si el dashboard frontend y los modelos backend divergen sobre que significa la salud de un `Site`.

### Trade-offs
- **Aislamiento logico vs aislamiento fisico**: se prioriza aislamiento logico por velocidad de construccion, coste y valor de portfolio, aceptando enforcement estricto en esquema, servicios y filtros de consulta.
- **JWT como contexto tenant vs resolucion por header/subdominio**: se prioriza `JWT` como fuente principal de `tenantId` para simplificar sesion autenticada y reducir dependencia de input manual por request.
- **Checks programados propios vs agentes externos desde el inicio**: se priorizan checks programados controlados por la plataforma para acotar el MVP y demostrar la arquitectura base de monitorizacion sin abrir demasiadas variables operativas.
- **Governance externo de Platform Admin vs impersonacion interna**: se prioriza que `Platform Admin` gestione tenants desde fuera para reforzar aislamiento, auditoria y separacion de responsabilidades.

### Observability & Mitigation
- Logs estructurados por request y por check con `requestId`, `tenantId`, `userId`, `siteId`, resultado HTTP, latencia, dias restantes de SSL y timestamp.
- Registro explicito de errores de autorizacion, intentos cross-tenant, cambios de `tier`, suspensiones de tenant y operaciones sensibles de `Platform Admin`.
- Politica de alerta por disponibilidad basada en `3` checks fallidos consecutivos para reducir falsos positivos por microcaidas.
- Politica de alerta SSL separada de disponibilidad: se activa cuando restan menos de `30` dias para renovar el certificado.
- Soporte de estado `paused/maintenance` para que un `Site` no dispare alertas durante ventanas controladas.
- Pruebas dirigidas a fuga de datos, enforcement RBAC, scheduler por `tier` y degradacion correcta del dashboard cuando un check falla.

### Milestones
1. Modelar `Organization`, `Tenant`, `User`, `Invitation`, `Site`, `CheckResult`, `Alert`, `SiteHealth`, `AuditLog` y `TenantPlan` con indices compuestos por `tenantId`.
2. Implementar provisioning atomico de organizacion + tenant + `Tenant Admin` usando `$transaction`.
3. Construir autenticacion con `JWT`, resolucion de contexto tenant y separacion de permisos entre `Platform Admin` y `Tenant Admin`.
4. Implementar flujo de invitaciones y gestion de empleados dentro del tenant.
5. Exponer CRUD de `Sites` monitorizados con configuracion de umbral de latencia y estado `paused/maintenance`.
6. Implementar scheduler o worker de checks programados segun `tier` y persistencia de `CheckResult`.
7. Calcular `SiteHealth`, reglas de alertado y vista principal del dashboard con sitios, logs de estado y alertas activas.
8. Dejar preparado el punto de extension para el centro de reportes asincronos y la capa de observabilidad avanzada de los proyectos siguientes.

### Definition of Done
- El sistema provisiona una organizacion con su `Tenant Admin` de forma atomica.
- `Tenant Admin` puede invitar y gestionar empleados de su empresa sin visibilidad de otros tenants.
- `Platform Admin` puede suspender tenants, ajustar tiers y operar a nivel plataforma sin entrar al contexto funcional del cliente.
- Cada `Site` monitorizado soporta metricas de `HTTP status`, `TTFB` y dias restantes de SSL.
- La frecuencia de checks depende del `tier` del tenant y queda restringida por plan.
- Las alertas de disponibilidad nacen tras `3` fallos consecutivos y las alertas SSL con menos de `30` dias restantes.
- El dashboard muestra sitios, estado de salud, historico de checks y alertas activas solo dentro del tenant correcto.
- Existe evidencia reproducible de bloqueo cross-tenant y trazabilidad de operaciones sensibles.

### Portfolio Evidence
- Demo del flujo de alta de organizacion, provision inicial y primer acceso de `Tenant Admin`.
- Vista del dashboard con tabla o grid de `Sites`, metricas de salud, latencia, SSL y alertas activas.
- Diagrama de dominio mostrando separacion entre `Platform Admin`, `Tenant Admin` y recursos multi-tenant.
- Fragmento del esquema Prisma con indices compuestos y relaciones clave por `tenantId`.
- Caso de prueba o demo que muestre bloqueo de acceso cross-tenant en usuarios, sitios y alertas.
- Evidencia de scheduler por `tier` y disparo de alertas por `3` fallos consecutivos.
- README tecnico que justifique por que `Platform Admin` no impersona tenants y como se protege la plataforma.

### Preguntas guia
- Que limites concretos por `tier` quieres aplicar ademas de la frecuencia de checks: numero de `Sites`, usuarios o retencion de historico?
- El umbral de latencia configurable se define por `Site`, por plantilla o por tenant completo?
- Que datos minimos debe ver `Platform Admin` para diagnosticar un tenant sin romper el aislamiento funcional?
- Que aspecto visual demostrara mejor la diferencia entre `warning`, `critical`, `paused` y `ssl-expiring` dentro del dashboard?
- Que flujo del dashboard quieres usar como demo principal en portfolio: invitacion de empleados, alta de `Site` o escalado de alerta?

---

## Proyecto 2: Event-Driven File Processor (Procesador Asincrono de Archivos)

**Proposito**
Demostrar desacoplamiento entre peticion HTTP y trabajo pesado mediante colas, almacenamiento de objetos y workers asincronos sobre infraestructura local emulada.

**Senal profesional**
Capacidad para disenar flujos no bloqueantes, tolerantes a fallos y preparados para crecer sin cargar el hilo principal de Node.js.

### Problem Statement
Una plataforma B2B puede necesitar importar reportes, auditorias o lotes de datos pesados. Procesarlos sincronicamente degrada latencia, bloquea recursos y deteriora la experiencia del usuario. El sistema debe aceptar archivos, persistir el objeto, encolar el trabajo y procesarlo en segundo plano de forma segura.

### Constraints & Risks
- Riesgo de bloqueo del request si el parseo ocurre en el flujo HTTP.
- Riesgo de perdida o duplicacion de trabajo si el estado del job no se modela correctamente.
- Riesgo de corrupcion funcional si archivos invalidos entran a la cola sin validacion previa.
- Riesgo de inconsistencias entre almacenamiento, cola y base de datos si no se define orden de operaciones.
- Riesgo de ruido operativo si el sistema reintenta sin limites ni DLQ.

### Trade-offs
- **Procesamiento sincrono vs asincrono**: se prioriza asincronia para proteger latencia y escalabilidad, aceptando mayor complejidad operacional.
- **Worker embebido vs proceso separado**: se prioriza proceso separado para demostrar desacoplamiento real, aceptando mas piezas en local.
- **LocalStack vs AWS real**: se prioriza LocalStack para practicar patrones cloud offline y abaratar iteracion, aceptando diferencias menores frente al proveedor real.

### Observability & Mitigation
- Estado persistido del job: `PENDING`, `PROCESSING`, `FAILED`, `COMPLETED`.
- Correlation IDs desde la subida del archivo hasta el worker.
- Logs estructurados de publicacion en SQS, consumo, reintentos y envio a DLQ.
- Metricas basicas de jobs procesados, fallidos y tiempo medio de ejecucion.
- Validacion temprana de tipo de archivo, tamano y esquema esperado.

### Milestones
1. Modelar entidad de job de importacion y estados de procesamiento.
2. Integrar subida de archivos a S3 en LocalStack.
3. Publicar evento a SQS tras persistir metadata y confirmar archivo.
4. Implementar worker desacoplado con parseo, actualizacion de estado y manejo de reintentos.
5. Anadir DLQ y flujo observable de error controlado.

### Definition of Done
- El request HTTP devuelve control rapido sin procesar el archivo completo en linea.
- El archivo queda almacenado y asociado a un job persistido.
- El worker consume mensajes de forma independiente y actualiza estado en DB.
- Los fallos recuperables reintentan y los irreparables terminan en DLQ.
- Existe trazabilidad completa desde subida hasta resultado final.
- Todo el flujo funciona en local usando PostgreSQL + LocalStack.

### Portfolio Evidence
- Secuencia visual del flujo `upload -> S3 -> SQS -> worker -> DB`.
- Demo de un archivo correcto y otro fallido.
- Captura o tabla con estados del job y transiciones.
- Explicacion de por que se eligio un worker desacoplado.
- Evidencia de reintentos y DLQ como mecanismo de resiliencia.

### Preguntas guia
- Que caso de uso empresarial tiene mas fuerza para esta importacion: usuarios, pedidos, auditorias o facturas?
- Que debe pasar si el archivo sube bien pero falla la publicacion en cola?
- Como vas a evitar que el mismo mensaje procese dos veces el mismo job?
- Que politica de reintentos tiene sentido para un error de red frente a un CSV corrupto?
- Que va a ver un reviewer para entender que aqui hay arquitectura de eventos y no solo subida de ficheros?

---

## Proyecto 3: Observability & Chaos Engine (Motor de Telemetria y Simulacion)

**Proposito**
Convertir experiencia real de soporte e incidentes en software preparado para diagnosticar, auditar, degradar con control y recuperarse sin improvisacion.

**Senal profesional**
Capacidad para pensar en fiabilidad, trazabilidad y operacion desde el diseno, no solo despues de que el sistema falle.

### Problem Statement
Un sistema de portfolio serio no debe limitarse a funcionar en happy path. Debe mostrar que puede registrar acciones sensibles, correlacionar errores, degradar de forma segura y ofrecer informacion util cuando algo se rompe. Este proyecto endurece la plataforma base con auditoria, logging, caos controlado y apagado seguro.

### Constraints & Risks
- Riesgo de no poder reconstruir incidentes si no existe auditoria estructurada.
- Riesgo de ceguera operativa si los logs carecen de contexto como `tenantId`, `requestId` o accion ejecutada.
- Riesgo de perdida de datos o corrupcion si el proceso muere sin cerrar recursos correctamente.
- Riesgo de feature peligrosa si los endpoints de caos no quedan estrictamente limitados a desarrollo.
- Riesgo de falsas conclusiones si el sistema falla pero no diferencia errores esperados, transitorios y fatales.

### Trade-offs
- **Logging detallado vs ruido**: se prioriza contexto estructurado suficiente para diagnostico, aceptando coste extra de volumen y curacion de eventos.
- **Chaos controlado vs simplicidad**: se incorpora caos de desarrollo para demostrar resiliencia, aceptando mas superficie tecnica que mantener.
- **Audit log aplicativo vs solo logs de infraestructura**: se prioriza auditoria de negocio para responder al "quien hizo que", aceptando mas escritura en base de datos.

### Observability & Mitigation
- Audit logs inmutables para acciones de negocio sensibles.
- Logging JSON estructurado con contexto de peticion y tenant.
- Catalogo minimo de errores operativos: validacion, autorizacion, dependencia, timeout y error interno.
- Endpoint o mecanismo controlado para simular latencia, caida de dependencia y cierre inesperado en desarrollo.
- Graceful shutdown para HTTP server, Prisma y workers.

### Milestones
1. Definir modelo de audit log y eventos relevantes de negocio.
2. Integrar logger estructurado y propagar contexto por request.
3. Normalizar clasificacion de errores y respuestas consistentes.
4. Implementar mecanismos de caos controlado solo en desarrollo.
5. Anadir graceful shutdown y validacion de recuperacion limpia.

### Definition of Done
- Las acciones sensibles generan audit logs consultables.
- Cada error relevante incluye contexto suficiente para diagnostico.
- El sistema puede simular al menos dos fallos controlados en desarrollo.
- El apagado del proceso cierra conexiones y deja el sistema en estado consistente.
- Existe evidencia demostrable de degradacion controlada y recuperacion.

### Portfolio Evidence
- Tabla o vista de audit logs con contexto multi-tenant.
- Ejemplos de logs estructurados con `tenantId` y `requestId`.
- Demo de un fallo inyectado y como se detecta.
- Explicacion de graceful shutdown y por que importa en produccion.
- Narrativa directa que conecte tu experiencia de incidentes con decisiones de diseno preventivo.

### Preguntas guia
- Que accion de negocio merece auditoria obligatoria desde el dia uno?
- Que campos minimos debe llevar cada log para que sirva de verdad en un incidente?
- Que fallo simulado comunica mejor madurez tecnica en portfolio: latencia, DB down o worker colgado?
- Como demostraras que el caos esta controlado y no es una feature peligrosa?
- Que historia profesional quieres que vea un reviewer cuando llegue a esta parte del roadmap?
