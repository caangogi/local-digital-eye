
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AlertTriangle } from "lucide-react";

interface DebugCollapseProps {
    title: string;
    data: any;
}

export function DebugCollapse({ title, data }: DebugCollapseProps) {
    if (!data) return null;

    return (
        <Accordion type="single" collapsible className="w-full bg-muted/30 border border-yellow-500/50 rounded-lg">
            <AccordionItem value="item-1">
                <AccordionTrigger className="px-4 text-yellow-400 hover:no-underline">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5"/>
                        <span className="font-mono text-sm">{title}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-2">
                    <pre className="p-2 bg-background/50 rounded-md text-xs overflow-x-auto">
                        <code>
                            {JSON.stringify(data, null, 2)}
                        </code>
                    </pre>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
