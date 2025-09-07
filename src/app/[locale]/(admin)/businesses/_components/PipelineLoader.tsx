
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Business } from '@/backend/business/domain/business.entity';

// This is the skeleton loader that shows while the dynamic component is loading
const PipelineSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ))}
    </div>
);

// Dynamically import the PipelineView component with SSR turned off
const PipelineView = dynamic(
  () => import('./PipelineView').then(mod => mod.PipelineView),
  { 
    ssr: false,
    loading: () => <PipelineSkeleton />
  }
);

interface PipelineLoaderProps {
  initialBusinesses: Business[];
}

/**
 * This component acts as a client-side bridge to load the PipelineView,
 * which requires client-only libraries (`@hello-pangea/dnd`) and must not be
 * rendered on the server.
 */
export function PipelineLoader({ initialBusinesses }: PipelineLoaderProps) {
  return <PipelineView initialBusinesses={initialBusinesses} />;
}

    