
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, UserCog, CheckCircle, ShieldCheck, Database, Layers, GitBranch, KeyRound, Lock, DollarSign, Sparkles, FolderSync, KanbanSquare, Table, MailCheck, MemoryStick } from "lucide-react";
import React from 'react';

export async function generateMetadata() {
  return {
    title: "Hoja de Ruta: La Plataforma"
  };
}

const developmentPrinciples = [
  { 
    icon: <GitBranch className="h-8 w-8 text-cyan-500" />,
    title: "Arquitectura Hexagonal (Puertos y Adaptadores)",
    description: "El núcleo de la lógica de negocio (dominio y aplicación) será puro y agnóstico a la tecnología. La base de datos, las APIs externas y la UI serán 'plugins' intercambiables, garantizando flexibilidad y facilidad para las pruebas."
  },
  { 
    icon: <Layers className="h-8 w-8 text-purple-500" />,
    title: "Separación Estricta: Server y Client",
    description: "Aprovecharemos al máximo los Server Components de Next.js para la obtención de datos y la seguridad. Los Componentes de Cliente se usarán solo cuando la interactividad sea necesaria, evitando errores de hidratación y optimizando el rendimiento."
  },
  { 
    icon: <Database className="h-8 w-8 text-green-500" />,
    title: "Fuente Única de Verdad",
    description: "Nuestra base de datos (Firestore) es la fuente de verdad para los datos internos (CRM, estado de suscripción, etc.). Las APIs externas (Google Places) son una fuente de datos públicos que enriquecen nuestra información, pero no la gobiernan."
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
    title: "Flujos de Permisos Seguros y Explícitos",
    description: "La conexión con servicios de terceros (Google, Stripe) siempre será iniciada y autorizada por el usuario final (Dueño del Negocio) a través de flujos seguros como OAuth, nunca directamente por el Asistente de Ventas."
  }
];

const phases = [
  {
    phase: "Hito 0",
    title: "Configuración y Estructura del Proyecto",
    description: "Tareas iniciales para establecer una base sólida para el proyecto, incluyendo la estructura de rutas y la configuración de la arquitectura.",
    milestones: [
       {
        title: "Hito 0.1: Estructuración del Enrutamiento por Roles",
        icon: <FolderSync />,
        tasks: [
          { who: "bot", text: "Reestructurar las carpetas de la aplicación para eliminar los conflictos de rutas paralelas y crear la base para el enrutamiento basado en roles (admin/owner).", completed: true },
        ]
      }
    ]
  },
  {
    phase: "Fase 1",
    title: "Fundación de la Plataforma y Reconstrucción del CRM",
    description: "Reconstruir las funcionalidades existentes sobre la nueva arquitectura sólida. El objetivo es tener un panel para el Asistente de Ventas 100% funcional y robusto, integrando el CRM desde el inicio.",
    milestones: [
      {
        title: "Hito 1.1: Definición del Dominio y la Infraestructura Central",
        icon: <Database />,
        tasks: [
          { who: "bot", text: "Refinar la entidad `Business` para incluir todos los campos públicos de Google Places y los campos del CRM (`leadScore`, `salesStatus`, `customTags`, `notes`, `nextContactDate`, `gmbStatus`, etc.).", completed: true },
          { who: "bot", text: "Crear la entidad `User` con un campo `role` ('admin' | 'owner' | 'super_admin') para manejar los permisos futuros.", completed: true },
          { who: "bot", text: "Implementar `FirebaseBusinessRepository` y `FirebaseUserRepository` para que coincidan exactamente con las nuevas entidades, manejando la conversión de Timestamps y los nuevos campos.", completed: true },
          { who: "bot", text: "Adaptar los Casos de Uso existentes (`ConnectBusiness`, `ListUserBusinesses`, etc.) para que operen con las nuevas entidades y la lógica del repositorio.", completed: true }
        ]
      },
      {
        title: "Hito 1.2: Reimplementación del Panel del Asistente de Ventas",
        icon: <KanbanSquare />,
        tasks: [
          { who: "bot", text: "Reconstruir la página de Prospección (`/businesses/add`) para usar el nuevo `ConnectBusinessUseCase` a través de un Server Action.", completed: true },
          { who: "bot", text: "Reconstruir la página de listado (`/businesses`) con sus dos vistas: Lista y Pipeline (Kanban).", completed: true },
          { who: "bot", text: "Asegurar que la vista de Pipeline permita arrastrar y soltar para cambiar el `salesStatus`, llamando a un `UpdateBusinessStatusUseCase`.", completed: true },
          { who: "bot", text: "Reconstruir el panel lateral (Sheet) que se abre al hacer clic en un negocio, permitiendo la edición de los campos del CRM (`notes`, `customTags`, etc.) a través de un `UpdateBusinessDetailsUseCase`.", completed: true },
        ]
      },
       {
        title: "Hito 1.3: Reconstrucción de la Página Pública y el Embudo de Reseñas",
        icon: <Table />,
        tasks: [
          { who: "bot", text: "Crear la nueva página pública de negocio (`/negocio/[businessId]`) como un Server Component que obtiene los datos y los pasa a un Componente de Cliente para su renderización.", completed: true },
          { who: "bot", text: "Implementar el embudo de valoración: 5 estrellas redirige al enlace de reseña de Google; menos de 5 estrellas muestra el formulario de feedback.", completed: true },
          { who: "bot", text: "Crear la entidad y el repositorio para `Feedback` y el `SubmitNegativeFeedbackUseCase` que guarda el feedback y notifica al Asistente de Ventas (por ahora).", completed: true },
        ]
      },
    ]
  },
  {
    phase: "Fase 2",
    title: "Onboarding del Dueño del Negocio y Gestión de Suscripciones",
    description: "Introducir el rol de 'Dueño de Negocio' en la plataforma. Implementar el flujo de invitación seguro y la gestión de planes (Freemium y de pago con Stripe).",
    milestones: [
        {
            title: "Hito 2.0: Verificación de Email Obligatoria y Robusta",
            icon: <MailCheck />,
            tasks: [
                { who: "bot", text: "Backend: Modificar Server Action `createSession` para que omita la comprobación de `emailVerified` para roles `admin` y `super_admin`, mientras la exige para el resto. Devolver un error claro (`email_not_verified`) si falla.", completed: true },
                { who: "bot", text: "Frontend (useAuth.tsx): Modificar el hook para que no redirija al detectar un fallo de verificación, sino que actualice un estado interno (ej: `authAction: 'awaiting_verification'`).", completed: true },
                { who: "bot", text: "UI (Login/Onboarding): Mostrar una UI de 'Verifica tu email' con botón de reenvío y sondeo en segundo plano cuando `authAction` sea `awaiting_verification`." },
            ]
        },
        {
            title: "Hito 2.1: Flujo de Invitación y Onboarding Seguro (OAuth)",
            icon: <KeyRound />,
            tasks: [
                { who: "bot", text: "Backend: Crear Server Action `generateOnboardingLink(businessId)` que genere un JWT seguro y de corta duración.", completed: true },
                { who: "bot", text: "UI Asistente: Implementar botón 'Invitar al Dueño' que llama a la acción anterior y muestra el enlace en un modal.", completed: true },
                { who: "user", text: "Asegurar que la 'Google Business Profile API' está habilitada en Google Cloud y la pantalla de consentimiento de OAuth está configurada." },
                { who: "bot", text: "UI Onboarding: Construir la página `/onboarding` que valida el token y muestra el formulario de registro. Integrar la lógica de verificación de email del Hito 2.0." },
                { who: "bot", text: "Frontend/Backend (Post-verificación): Usar `localStorage` para guardar el estado del onboarding. Tras la verificación, comprobar `localStorage` y redirigir al flujo de OAuth de Google con el `businessId`." },
                { who: "bot", text: "Ajustar el callback de OAuth (`/api/oauth/callback`) para que guarde los tokens, asocie el `ownerId` al negocio y actualice el `gmbStatus` a 'linked'." },
            ]
        },
        {
            title: "Hito 2.2: Gestión de Planes y Suscripciones con Stripe",
            icon: <DollarSign />,
            tasks: [
                 { who: "user", text: "Crear productos y precios (Suscripción Profesional, Premium) en el dashboard de Stripe." },
                 { who: "bot", text: "Añadir a la entidad `Business` los campos: `subscriptionPlan`, `subscriptionStatus`, `stripeCustomerId`, `stripeSubscriptionId` y `trialEndsAt`." },
                 { who: "bot", text: "Si el token de onboarding es de tipo 'premium', después del OAuth, redirigir al usuario a una sesión de Stripe Checkout para el pago." },
                 { who: "bot", text: "Crear un Webhook en `/api/webhooks/stripe` que escuche eventos de Stripe para actualizar el estado de la suscripción del negocio en Firestore." },
                 { who: "bot", text: "Crear un `cron job` diario que verifique los negocios en `freemium` cuya `trialEndsAt` haya expirado, cambie su estado y envíe notificaciones." },
            ]
        }
    ]
  },
    {
    phase: "Fase 3",
    title: "Automatización con IA y Expansión de la Plataforma",
    description: "Aprovechar los permisos de GMB para ofrecer servicios de valor añadido, como la respuesta automática a reseñas, y construir el dashboard para el Dueño del Negocio.",
    milestones: [
        {
            title: "Hito 3.1: Asistente de IA para Responder Reseñas",
            icon: <Sparkles />,
            tasks: [
                 { who: "bot", text: "Crear un servicio (`GmbAdapter`) que use los tokens guardados para leer las reseñas de un negocio desde la Google Business Profile API." },
                 { who: "bot", text: "Crear un flujo de Genkit (`generateReviewResponseFlow`) que reciba el texto de una reseña y genere una respuesta profesional y personalizada." },
                 { who: "bot", text: "En el dashboard del Dueño del Negocio, crear una nueva sección 'Reseñas' que liste las reseñas obtenidas de Google." },
                 { who: "bot", text: "Añadir un botón 'Generar Respuesta con IA' junto a cada reseña. Al pulsarlo, se llamará al flujo de Genkit y se mostrará la sugerencia en un área de texto editable." },
                 { who: "bot", text: "Añadir un botón 'Publicar Respuesta' que use el `GmbAdapter` para enviar la respuesta final a Google." },
            ]
        },
        {
            title: "Hito 3.2: Dashboard del Dueño del Negocio",
            icon: <UserCog />,
            tasks: [
                 { who: "bot", text: "Diseñar y construir un dashboard específico para el rol 'owner'." },
                 { who: "bot", text: "Este panel mostrará las métricas clave de GMB (vistas, búsquedas), el resumen de reseñas y el acceso a las herramientas de IA." },
                 { who: "bot", text: "Implementar un portal de cliente de Stripe para que el dueño pueda gestionar su suscripción (ej. actualizar método de pago, cancelar)." },
            ]
        }
    ]
  }
];

const TaskIcon = ({ who, completed }: { who: string; completed?: boolean }) => {
    if (completed) {
        return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" aria-label="Task Completed" />;
    }
    if (who === 'bot') {
        return <Bot className="h-5 w-5 text-primary flex-shrink-0" aria-label="Bot Task" />;
    }
    return <UserCog className="h-5 w-5 text-amber-500 flex-shrink-0" aria-label="User Task" />;
};

const MilestoneIcon = ({ icon }: { icon: React.ReactElement }) => {
    return (
        <div className="absolute -left-4 top-1 h-8 w-8 bg-background flex items-center justify-center rounded-full border-2 border-primary/50">
            {React.cloneElement(icon, { className: "h-5 w-5 text-primary" })}
        </div>
    );
}

export default function MyBusinessRoadMapPage() {
  return (
    <div className="flex flex-col gap-12 p-4 md:p-8 bg-background font-body">
      <header>
        <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground">Hoja de Ruta: La Plataforma SaaS</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">Nuestro plan de desarrollo detallado para construir una aplicación robusta, escalable y centrada en el valor, desde cero. Esta es nuestra guía compartida.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
            <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /><span>Tarea de Desarrollo (Gemini)</span></div>
            <div className="flex items-center gap-2"><UserCog className="h-4 w-4 text-amber-500" /><span>Tarea de Configuración (Usuario)</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Tarea Completada</span></div>
        </div>
      </header>
      
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6 border-l-4 border-primary pl-4">Principios de Arquitectura</h2>
         <div className="grid md:grid-cols-2 gap-4">
          {developmentPrinciples.map(policy => (
             <Card key={policy.title} className="bg-card/50 border-border/50">
               <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                 {policy.icon}
                 <CardTitle className="text-lg font-semibold">{policy.title}</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground">{policy.description}</p>
               </CardContent>
             </Card>
          ))}
        </div>
      </section>

      <div className="space-y-16">
        {phases.map((phase, phaseIndex) => (
          <section key={phaseIndex}>
            <div className="mb-8">
              <Badge variant="outline" className="text-md py-1 px-4 rounded-full border-2 border-foreground font-semibold">{phase.phase}</Badge>
              <h2 className="text-3xl font-bold font-headline mt-2">{phase.title}</h2>
              <p className="text-muted-foreground mt-1 max-w-3xl">{phase.description}</p>
            </div>
            
            <div className="space-y-8 border-l-2 border-border/30 ml-2">
                {phase.milestones.map((milestone, milestoneIndex) => (
                    <div key={milestoneIndex} className="pl-10 relative">
                        <MilestoneIcon icon={milestone.icon}/>
                        <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-card/60">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">{milestone.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {milestone.tasks.map((task, taskIndex) => (
                                        <li key={taskIndex} className="flex items-start gap-3">
                                            <TaskIcon who={task.who} completed={task.completed} />
                                            <span className={`flex-1 text-sm text-foreground/90 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                              {task.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

    

    

