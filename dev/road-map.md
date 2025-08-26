# Hoja de Ruta de Desarrollo - Local Digital Eye

Este documento describe el plan de acción para implementar las funcionalidades clave de la plataforma.

---

## 🏛️ Políticas y Principios de Desarrollo

1.  **Arquitectura General:** El proyecto será una aplicación **Full-stack monolítica** construida sobre **Next.js App Router**. Aprovecharemos las capacidades del servidor de Next.js (Server Actions, Route Handlers en `src/app/api`) para toda la lógica de backend.
2.  **Patrón de Diseño (Backend):** Implementaremos **Arquitectura Hexagonal (Puertos y Adaptadores)**.
    *   **Núcleo (Dominio):** Contendrá la lógica de negocio pura (entidades, casos de uso). Residirá en `src/domain/`.
    *   **Puertos:** Interfaces que definen la comunicación del núcleo con el exterior (ej. `UserRepositoryPort`).
    *   **Adaptadores:** Implementaciones concretas de los puertos.
        *   **Primarios (Drivers):** Server Actions, APIs que invocan los casos de uso.
        *   **Secundarios (Driven):** Conexiones a herramientas externas como Firestore, APIs de Google, Genkit. Residirán en `src/infrastructure/`.
3.  **Arquitectura de IA:** Los flujos de Genkit se tratarán como **adaptadores de infraestructura**. Un caso de uso del dominio invocará un puerto de IA, cuya implementación (`GenkitAdapter`) llamará al flujo correspondiente.
4.  **Frontend:** Usaremos **React Server Components** por defecto, componentes **ShadCN**, y **TailwindCSS**. La comunicación con el backend se hará preferentemente a través de **Server Actions**.

---

## 🔑 Leyenda de Tareas

- **🤖 (Bot):** Tareas de desarrollo que realizaré yo (Gemini).
- **👨‍🦲 (Usuario):** Tareas manuales de configuración que debes realizar tú en consolas externas (Google Cloud, Firebase, etc.).

---

## Fase 1: El Embudo Inteligente de Reseñas (MVP)

*Objetivo: Implementar el flujo principal para capturar y filtrar reseñas de clientes, maximizando las valoraciones positivas en Google y gestionando las negativas de forma interna.*

### Hito 1.1: Autenticación y Perfil de Usuario (Arquitectura Hexagonal)

- **🤖 Tarea (Dominio):**
    1.  Crear el directorio `src/domain/user`.
    2.  Definir la entidad de dominio `User` (`src/domain/user/user.entity.ts`).
    3.  Definir el puerto del repositorio `UserRepositoryPort` (`src/domain/user/user.repository.port.ts`).
    4.  Crear el caso de uso `GetUserProfileUseCase` (`src/domain/user/use-cases/get-user-profile.use-case.ts`).
- **👨‍🦲 Tarea:**
    1.  Ir a la [Consola de Firebase](https://console.firebase.google.com/).
    2.  Habilitar "Authentication" y activar el proveedor de "Google".
    3.  Asegurarse de que el dominio de la aplicación esté añadido a la lista de dominios autorizados para OAuth.
    4.  Ir a la [Consola de Google Cloud](https://console.cloud.google.com/) y habilitar la **Google People API**.
    5.  Configurar la pantalla de consentimiento de OAuth, especificando los scopes necesarios (`openid`, `email`, `profile`).
- **🤖 Tarea (Infraestructura y Adaptadores):**
    1.  Crear el directorio `src/infrastructure/firebase`.
    2.  Crear un adaptador `FirebaseUserRepository` que implemente el `UserRepositoryPort` y se comunique con Firebase Authentication.
    3.  Modificar/Crear el hook `useAuth` para que actúe como adaptador primario en el cliente, llamando a los mecanismos de autenticación.
- **🤖 Tarea (UI):**
    1.  Crear un nuevo layout y página de login/registro que utilice exclusivamente la autenticación de Google manejada por `useAuth`.

### Hito 1.2: Obtención del Place ID y Generación de Enlace/QR

- **👨‍🦲 Tarea:** Habilitar la **Google Business Profile API** en la Consola de Google Cloud.
- **🤖 Tarea (Dominio):** Definir la entidad `Business` y su repositorio/puertos en `src/domain/business/`.
- **🤖 Tarea (Infraestructura):** Crear un adaptador para la Google Business Profile API que implemente el puerto correspondiente.
- **🤖 Tarea (IA/Infraestructura):** Crear un flujo de Genkit (`ListUserBusinessesFlow`) que use el adaptador anterior para listar los negocios asociados a la cuenta del usuario.
- **🤖 Tarea (UI):** Una vez autenticado, crear una interfaz donde el usuario pueda conectar su "Google Business Profile", invocar el flujo y permitirle seleccionar un negocio para almacenar su `place_id`.
- **🤖 Tarea (UI):** Desarrollar la interfaz en el dashboard del usuario para mostrar el enlace único de reseña (`/review/[businessId]`) y generar un código QR descargable a partir de ese enlace.

### Hito 1.3: Página de Captura de Reseñas y Lógica de Filtrado

- **🤖 Tarea (UI):** Crear la página pública y dinámica `[locale]/review/[businessId]/page.tsx`. Esta página mostrará el nombre y logo del negocio.
- **🤖 Tarea (UI):** Implementar el formulario de "pre-reseña" en esa página, con el selector de estrellas y el campo de texto.
- **🤖 Tarea (UI):** Desarrollar la lógica condicional en el cliente:
    - Si la calificación es 5 estrellas, redirigir al usuario a `https://search.google.com/local/writereview?placeid=<place_id>`.
    - Si la calificación es 1-4 estrellas, mostrar campos adicionales para capturar nombre y email/teléfono.
- **🤖 Tarea (Backend - Server Action):** Crear un Server Action que actúe como adaptador primario.
- **🤖 Tarea (Dominio):** Crear el caso de uso `SubmitNegativeFeedbackUseCase`.
- **🤖 Tarea (Infraestructura):** Crear adaptadores para guardar el feedback en Firestore y para enviar una notificación por email al dueño del negocio.

---

## Fase 2: El Asistente IA para Responder Reseñas

*Objetivo: Ahorrar tiempo a los dueños de negocios generando respuestas inteligentes y personalizadas a las reseñas de Google.*

- **🤖 Tarea:** Crear un servicio que se sincronice periódicamente con la Google Business Profile API para obtener las nuevas reseñas de un negocio.
- **🤖 Tarea:** Desarrollar un flujo de Genkit avanzado que:
    1.  Analice la reseña (sentimiento, temas clave).
    2.  Genere una respuesta sugerida, tomando en cuenta el tono y la información específica del negocio.
- **🤖 Tarea:** Diseñar e implementar la interfaz en el dashboard donde el usuario pueda ver las reseñas pendientes, las respuestas sugeridas por la IA, y aprobarlas o editarlas.
- **🤖 Tarea:** Integrar la funcionalidad para publicar la respuesta aprobada directamente en Google a través de la API.

---

## Fase 3: Monitorización y Reportes SEO Local

*Objetivo: Proporcionar a los usuarios métricas claras sobre su visibilidad y rendimiento en las búsquedas locales.*

- **👨‍🦲 Tarea:** Para cada cliente que quiera este servicio, se deberá configurar el acceso a su **Google Search Console** y conceder permisos a nuestra aplicación de servicio.
- **🤖 Tarea:** Desarrollar un servicio para conectar con la API de Google Search Console y extraer métricas clave (clics, impresiones, posición media para consultas relevantes).
- **🤖 Tarea:** Desarrollar un servicio que extraiga los "Insights" de la Google Business Profile API (vistas, clics a web, llamadas).
- **🤖 Tarea:** Crear un flujo de Genkit que consolide los datos de GMB y Search Console y genere un resumen ejecutivo y recomendaciones SEO básicas.
- **🤖 Tarea:** Diseñar una nueva sección en el dashboard para visualizar estas métricas con gráficos y tablas.
- **🤖 Tarea:** Implementar un sistema de generación de reportes automáticos (semanales/mensuales) en PDF que se envíen por correo a los usuarios.

---

## Fase 4: Mejoras y Expansión

*Objetivo: Refinar las funcionalidades existentes y añadir más valor a la plataforma.*

- **🤖 Tarea:** Creación de perfiles de competidores para análisis comparativo.
- **🤖 Tarea:** Panel de analíticas avanzado con filtros por fecha y comparativas.
- **🤖 Tarea:** Sistema de notificaciones mejorado dentro de la aplicación.
