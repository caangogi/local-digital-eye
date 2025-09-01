import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, UserCog, CheckCircle } from "lucide-react";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: "CRM & Sales Pipeline Roadmap"
  };
}

const developmentPrinciples = [
  { 
    title: "Lead Scoring Manual y Filtros Potentes",
    description: "Cada negocio añadido podrá ser puntuado y etiquetado por el equipo comercial. Un 'Lead Score' alto indicará un cliente con alto potencial. La clave es dar al comercial filtros potentes para segmentar su lista de prospectos."
  },
  { 
    title: "Panel de Oportunidades (Pipeline)",
    description: "La lista de negocios se convertirá en un pipeline de ventas visual e interactivo. Los comerciales podrán filtrar y ordenar por Lead Score, estado, etiquetas, y fechas para gestionar su flujo de trabajo de manera eficiente."
  },
  {
    title: "Prospección Geográfica Inteligente",
    description: "La búsqueda en mapa permitirá añadir prospectos en lote al pipeline, listos para ser cualificados y gestionados por el equipo comercial en zonas geográficas específicas."
  },
  {
    title: "Flujo de Verificación GMB Correcto",
    description: "Se rediseñará el flujo de conexión con Google Business Profile para que solo el propietario verificado de la ficha pueda conceder los permisos, asegurando la integridad y la capacidad de gestión futura."
  }
];

const phases = [
  {
    phase: "Fase 1",
    title: "Fundamentos del CRM y Gestión de Leads",
    description: "Establecer la base del sistema, enriqueciendo la entidad de negocio y creando las herramientas para que el equipo comercial pueda cualificar y gestionar los leads.",
    milestones: [
      {
        title: "Hito 1.1: Evolución de la Entidad 'Business' para CRM",
        tasks: [
          { who: "bot", text: "Modificar la entidad `Business` en `business.entity.ts` para añadir los nuevos campos: `leadScore` (número), `salesStatus` (enum: 'new', 'contacted', 'follow_up', 'closed_won', 'closed_lost'), `customTags` (array de strings), `nextContactDate` (fecha) y `notes` (string largo).", completed: true },
          { who: "bot", text: "Actualizar el `FirebaseBusinessRepository` para manejar los nuevos campos correctamente al guardar y leer datos.", completed: true },
          { who: "bot", text: "Ajustar el `ConnectBusinessUseCase` para que los nuevos negocios se creen con valores por defecto para los campos del CRM (ej. `salesStatus: 'new'`).", completed: true },
        ]
      },
      {
        title: "Hito 1.2: Transformación de la Lista de Negocios en un Pipeline",
        tasks: [
           { who: "bot", text: "Rediseñar la tabla en la página `businesses/page.tsx` para mostrar las nuevas columnas: 'Lead Score', 'Estado de Venta', y 'Etiquetas'." },
           { who: "bot", text: "Hacer que la columna 'Estado de Venta' sea un menú desplegable (Select) que permita al comercial cambiar el estado directamente desde la tabla." },
           { who: "bot", text: "Implementar un Server Action `updateBusinessSalesData` que sea invocado al cambiar el estado para persistir los datos." },
           { who: "bot", text: "Añadir filtros funcionales en la parte superior de la tabla para buscar por nombre, y filtrar por estado y etiquetas." },
        ]
      },
    ]
  },
  {
    phase: "Fase 2",
    title: "Prospección Avanzada y Ficha de Cliente",
    description: "Optimizar la captación de nuevos leads y proporcionar una vista detallada para la gestión individual de cada prospecto.",
    milestones: [
        {
            title: "Hito 2.1: Búsqueda Geográfica para Prospección Masiva",
            tasks: [
                { who: "bot", text: "En la página `map-search/page.tsx`, implementar la búsqueda real por categoría de negocio en un área del mapa, manteniendo la búsqueda siempre dinámica." },
                { who: "bot", text: "Mostrar los resultados como pines en el mapa y en una lista lateral, mostrando el nombre, rating y si tiene web." },
                { who: "bot", text: "Permitir al comercial la selección múltiple (checkboxes) de los negocios en la lista." },
                { who: "bot", text: "Crear un botón 'Añadir a Pipeline'. Al pulsarlo, se conectarán todos los negocios seleccionados y se añadirán al CRM para que el comercial los gestione." },
            ]
        },
        {
            title: "Hito 2.2: Vista Detallada del Prospecto (Panel CRM)",
            tasks: [
                 { who: "bot", text: "Al hacer clic en un negocio de la tabla, en lugar de un menú, abrir un panel lateral (Sheet) o una página de detalle." },
                 { who: "bot", text: "Este panel mostrará toda la información pública del negocio y los campos del CRM (Estado, Etiquetas, Notas, Próximo Contacto)." },
                 { who: "bot", text: "Hacer que los campos del CRM sean editables y se guarden al modificarlos." },
            ]
        }
    ]
  },
    {
    phase: "Fase 3",
    title: "Corrección y Mejora de la Integración con GMB API",
    description: "Asegurar que la conexión con Google Business Profile es segura, robusta y realizada por el propietario legítimo de la ficha.",
    milestones: [
        {
            title: "Hito 3.1: Flujo de Conexión y Permisos",
            tasks: [
                 { who: "user", text: "Asegurarse de que la 'Google Business Profile API' está habilitada en Google Cloud Console y que la pantalla de consentimiento de OAuth está configurada correctamente." },
                 { who: "bot", text: "Modificar el botón 'Conectar Perfil de Google'. En lugar de iniciar el flujo directamente, mostrará un diálogo explicando al comercial que debe compartir un enlace único y seguro con el *dueño del negocio*." },
                 { who: "bot", text: "Crear un Server Action `generateGmbOnboardingLink` que genere una URL única y de corta duración asociada al `businessId`." },
                 { who: "bot", text: "Crear una nueva página pública (ej. `/onboarding/[jwt]`) a la que el dueño del negocio accederá. Esta página verificará el token, le explicará qué permisos está concediendo y le presentará el botón para iniciar el flujo de OAuth de Google." },
                 { who: "bot", text: "Ajustar el callback de OAuth para que, una vez completado, marque la conexión como verificada y redirija al dueño a una página de agradecimiento." },
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
    return <UserCog className="h-5 w-5 text-amber-400 flex-shrink-0" aria-label="User Task" />;
};

export default function CrmRoadMapPage() {
  return (
    <div className="flex flex-col gap-12 p-4 md:p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-headline">Roadmap: CRM & Sales Pipeline</h1>
        <p className="text-muted-foreground mt-2">Nuestro plan estratégico para transformar la aplicación en una potente herramienta de ventas y gestión de leads.</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /><span>Tareas de Desarrollo (Gemini)</span></div>
            <div className="flex items-center gap-2"><UserCog className="h-4 w-4 text-amber-400" /><span>Tareas de Configuración (Usuario)</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Tareas Completadas</span></div>
        </div>
      </div>
      
      <section>
        <h2 className="text-3xl font-bold font-headline mb-4">💡 Principios Clave</h2>
         <div className="grid md:grid-cols-2 gap-4">
          {developmentPrinciples.map(policy => (
             <Card key={policy.title} className="bg-card/50">
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg font-semibold">{policy.title}</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground">{policy.description}</p>
               </CardContent>
             </Card>
          ))}
        </div>
      </section>

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
                     <div className="h-6 w-6 bg-background border-2 border-primary rounded-full ring-4 ring-background"></div>
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
                                        <TaskIcon who={task.who} completed={task.completed} />
                                        <span className={`flex-1 text-sm text-foreground/90 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                          {task.text}
                                        </span>
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
