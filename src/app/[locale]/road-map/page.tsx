import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Bot, UserCog } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  // Assuming a generic title for this page
  return {
    title: "Development Roadmap"
  };
}

const phases = [
  {
    phase: "Fase 1",
    title: "El Embudo Inteligente de Reseñas (MVP)",
    description: "Implementar el flujo principal para capturar y filtrar reseñas, maximizando las valoraciones positivas en Google y gestionando las negativas de forma interna.",
    milestones: [
      {
        title: "Autenticación y Vinculación con Google",
        tasks: [
          { who: "bot", text: "Crear un nuevo layout y página de login/registro que utilice exclusivamente la autenticación de Google (Firebase Authentication)." },
          { who: "user", text: "En la Consola de Firebase, habilitar 'Authentication' y activar el proveedor de 'Google'." },
          { who: "user", text: "Asegurarse de que el dominio de la app esté en la lista de dominios autorizados para OAuth." },
          { who: "bot", text: "Desarrollar un nuevo hook `useAuth` que maneje el flujo de autenticación con Google." },
          { who: "user", text: "En Google Cloud Console, habilitar la 'Google People API' para obtener datos del perfil de usuario." },
          { who: "user", text: "Configurar la pantalla de consentimiento de OAuth con los permisos (scopes) necesarios." },
        ]
      },
      {
        title: "Obtención del Place ID y Generación de Enlace/QR",
        tasks: [
           { who: "user", text: "Habilitar la 'Google Business Profile API' en la Google Cloud Console." },
           { who: "bot", text: "Crear interfaz para que el usuario conecte su 'Google Business Profile' vía OAuth." },
           { who: "bot", text: "Desarrollar flujo para listar negocios del usuario y almacenar el `place_id` seleccionado." },
           { who: "bot", text: "Implementar en el dashboard la generación del enlace único de reseña y su código QR descargable." },
        ]
      },
      {
        title: "Página de Captura de Reseñas y Lógica de Filtrado",
        tasks: [
            { who: "bot", text: "Crear la página pública y dinámica para la captura de la 'pre-reseña'." },
            { who: "bot", text: "Implementar la lógica condicional: 5 estrellas redirige a Google, 1-4 estrellas expande el formulario." },
            { who: "bot", text: "Crear endpoint API para guardar las reseñas negativas en Firestore y notificar al dueño del negocio." },
        ]
      }
    ]
  },
  {
    phase: "Fase 2",
    title: "El Asistente IA para Responder Reseñas",
    description: "Ahorrar tiempo a los dueños de negocios generando respuestas inteligentes y personalizadas a las reseñas de Google.",
    milestones: [
        {
            title: "Sincronización y Generación de Respuestas",
            tasks: [
                { who: "bot", text: "Crear servicio para obtener periódicamente las nuevas reseñas vía Google Business Profile API." },
                { who: "bot", text: "Desarrollar flujo de Genkit para analizar reseñas y generar respuestas sugeridas y personalizadas." },
                { who: "bot", text: "Diseñar interfaz en el dashboard para que el usuario apruebe o edite las respuestas." },
                { who: "bot", text: "Integrar la publicación automática de la respuesta aprobada en Google." },
            ]
        }
    ]
  },
  {
    phase: "Fase 3",
    title: "Monitorización y Reportes SEO Local",
    description: "Proporcionar a los usuarios métricas claras sobre su visibilidad y rendimiento en las búsquedas locales.",
    milestones: [
        {
            title: "Recopilación y Análisis de Datos",
            tasks: [
                 { who: "user", text: "Configurar acceso a la 'Google Search Console API' y conceder permisos." },
                 { who: "bot", text: "Desarrollar servicio para conectar con la API de Google Search Console y extraer métricas." },
                 { who: "bot", text: "Desarrollar servicio para extraer 'Insights' de la Google Business Profile API." },
                 { who: "bot", text: "Crear flujo de Genkit para consolidar datos y generar resúmenes ejecutivos y recomendaciones SEO." },
                 { who: "bot", text: "Diseñar nueva sección en el dashboard para visualizar estas métricas con gráficos y tablas." },
                 { who: "bot", text: "Implementar sistema de generación de reportes automáticos en PDF (semanal/mensual)." },
            ]
        }
    ]
  }
];

const TaskIcon = ({ who }: { who: string }) => {
    if (who === 'bot') {
        return <Bot className="h-5 w-5 text-primary flex-shrink-0" aria-label="Bot Task" />;
    }
    return <UserCog className="h-5 w-5 text-amber-400 flex-shrink-0" aria-label="User Task" />;
};

export default function RoadMapPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-headline">Hoja de Ruta del Desarrollo</h1>
        <p className="text-muted-foreground mt-2">Nuestro plan para construir las próximas grandes funcionalidades de Local Digital Eye.</p>
        <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /><span>Tareas de Desarrollo (Gemini)</span></div>
            <div className="flex items-center gap-2"><UserCog className="h-4 w-4 text-amber-400" /><span>Tareas de Configuración (Usuario)</span></div>
        </div>
      </div>

      <div className="space-y-12">
        {phases.map((phase, phaseIndex) => (
          <section key={phaseIndex}>
            <div className="mb-6">
              <Badge variant="outline" className="text-lg py-1 px-4 rounded-full border-primary text-primary">{phase.phase}</Badge>
              <h2 className="text-3xl font-bold font-headline mt-2">{phase.title}</h2>
              <p className="text-muted-foreground mt-1 max-w-3xl">{phase.description}</p>
            </div>
            
            <div className="space-y-6 border-l-2 border-border ml-4 pl-8 relative">
                 <div className="absolute -left-[1.3rem] top-0 h-full">
                    {Array.from({ length: phase.milestones.length }).map((_, i) => (
                        <div key={i} className="h-24 last:h-0">
                            <div className="h-6 w-6 bg-background border-2 border-primary rounded-full ring-4 ring-background"></div>
                             {i < phase.milestones.length - 1 && <div className="h-full w-px bg-border mx-auto"></div>}
                        </div>
                    ))}
                 </div>

                {phase.milestones.map((milestone, milestoneIndex) => (
                    <Card key={milestoneIndex} className="shadow-md hover:shadow-[0_0_20px_8px_hsl(var(--accent)/0.1)] transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-xl font-headline">{milestone.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {milestone.tasks.map((task, taskIndex) => (
                                    <li key={taskIndex} className="flex items-start gap-3">
                                        <TaskIcon who={task.who} />
                                        <span className="flex-1 text-sm text-foreground/90">{task.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
