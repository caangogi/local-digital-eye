# Hoja de Ruta de Desarrollo - Local Digital Eye

Este documento describe el plan de acción para implementar las funcionalidades clave de la plataforma.

---

## 🏛️ Políticas y Principios de Desarrollo

1.  **Arquitectura General:** El proyecto será una aplicación **Full-stack monolítica** sobre **Next.js App Router**. Para mantener una separación clara y preparar el proyecto para una escalabilidad futura, toda la lógica de backend residirá en un directorio `src/backend`. Los puntos de entrada a este backend desde el frontend se realizarán a través de **Server Actions** o **Route Handlers** (`src/app/api`), que actuarán como la capa de presentación del backend.
2.  **Estructura del Backend (`src/backend`):** Organizaremos el código del backend siguiendo un enfoque modular y por capas, inspirado en la **Arquitectura Hexagonal**. Cada módulo de negocio (ej. `user`, `business`) tendrá su propio directorio dentro de `src/backend` con la siguiente estructura interna:
    *   `src/backend/[module]/domain/`: Contendrá la lógica de negocio pura y agnóstica a la tecnología (entidades, puertos de repositorio, etc.).
    *   `src/backend/[module]/application/`: Contendrá los casos de uso (use cases) que orquestan el flujo de datos y la lógica del dominio.
    *   `src/backend/[module]/infrastructure/`: Contendrá las implementaciones concretas de los puertos del dominio (ej. repositorios de Firebase, adaptadores de APIs externas como Google, flujos de Genkit).
3.  **Arquitectura de IA:** Los flujos de Genkit se tratarán como **adaptadores de infraestructura**. Un caso de uso de la capa de aplicación invocará un puerto definido en el dominio, y un adaptador en la capa de infraestructura implementará ese puerto llamando al flujo de Genkit correspondiente.
4.  **Frontend:** Usaremos **React Server Components** por defecto, componentes **ShadCN**, y **TailwindCSS**. La comunicación con el backend se hará preferentemente a través de **Server Actions** que invocarán los casos de uso de la capa de aplicación.

---

## 🔑 Leyenda de Tareas

- **🤖 (Bot):** Tareas de desarrollo que realizaré yo (Gemini).
- **👨‍🦲 (Usuario):** Tareas manuales de configuración que debes realizar tú en consolas externas (Google Cloud, Firebase, etc.).

---

## Fase 1: El Embudo Inteligente de Reseñas (MVP) - ✅ COMPLETADA

*Objetivo: Implementar el flujo principal para capturar y filtrar reseñas de clientes, maximizando las valoraciones positivas en Google y gestionando las negativas de forma interna.*

### Hito 1.1: Autenticación y Perfil de Usuario (Arquitectura Hexagonal) - ✅

- **✅ 🤖 Tarea (Backend - Configuración):** Instalar las dependencias de Firebase: `firebase` (SDK de cliente para el frontend) y `firebase-admin` (SDK de Admin para el backend).
- **✅ 👨‍🦲 Tarea:** Ir a la [Consola de Firebase](https://console.firebase.google.com/) -> Configuración del proyecto -> Cuentas de servicio. Generar una nueva clave privada (archivo JSON) para el SDK de Admin y guardarla de forma segura en el proyecto (por ejemplo, en variables de entorno).
- **✅ 🤖 Tarea (Backend - Dominio):**
    1.  Crear la estructura de directorios: `src/backend/user/domain/`, `src/backend/user/application/`, `src/backend/user/infrastructure/`.
    2.  Definir la entidad de dominio `User` (`src/backend/user/domain/user.entity.ts`).
    3.  Definir el puerto del repositorio `UserRepositoryPort` (`src/backend/user/domain/user.repository.port.ts`).
- **✅ 🤖 Tarea (Backend - Aplicación):**
    1.  Crear los casos de uso para el `User`: `GetUserProfileUseCase`, `CreateOrUpdateUserUseCase`, `DeleteUserUseCase`.
- **✅ 👨‍🦲 Tarea:**
    1.  Ir a la [Consola de Firebase](https://console.firebase.google.com/).
    2.  Habilitar "Authentication" y activar el proveedor de "Google".
    3.  Asegurarse de que el dominio de la aplicación esté añadido a la lista de dominios autorizados para OAuth.
- **✅ 🤖 Tarea (Backend - Infraestructura):**
    1.  Crear un adaptador `FirebaseUserRepository` que implemente el `UserRepositoryPort` (`src/backend/user/infrastructure/firebase-user.repository.ts`).
- **✅ 🤖 Tarea (Integración Frontend):**
    1.  Modificar/Crear el hook `useAuth` para que actúe como adaptador primario en el cliente, invocando los mecanismos de autenticación de Firebase.
    2.  Crear un nuevo layout y página de login/registro que utilice exclusivamente la autenticación de Google manejada por `useAuth`.

### Hito 1.2: Conectar Negocio y Generar Activos de Reseña - ✅

- **✅ 👨‍🦲 Tarea:** Habilitar la **Places API** en la Consola de Google Cloud para poder buscar y validar negocios.
- **✅ 🤖 Tarea (Backend - Dominio):**
    1. Crear la estructura de directorios: `src/backend/business/domain/`, `application/`, `infrastructure/`.
    2. Definir la entidad `Business` (`business.entity.ts`) con campos como `id`, `userId`, `placeId`, `name`, `reviewLink`.
    3. Definir el puerto `BusinessRepositoryPort` (`business.repository.port.ts`) con métodos `save`, `findById`, `findByUserId`, `delete`.
- **✅ 🤖 Tarea (Backend - Aplicación):**
    1. Crear `ConnectBusinessUseCase`: Lógica para buscar un negocio usando la Places API, obtener su `placeId` y guardarlo asociado al usuario.
    2. Crear `ListUserBusinessesUseCase`: Lógica para listar todos los negocios de un usuario.
    3. Crear `GetBusinessDetailsUseCase`: Lógica para obtener la información de un negocio específico, incluyendo su enlace de reseña y QR.
    4. Crear `DisconnectBusinessUseCase`: Lógica para desvincular un negocio de un usuario.
- **✅ 🤖 Tarea (Backend - Infraestructura):**
    1. Crear `FirebaseBusinessRepository` que implemente el `BusinessRepositoryPort` usando Firestore.
    2. Crear `GooglePlacesAdapter` para buscar la información de los negocios. Este adaptador será usado por el `ConnectBusinessUseCase`.
- **✅ 🤖 Tarea (Frontend - UI):**
    1. Crear una interfaz donde el usuario pueda buscar su negocio.
    2. Mostrar los resultados y permitirle "conectar" el correcto.
    3. En el dashboard, listar los negocios conectados y mostrar para cada uno su enlace único de reseña y un botón para generar/descargar el código QR.

### Hito 1.3: Página de Captura de Reseñas y Lógica de Filtrado - ✅

- **✅ 🤖 Tarea (Frontend - UI):** Crear la página pública y dinámica `[locale]/review/[businessId]/page.tsx`. Esta página mostrará el nombre y logo del negocio.
- **✅ 🤖 Tarea (Frontend - UI):** Implementar el formulario de "pre-reseña" en esa página, con el selector de estrellas y el campo de texto.
- **✅ 🤖 Tarea (Frontend - UI):** Desarrollar la lógica condicional en el cliente:
    - Si la calificación es 5 estrellas, redirigir al usuario a `https://search.google.com/local/writereview?placeid=<place_id>`.
    - Si la calificación es 1-4 estrellas, mostrar campos adicionales para capturar nombre y email/teléfono.
- **✅ 🤖 Tarea (Backend - Server Action):** Crear un Server Action que actúe como adaptador primario.
- **✅ 🤖 Tarea (Backend - Aplicación):** Crear el caso de uso `SubmitNegativeFeedbackUseCase`.
- **✅ 🤖 Tarea (Backend - Infraestructura):** Crear adaptadores para guardar el feedback en Firestore y para enviar una notificación por email al dueño del negocio.

---

## Fase 2: Vinculación Segura y Asistente de Reseñas IA

*Objetivo: Validar la propiedad de los perfiles de negocio a través de Google y ahorrar tiempo a los dueños generando respuestas inteligentes y personalizadas a las reseñas.*

### Hito 2.1: Validación de Propiedad del Negocio (OAuth 2.0)

- **✅ 👨‍🦲 Tarea:** Habilitar la **Google Business Profile API** en la Consola de Google Cloud para leer y responder reseñas.
- **✅ 👨‍🦲 Tarea:** Configurar la **Pantalla de Consentimiento de OAuth** en la Google Cloud Console, añadiendo el nombre de la app, email de soporte y los emails de los usuarios de prueba.
- **✅ 👨‍🦲 Tarea:** Crear unas credenciales de **ID de cliente de OAuth 2.0** para "Aplicación web", configurando la URI de redirección autorizada (ej. `http://localhost:9002/api/oauth/callback`).
- **✅ 👨‍🦲 Tarea:** Guardar el **ID de cliente** y el **Secreto de cliente** en el archivo `.env.local` como `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
- **🤖 Tarea (Backend - Autorización):** Implementar el flujo de conexión con OAuth 2.0. Un botón "Conectar Perfil de Google" iniciará el proceso para que el usuario, usando la cuenta de Google con la que gestiona su negocio, otorgue permisos a la aplicación para gestionar sus reseñas (`business.reviews`).
- **🤖 Tarea (Backend - Infraestructura):** Crear un servicio para almacenar de forma segura los tokens de acceso y de refresco de OAuth, asociándolos al `businessId`.
- **🤖 Tarea (Backend - Revocación):** Implementar la lógica para manejar tokens revocados. Si la API de Google devuelve un error de autenticación, marcar el negocio como "Requiere reconexión" y notificar al usuario.

### Hito 2.2: Gestión de Reseñas con IA

- **🤖 Tarea (Backend - Sincronización):** Crear un servicio (ej. un cron job o un trigger de Firestore) que use los tokens para sincronizarse periódicamente con la Google Business Profile API y obtener las nuevas reseñas.
- **🤖 Tarea (Backend - IA):** Desarrollar un flujo de Genkit avanzado (adaptador de infraestructura) que:
    1.  Analice la reseña (sentimiento, temas clave).
    2.  Genere una respuesta sugerida, tomando en cuenta el tono y la información específica del negocio.
- **🤖 Tarea (Frontend - UI):** Diseñar e implementar la interfaz en el dashboard donde el usuario pueda ver las reseñas pendientes, las respuestas sugeridas por la IA, y aprobarlas o editarlas.
- **🤖 Tarea (Integración API):** Integrar la funcionalidad para publicar la respuesta aprobada directamente en Google a través de la API.


---

## Fase 3: Monitorización y Reportes SEO Local

*Objetivo: Proporcionar a los usuarios métricas claras sobre su visibilidad y rendimiento en las búsquedas locales.*

- **👨‍🦲 Tarea:** Para cada cliente que quiera este servicio, se deberá configurar el acceso a su **Google Search Console** y conceder permisos a nuestra aplicación de servicio.
- **🤖 Tarea:** Desarrollar un adaptador de infraestructura para conectar con la API de Google Search Console y extraer métricas clave.
- **🤖 Tarea:** Desarrollar un adaptador que extraiga los "Insights" de la Google Business Profile API.
- **🤖 Tarea:** Crear un flujo de Genkit (adaptador de infraestructura) que consolide los datos y genere un resumen ejecutivo y recomendaciones SEO básicas.
- **🤖 Tarea:** Diseñar una nueva sección en el dashboard para visualizar estas métricas con gráficos y tablas.
- **🤖 Tarea:** Implementar un sistema de generación de reportes automáticos (semanales/mensuales) en PDF que se envíen por correo a los usuarios.

---

## Fase 4: Mejoras y Expansión

*Objetivo: Refinar las funcionalidades existentes y añadir más valor a la plataforma.*

- **🤖 Tarea (Roles y Permisos):** Implementar un sistema de roles (ej. Administrador, Usuario).
- **🤖 Tarea (Flujo de Aprobación):**
    1. Añadir un campo de `status` (`pending_approval`, `approved`, `rejected`) a la entidad `Business`.
    2. Crear una vista en el panel de administrador para que pueda revisar y aprobar los nuevos negocios que se vinculan.
    3. Implementar notificaciones para informar al usuario sobre el estado de su solicitud.
- **🤖 Tarea:** Creación de perfiles de competidores para análisis comparativo.
- **🤖 Tarea:** Panel de analíticas avanzado con filtros por fecha y comparativas.
- **🤖 Tarea:** Sistema de notificaciones mejorado dentro de la aplicación.

    
