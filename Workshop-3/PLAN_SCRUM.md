# 🎯 Plan de Desarrollo Scrum - Event Platform

Plan completo de desarrollo usando metodología Scrum para completar el sistema y Workshop 4.

---

## 📋 CONFIGURACIÓN DEL PROYECTO

### Equipo Scrum
- **Product Owner:** [Nombre]
- **Scrum Master:** [Nombre]
- **Development Team:** [3-5 desarrolladores]

### Duración de Sprints
- **Sprint Length:** 2 semanas (10 días hábiles)
- **Daily Standup:** 15 minutos diarios
- **Sprint Planning:** 2 horas al inicio de cada sprint
- **Sprint Review:** 1 hora al final de cada sprint
- **Sprint Retrospective:** 1 hora al final de cada sprint

### Definition of Done (DoD)
Una tarea se considera "Done" cuando:
- ✅ Código implementado y revisado
- ✅ Tests unitarios escritos y pasando (>80% coverage)
- ✅ Tests de integración pasando
- ✅ Documentación actualizada (README, comentarios en código)
- ✅ Code review aprobado por al menos otro desarrollador
- ✅ Sin errores de linter
- ✅ Funcionalidad probada manualmente
- ✅ Integrado en la rama principal (main/develop)
- ✅ Deploy en ambiente de desarrollo exitoso

---

## 📊 PRODUCT BACKLOG

### Epic 1: Autenticación y Seguridad ⭐⭐⭐
**Prioridad:** CRÍTICA  
**Story Points:** 13

#### US-1.1: Implementar autenticación JWT en Python Backend
**Como** desarrollador del sistema  
**Quiero** que todas las rutas protegidas validen el token JWT  
**Para** garantizar la seguridad del sistema

**Criterios de Aceptación:**
- [ ] Aplicar `require_auth` a todas las rutas de eventos, tickets y órdenes
- [ ] Extraer `user_id` y `user_type` del token JWT
- [ ] Crear helper `get_current_user()` que retorne usuario desde token
- [ ] Validar que el token sea válido y no esté expirado
- [ ] Retornar 401 si el token es inválido
- [ ] Tests unitarios para validación de tokens
- [ ] Tests de integración para rutas protegidas

**Story Points:** 5  
**Sprint:** 1

---

#### US-1.2: Validación de permisos por rol
**Como** organizador de eventos  
**Quiero** que solo pueda editar/eliminar mis propios eventos  
**Para** proteger la integridad de los datos

**Criterios de Aceptación:**
- [ ] Validar que ORGANIZER solo pueda editar sus eventos
- [ ] Validar que ADMIN pueda editar cualquier evento
- [ ] Validar que BUYER no pueda crear/editar eventos
- [ ] Retornar 403 si no tiene permisos
- [ ] Tests para cada escenario de permisos

**Story Points:** 3  
**Sprint:** 1

---

#### US-1.3: Obtener IDs de usuario desde JWT
**Como** desarrollador  
**Quiero** obtener `organizer_id` y `buyer_id` del token JWT  
**Para** evitar IDs hardcodeados

**Criterios de Aceptación:**
- [ ] Obtener `user_id` del token JWT en creación de eventos
- [ ] Obtener `user_id` del token JWT en creación de órdenes
- [ ] Mapear `user_id` a `organizer_id` o `buyer_id` según contexto
- [ ] Eliminar todos los IDs hardcodeados (1)
- [ ] Tests para verificar extracción correcta de IDs

**Story Points:** 5  
**Sprint:** 1

---

### Epic 2: Gestión Completa de Eventos ⭐⭐⭐
**Prioridad:** CRÍTICA  
**Story Points:** 21

#### US-2.1: Endpoint para eventos del organizador
**Como** organizador  
**Quiero** ver una lista de mis eventos  
**Para** gestionarlos eficientemente

**Criterios de Aceptación:**
- [ ] Implementar `GET /api/events/my-events`
- [ ] Filtrar eventos por `organizer_id` del token JWT
- [ ] Retornar solo eventos del organizador actual
- [ ] Incluir estadísticas básicas (tickets vendidos, ingresos)
- [ ] Tests unitarios y de integración
- [ ] Documentación en Swagger

**Story Points:** 5  
**Sprint:** 1

---

#### US-2.2: Completar modelo de Evento
**Como** desarrollador  
**Quiero** que el modelo Event tenga todos los campos necesarios  
**Para** soportar todas las funcionalidades

**Criterios de Aceptación:**
- [ ] Agregar campo `description` (TEXT) al modelo
- [ ] Agregar campo `endDate` (DateTime) al modelo
- [ ] Crear migración de base de datos
- [ ] Actualizar schemas (EventCreate, EventResponse)
- [ ] Actualizar endpoints para incluir nuevos campos
- [ ] Validar que `endDate > startDate`
- [ ] Tests para validación de fechas

**Story Points:** 5  
**Sprint:** 2

---

#### US-2.3: Página de creación de eventos
**Como** organizador  
**Quiero** crear eventos desde el frontend  
**Para** publicar mis eventos fácilmente

**Criterios de Aceptación:**
- [ ] Crear componente `CreateEventPage.tsx`
- [ ] Formulario con todos los campos necesarios
- [ ] Validación de formulario (React Hook Form + Zod)
- [ ] Integración con `EventService.createEvent()`
- [ ] Manejo de errores y mensajes de éxito
- [ ] Redirección a detalle del evento después de crear
- [ ] Tests de componente (opcional)

**Story Points:** 5  
**Sprint:** 2

---

#### US-2.4: Página de mis eventos (organizador)
**Como** organizador  
**Quiero** ver y gestionar mis eventos  
**Para** tener control sobre mis publicaciones

**Criterios de Aceptación:**
- [ ] Crear componente `OrganizerEventsPage.tsx`
- [ ] Listar eventos del organizador usando `GET /api/events/my-events`
- [ ] Mostrar estadísticas por evento (tickets vendidos, ingresos)
- [ ] Botones para editar/eliminar eventos
- [ ] Filtros por estado (draft, published, cancelled)
- [ ] Diseño responsive y profesional
- [ ] Tests de componente (opcional)

**Story Points:** 5  
**Sprint:** 2

---

#### US-2.5: Estadísticas de eventos
**Como** organizador  
**Quiero** ver estadísticas de mis eventos  
**Para** tomar decisiones informadas

**Criterios de Aceptación:**
- [ ] Implementar `GET /api/events/{id}/statistics`
- [ ] Calcular tickets vendidos, disponibles, ingresos
- [ ] Retornar datos agregados por tipo de ticket
- [ ] Mostrar estadísticas en frontend (gráficos opcionales)
- [ ] Tests para cálculos de estadísticas

**Story Points:** 3  
**Sprint:** 3

---

### Epic 3: Proceso Completo de Compra ⭐⭐⭐
**Prioridad:** CRÍTICA  
**Story Points:** 34

#### US-3.1: Verificación de disponibilidad de tickets
**Como** comprador  
**Quiero** verificar disponibilidad antes de comprar  
**Para** evitar compras fallidas

**Criterios de Aceptación:**
- [ ] Implementar `GET /api/events/{id}/tickets/{ticket_type_id}/availability?quantity={qty}`
- [ ] Calcular tickets disponibles (quantity - tickets vendidos)
- [ ] Retornar `available: boolean` y `remainingTickets: number`
- [ ] Validar que la cantidad solicitada no exceda disponibilidad
- [ ] Tests para verificación de disponibilidad

**Story Points:** 5  
**Sprint:** 1

---

#### US-3.2: Cálculo de total de orden
**Como** comprador  
**Quiero** que se calcule correctamente el total de mi compra  
**Para** saber cuánto pagaré

**Criterios de Aceptación:**
- [ ] Calcular `total_amount` sumando precio × cantidad de cada ticket type
- [ ] Actualizar orden con `total_amount` calculado
- [ ] Validar que el total sea correcto
- [ ] Tests para cálculo de totales

**Story Points:** 3  
**Sprint:** 1

---

#### US-3.3: Creación de tickets individuales
**Como** comprador  
**Quiero** recibir tickets individuales al comprar  
**Para** tener acceso al evento

**Criterios de Aceptación:**
- [ ] Crear tickets individuales al confirmar orden
- [ ] Generar QR code único para cada ticket (UUID o similar)
- [ ] Asociar tickets a la orden
- [ ] Reducir cantidad disponible en TicketType
- [ ] Tests para creación de tickets

**Story Points:** 8  
**Sprint:** 2

---

#### US-3.4: Generación de QR codes
**Como** comprador  
**Quiero** que mis tickets tengan QR codes únicos  
**Para** validar mi entrada al evento

**Criterios de Aceptación:**
- [ ] Generar QR code único al crear ticket
- [ ] Usar librería de QR (qrcode o similar)
- [ ] Almacenar QR code en base de datos
- [ ] Endpoint para obtener QR code de un ticket
- [ ] Tests para generación de QR codes

**Story Points:** 5  
**Sprint:** 2

---

#### US-3.5: Endpoint para tickets del usuario
**Como** comprador  
**Quiero** ver mis tickets comprados  
**Para** acceder a ellos cuando los necesite

**Criterios de Aceptación:**
- [ ] Implementar `GET /api/tickets/my-tickets`
- [ ] Filtrar tickets por `buyer_id` del token JWT
- [ ] Incluir información del evento y tipo de ticket
- [ ] Retornar QR codes
- [ ] Tests unitarios y de integración

**Story Points:** 5  
**Sprint:** 2

---

#### US-3.6: Página de checkout
**Como** comprador  
**Quiero** completar mi compra en una página de checkout  
**Para** finalizar la transacción

**Criterios de Aceptación:**
- [ ] Crear componente `CheckoutPage.tsx`
- [ ] Mostrar resumen de compra (evento, tickets, total)
- [ ] Formulario de información de pago (simulado)
- [ ] Integración con `TicketService.createOrder()`
- [ ] Confirmación de compra y redirección
- [ ] Manejo de errores

**Story Points:** 5  
**Sprint:** 2

---

#### US-3.7: Confirmación de pago
**Como** comprador  
**Quiero** confirmar el pago de mi orden  
**Para** recibir mis tickets

**Criterios de Aceptación:**
- [ ] Implementar `POST /api/orders/{id}/payment`
- [ ] Cambiar estado de orden a "confirmed"
- [ ] Crear tickets al confirmar pago
- [ ] Actualizar estado de tickets a "valid"
- [ ] Tests para confirmación de pago

**Story Points:** 5  
**Sprint:** 3

---

### Epic 4: Gestión de Órdenes ⭐⭐
**Prioridad:** ALTA  
**Story Points:** 13

#### US-4.1: Endpoint para órdenes del usuario
**Como** comprador  
**Quiero** ver mis órdenes  
**Para** hacer seguimiento a mis compras

**Criterios de Aceptación:**
- [ ] Implementar `GET /api/orders/my-orders`
- [ ] Filtrar órdenes por `buyer_id` del token JWT
- [ ] Incluir información de tickets asociados
- [ ] Ordenar por fecha de compra (más reciente primero)
- [ ] Tests unitarios y de integración

**Story Points:** 5  
**Sprint:** 2

---

#### US-4.2: Cancelación de órdenes
**Como** comprador  
**Quiero** cancelar una orden pendiente  
**Para** recuperar mi dinero si cambio de opinión

**Criterios de Aceptación:**
- [ ] Implementar `POST /api/orders/{id}/cancel`
- [ ] Validar que solo se puedan cancelar órdenes "pending"
- [ ] Cambiar estado a "cancelled"
- [ ] Liberar tickets reservados (aumentar cantidad disponible)
- [ ] Tests para cancelación

**Story Points:** 5  
**Sprint:** 3

---

#### US-4.3: Solicitud de reembolso
**Como** comprador  
**Quiero** solicitar reembolso de una orden confirmada  
**Para** recuperar mi dinero si no puedo asistir

**Criterios de Aceptación:**
- [ ] Implementar `POST /api/orders/{id}/refund`
- [ ] Validar que solo órdenes "confirmed" puedan tener reembolso
- [ ] Cambiar estado a "refund_requested"
- [ ] Almacenar razón del reembolso
- [ ] Tests para solicitud de reembolso

**Story Points:** 3  
**Sprint:** 3

---

### Epic 5: Búsqueda y Filtros ⭐
**Prioridad:** MEDIA  
**Story Points:** 13

#### US-5.1: Búsqueda de eventos por texto
**Como** comprador  
**Quiero** buscar eventos por nombre o descripción  
**Para** encontrar eventos específicos rápidamente

**Criterios de Aceptación:**
- [ ] Implementar `GET /api/events/search?q={query}`
- [ ] Buscar en nombre y descripción de eventos
- [ ] Retornar eventos que coincidan (case-insensitive)
- [ ] Integrar búsqueda en frontend
- [ ] Tests para búsqueda

**Story Points:** 5  
**Sprint:** 3

---

#### US-5.2: Filtros avanzados
**Como** comprador  
**Quiero** filtrar eventos por categoría, fecha y precio  
**Para** encontrar eventos que me interesen

**Criterios de Aceptación:**
- [ ] Implementar filtro por precio máximo
- [ ] Mejorar filtro por categoría
- [ ] Mejorar filtro por fecha (rango)
- [ ] Combinar múltiples filtros
- [ ] Tests para filtros combinados

**Story Points:** 5  
**Sprint:** 3

---

#### US-5.3: Paginación de eventos
**Como** comprador  
**Quiero** ver eventos paginados  
**Para** mejorar el rendimiento con muchos eventos

**Criterios de Aceptación:**
- [ ] Implementar paginación en `GET /api/events`
- [ ] Parámetros `page` y `limit`
- [ ] Retornar metadata (total, página actual, total páginas)
- [ ] Implementar paginación en frontend
- [ ] Tests para paginación

**Story Points:** 3  
**Sprint:** 4

---

### Epic 6: Validaciones de Negocio ⭐⭐
**Prioridad:** ALTA  
**Story Points:** 13

#### US-6.1: Validaciones de eventos
**Como** organizador  
**Quiero** que el sistema valide mis eventos  
**Para** evitar errores

**Criterios de Aceptación:**
- [ ] Validar que `endDate > startDate`
- [ ] Validar que fecha no sea en el pasado
- [ ] Validar que capacidad sea > 0
- [ ] Validar que precio sea >= 0
- [ ] Tests para cada validación

**Story Points:** 5  
**Sprint:** 2

---

#### US-6.2: Validaciones de compra
**Como** comprador  
**Quiero** que el sistema valide mi compra  
**Para** evitar problemas

**Criterios de Aceptación:**
- [ ] Validar que evento esté "published" antes de vender
- [ ] Validar que no se vendan más tickets de los disponibles
- [ ] Validar límite de tickets por compra (max_tickets_per_purchase)
- [ ] Validar que fecha del evento no haya pasado
- [ ] Tests para cada validación

**Story Points:** 5  
**Sprint:** 2

---

#### US-6.3: Validación de capacidad
**Como** organizador  
**Quiero** que el sistema valide la capacidad  
**Para** evitar sobreventa

**Criterios de Aceptación:**
- [ ] Validar que tickets vendidos no excedan capacidad
- [ ] Calcular capacidad disponible correctamente
- [ ] Bloquear venta si no hay capacidad
- [ ] Tests para validación de capacidad

**Story Points:** 3  
**Sprint:** 2

---

### Epic 7: Workshop 4 - Testing y Calidad ⭐⭐⭐
**Prioridad:** CRÍTICA  
**Story Points:** 34

#### US-7.1: Tests unitarios para Java Backend
**Como** desarrollador  
**Quiero** tests unitarios completos para el backend Java  
**Para** garantizar la calidad del código

**Criterios de Aceptación:**
- [ ] Tests para AuthService (login, registro, validación)
- [ ] Tests para UserService (CRUD, validaciones)
- [ ] Tests para JwtTokenProvider
- [ ] Coverage > 80% en servicios críticos
- [ ] Todos los tests pasando

**Story Points:** 8  
**Sprint:** 4

---

#### US-7.2: Tests unitarios para Python Backend
**Como** desarrollador  
**Quiero** tests unitarios completos para el backend Python  
**Para** garantizar la calidad del código

**Criterios de Aceptación:**
- [ ] Tests para rutas de eventos (CRUD)
- [ ] Tests para rutas de tickets
- [ ] Tests para rutas de órdenes
- [ ] Tests para autenticación JWT
- [ ] Coverage > 80% en rutas críticas
- [ ] Todos los tests pasando

**Story Points:** 8  
**Sprint:** 4

---

#### US-7.3: Tests de integración
**Como** desarrollador  
**Quiero** tests de integración end-to-end  
**Para** validar el flujo completo

**Criterios de Aceptación:**
- [ ] Test de flujo completo: registro → login → crear evento → comprar ticket
- [ ] Test de autenticación entre Java y Python backend
- [ ] Test de creación de orden y tickets
- [ ] Tests de permisos y roles
- [ ] Documentación de tests

**Story Points:** 8  
**Sprint:** 4

---

#### US-7.4: Configuración de CI/CD
**Como** desarrollador  
**Quiero** pipeline de CI/CD configurado  
**Para** automatizar pruebas y despliegues

**Criterios de Aceptación:**
- [ ] Configurar GitHub Actions
- [ ] Pipeline que ejecute tests en cada PR
- [ ] Pipeline que ejecute linters
- [ ] Pipeline que construya imágenes Docker
- [ ] Documentación del pipeline

**Story Points:** 5  
**Sprint:** 5

---

#### US-7.5: Dockerización de servicios
**Como** desarrollador  
**Quiero** containerizar todos los servicios  
**Para** facilitar despliegue y desarrollo

**Criterios de Aceptación:**
- [ ] Dockerfile para Java Backend
- [ ] Dockerfile para Python Backend
- [ ] Dockerfile para React Frontend
- [ ] docker-compose.yml para desarrollo local
- [ ] docker-compose.yml para producción
- [ ] Documentación de uso

**Story Points:** 5  
**Sprint:** 5

---

### Epic 8: Workshop 4 - Testing de Carga ⭐⭐
**Prioridad:** MEDIA  
**Story Points:** 8

#### US-8.1: Tests de carga con JMeter
**Como** desarrollador  
**Quiero** tests de carga para el sistema  
**Para** validar el rendimiento

**Criterios de Aceptación:**
- [ ] Configurar JMeter para tests de carga
- [ ] Test de carga para endpoint de eventos
- [ ] Test de carga para endpoint de compra
- [ ] Identificar cuellos de botella
- [ ] Reporte de resultados

**Story Points:** 5  
**Sprint:** 5

---

#### US-8.2: Optimización de rendimiento
**Como** desarrollador  
**Quiero** optimizar el rendimiento del sistema  
**Para** soportar más usuarios concurrentes

**Criterios de Aceptación:**
- [ ] Identificar y corregir cuellos de botella
- [ ] Implementar caché donde sea necesario
- [ ] Optimizar consultas a base de datos
- [ ] Validar mejoras con tests de carga
- [ ] Documentar optimizaciones

**Story Points:** 3  
**Sprint:** 5

---

### Epic 9: Documentación y Entrega ⭐⭐
**Prioridad:** ALTA  
**Story Points:** 8

#### US-9.1: Documentación técnica completa
**Como** desarrollador  
**Quiero** documentación técnica completa  
**Para** facilitar mantenimiento

**Criterios de Aceptación:**
- [ ] Documentar arquitectura del sistema
- [ ] Documentar APIs (Swagger/OpenAPI)
- [ ] Documentar flujos de negocio
- [ ] Documentar decisiones técnicas
- [ ] README actualizado

**Story Points:** 5  
**Sprint:** 5

---

#### US-9.2: Guía de usuario
**Como** usuario final  
**Quiero** una guía de usuario  
**Para** saber cómo usar el sistema

**Criterios de Aceptación:**
- [ ] Guía para organizadores
- [ ] Guía para compradores
- [ ] Capturas de pantalla
- [ ] Video tutorial (opcional)

**Story Points:** 3  
**Sprint:** 5

---

## 🗓️ PLANIFICACIÓN DE SPRINTS

### Sprint 1: Autenticación y Seguridad (2 semanas)
**Objetivo:** Implementar autenticación JWT completa y seguridad básica

**User Stories:**
- US-1.1: Implementar autenticación JWT en Python Backend (5 SP)
- US-1.2: Validación de permisos por rol (3 SP)
- US-1.3: Obtener IDs de usuario desde JWT (5 SP)
- US-2.1: Endpoint para eventos del organizador (5 SP)
- US-3.1: Verificación de disponibilidad de tickets (5 SP)
- US-3.2: Cálculo de total de orden (3 SP)

**Total Story Points:** 26  
**Sprint Goal:** Sistema seguro con autenticación JWT funcional

---

### Sprint 2: Gestión Completa de Eventos y Compra (2 semanas)
**Objetivo:** Completar gestión de eventos y proceso de compra básico

**User Stories:**
- US-2.2: Completar modelo de Evento (5 SP)
- US-2.3: Página de creación de eventos (5 SP)
- US-2.4: Página de mis eventos (organizador) (5 SP)
- US-3.3: Creación de tickets individuales (8 SP)
- US-3.4: Generación de QR codes (5 SP)
- US-3.5: Endpoint para tickets del usuario (5 SP)
- US-3.6: Página de checkout (5 SP)
- US-4.1: Endpoint para órdenes del usuario (5 SP)
- US-6.1: Validaciones de eventos (5 SP)
- US-6.2: Validaciones de compra (5 SP)
- US-6.3: Validación de capacidad (3 SP)

**Total Story Points:** 56  
**Sprint Goal:** Sistema funcional para crear eventos y comprar tickets

---

### Sprint 3: Mejoras y Funcionalidades Adicionales (2 semanas)
**Objetivo:** Agregar funcionalidades adicionales y mejorar UX

**User Stories:**
- US-2.5: Estadísticas de eventos (3 SP)
- US-3.7: Confirmación de pago (5 SP)
- US-4.2: Cancelación de órdenes (5 SP)
- US-4.3: Solicitud de reembolso (3 SP)
- US-5.1: Búsqueda de eventos por texto (5 SP)
- US-5.2: Filtros avanzados (5 SP)

**Total Story Points:** 26  
**Sprint Goal:** Sistema con funcionalidades completas de gestión

---

### Sprint 4: Testing y Calidad (2 semanas)
**Objetivo:** Implementar tests completos y garantizar calidad

**User Stories:**
- US-7.1: Tests unitarios para Java Backend (8 SP)
- US-7.2: Tests unitarios para Python Backend (8 SP)
- US-7.3: Tests de integración (8 SP)
- US-5.3: Paginación de eventos (3 SP)

**Total Story Points:** 27  
**Sprint Goal:** Sistema con cobertura de tests > 80%

---

### Sprint 5: Workshop 4 - DevOps y Entrega (2 semanas)
**Objetivo:** Completar Workshop 4 y preparar entrega final

**User Stories:**
- US-7.4: Configuración de CI/CD (5 SP)
- US-7.5: Dockerización de servicios (5 SP)
- US-8.1: Tests de carga con JMeter (5 SP)
- US-8.2: Optimización de rendimiento (3 SP)
- US-9.1: Documentación técnica completa (5 SP)
- US-9.2: Guía de usuario (3 SP)

**Total Story Points:** 26  
**Sprint Goal:** Sistema completo, documentado y listo para producción

---

## 📈 VELOCIDAD DEL EQUIPO

### Estimación Inicial
- **Sprint 1:** 26 SP (estimado)
- **Sprint 2:** 56 SP (estimado - puede dividirse)
- **Sprint 3:** 26 SP (estimado)
- **Sprint 4:** 27 SP (estimado)
- **Sprint 5:** 26 SP (estimado)

**Total:** 161 Story Points

### Ajustes Recomendados
- **Sprint 2** tiene demasiados SP (56). Considerar:
  - Dividir en Sprint 2A y 2B
  - O mover algunas US a Sprint 3

---

## 📝 PLANTILLA DE USER STORY

```
**ID:** US-X.X
**Título:** [Título descriptivo]
**Epic:** [Epic relacionado]
**Prioridad:** [CRÍTICA/ALTA/MEDIA/BAJA]
**Story Points:** [1-13]

**Como** [rol/usuario]  
**Quiero** [acción/funcionalidad]  
**Para** [beneficio/objetivo]

**Criterios de Aceptación:**
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

**Tareas Técnicas:**
- [ ] Tarea 1
- [ ] Tarea 2

**Dependencias:**
- Depende de: [US-X.X]

**Notas:**
- Nota adicional si es necesario
```

---

## 🔄 CEREMONIAS SCRUM

### Sprint Planning
**Duración:** 2 horas  
**Participantes:** Todo el equipo  
**Agenda:**
1. Revisar Product Backlog priorizado
2. Seleccionar User Stories para el sprint
3. Descomponer US en tareas técnicas
4. Estimar esfuerzo
5. Definir Sprint Goal

### Daily Standup
**Duración:** 15 minutos  
**Participantes:** Todo el equipo  
**Preguntas:**
1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Tengo algún impedimento?

### Sprint Review
**Duración:** 1 hora  
**Participantes:** Todo el equipo + stakeholders  
**Agenda:**
1. Demostrar funcionalidades completadas
2. Revisar métricas del sprint
3. Recibir feedback
4. Actualizar Product Backlog

### Sprint Retrospective
**Duración:** 1 hora  
**Participantes:** Todo el equipo  
**Formato:**
1. ¿Qué salió bien?
2. ¿Qué se puede mejorar?
3. ¿Qué acciones tomaremos?

---

## 📊 MÉTRICAS Y SEGUIMIENTO

### Métricas por Sprint
- **Velocity:** Story Points completados
- **Burndown Chart:** Progreso del sprint
- **Cumulative Flow:** Flujo de trabajo
- **Code Coverage:** % de código con tests
- **Defect Rate:** Bugs encontrados vs corregidos

### KPIs del Proyecto
- **Sprint Goal Achievement:** % de sprints con goal cumplido
- **Definition of Done Compliance:** % de US que cumplen DoD
- **Team Velocity:** Promedio de SP por sprint
- **Technical Debt:** Deuda técnica acumulada

---

## 🎯 CRITERIOS DE ÉXITO

### Sprint 1
- ✅ Autenticación JWT funcional en Python Backend
- ✅ Permisos por rol implementados
- ✅ Endpoints básicos protegidos

### Sprint 2
- ✅ Organizadores pueden crear y gestionar eventos
- ✅ Compradores pueden comprar tickets
- ✅ Tickets se generan correctamente

### Sprint 3
- ✅ Sistema completo funcional
- ✅ Búsqueda y filtros implementados
- ✅ Gestión de órdenes completa

### Sprint 4
- ✅ Coverage de tests > 80%
- ✅ Tests de integración pasando
- ✅ Sistema estable y probado

### Sprint 5
- ✅ CI/CD configurado
- ✅ Dockerización completa
- ✅ Documentación completa
- ✅ Sistema listo para producción

---

## 📚 RECURSOS Y HERRAMIENTAS

### Herramientas de Desarrollo
- **Gestión de Proyecto:** GitHub Projects / Jira
- **Control de Versiones:** Git / GitHub
- **CI/CD:** GitHub Actions
- **Testing:** JUnit (Java), pytest (Python), Jest (React)
- **Documentación:** Swagger/OpenAPI, Markdown

### Herramientas de Testing
- **Unit Tests:** JUnit, pytest
- **Integration Tests:** TestContainers, pytest
- **Load Testing:** JMeter
- **Code Coverage:** JaCoCo (Java), coverage.py (Python)

### Herramientas de DevOps
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** (Opcional) Prometheus, Grafana

---

## 🚀 PRÓXIMOS PASOS

1. **Revisar y aprobar** este plan con el equipo
2. **Configurar** herramientas de gestión (GitHub Projects)
3. **Realizar** Sprint Planning para Sprint 1
4. **Iniciar** desarrollo según plan

---

**Última actualización:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Versión:** 1.0



