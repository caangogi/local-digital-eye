
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Business, SalesStatus } from '@/backend/business/domain/business.entity';
import { Star, Link as LinkIcon } from 'lucide-react';
import { updateBusinessStatus } from '@/actions/business.actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BusinessDetailSheet } from './BusinessDetailSheet';

interface PipelineViewProps {
  initialBusinesses: Business[];
}

const salesStatuses: SalesStatus[] = ['new', 'contacted', 'follow_up', 'closed_won', 'closed_lost'];

const statusConfig: { [key in SalesStatus]: { label: string; color: string } } = {
  new: { label: 'Nuevo Lead', color: 'bg-blue-500' },
  contacted: { label: 'Contactado', color: 'bg-yellow-500' },
  follow_up: { label: 'Seguimiento', color: 'bg-orange-500' },
  closed_won: { label: 'Ganado', color: 'bg-green-500' },
  closed_lost: { label: 'Perdido', color: 'bg-red-500' },
};

type BoardData = {
  [key in SalesStatus]: Business[];
};

export function PipelineView({ initialBusinesses }: PipelineViewProps) {
  const [boardData, setBoardData] = useState<BoardData>({
    new: [],
    contacted: [],
    follow_up: [],
    closed_won: [],
    closed_lost: [],
  });
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const newBoardData: BoardData = { new: [], contacted: [], follow_up: [], closed_won: [], closed_lost: [] };
    initialBusinesses.forEach(business => {
      const status = business.salesStatus || 'new';
      if (newBoardData[status]) {
        newBoardData[status].push(business);
      }
    });
    setBoardData(newBoardData);
  }, [initialBusinesses]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const startColumnKey = source.droppableId as SalesStatus;
    const endColumnKey = destination.droppableId as SalesStatus;

    const startColumn = boardData[startColumnKey];
    const endColumn = boardData[endColumnKey];
    const businessToMove = startColumn.find(b => b.id === draggableId);

    if (!businessToMove) return;

    // Optimistic UI Update
    const newStartColumn = Array.from(startColumn);
    newStartColumn.splice(source.index, 1);
    
    const newEndColumn = Array.from(endColumn);
    newEndColumn.splice(destination.index, 0, businessToMove);
    
    setBoardData(prevData => ({
      ...prevData,
      [startColumnKey]: newStartColumn,
      [endColumnKey]: newEndColumn,
    }));
    
    // Server Action
    const newStatus = destination.droppableId as SalesStatus;
    const response = await updateBusinessStatus(draggableId, newStatus);
    
    if (!response.success) {
      toast({ title: 'Error', description: response.message, variant: 'destructive' });
      // Revert UI on failure
       setBoardData(prevData => ({
        ...prevData,
        [startColumnKey]: startColumn,
        [endColumnKey]: endColumn,
      }));
    } else {
        toast({ title: '¡Estado Actualizado!', description: `"${businessToMove.name}" movido a "${statusConfig[newStatus].label}".` });
    }
  };

  const handleCardClick = (business: Business) => {
    setSelectedBusiness(business);
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
        setSelectedBusiness(null);
    }
  };

  return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
       <div className="overflow-x-auto pb-4">
        <div className="min-w-max">
          <div className="flex gap-4">
              {salesStatuses.map(status => (
              <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                  <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                          "bg-muted/40 rounded-lg p-3 flex flex-col h-full min-h-[calc(100vh-20rem)] w-full min-w-[280px] sm:min-w-[300px]",
                          snapshot.isDraggingOver ? "bg-accent/20" : ""
                      )}
                  >
                      <div className="flex items-center gap-2 mb-4 px-1">
                          <span className={cn("w-3 h-3 rounded-full", statusConfig[status].color)}></span>
                          <h3 className="font-semibold text-sm">{statusConfig[status].label}</h3>
                          <Badge variant="secondary" className="ml-auto">{boardData[status].length}</Badge>
                      </div>
                      <div className="space-y-3 overflow-y-auto flex-grow pr-1">
                          {boardData[status].map((business, index) => (
                          <Draggable key={business.id} draggableId={business.id} index={index}>
                              {(provided, snapshot) => (
                              <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                      "select-none cursor-pointer",
                                      snapshot.isDragging ? "shadow-2xl scale-105" : "shadow-md"
                                  )}
                                  onClick={() => handleCardClick(business)}
                              >
                                  <Card className="bg-card hover:bg-card/80">
                                      <CardHeader className="p-3">
                                          <CardTitle className="text-sm font-medium">{business.name}</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                      <div className="text-xs text-muted-foreground space-y-2">
                                          <div className="flex items-center gap-1">
                                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 
                                              <span>{business.rating || 'N/A'} ({business.reviewCount || 0} reseñas)</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                              <LinkIcon className="w-3 h-3" />
                                              <span className="truncate">{business.website ? 'Con Web' : 'Sin Web'}</span>
                                          </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                          {business.customTags?.slice(0,2).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                                      </div>
                                      </CardContent>
                                   </Card>
                              </div>
                              )}
                          </Draggable>
                          ))}
                          {provided.placeholder}
                      </div>
                  </div>
                  )}
              </Droppable>
              ))}
          </div>
        </div>
      </div>
    </DragDropContext>

    {selectedBusiness && (
        <BusinessDetailSheet
            isOpen={isSheetOpen}
            onOpenChange={handleSheetOpenChange}
            business={selectedBusiness}
        />
    )}
    </>
  );
}
