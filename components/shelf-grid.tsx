'use client';

import { Book, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Notebook } from '@/app/page';
import translations from '../translations/pt.json';

export type ShelfGridProps = {
  shelfData: { [key: string]: Notebook[] };
  onCellClick: (cellId: string) => void;
  searchResult: string | null;
  lastUpdatedCell: string | null;
  tutorialHighlight: string | null;
};

const getRowsForColumn = (col: number): number => {
  if (col === 8) return 1;
  if (col >= 3 && col <= 7) return 4;
  return 5;
};

const columns = Array.from({ length: 15 }, (_, i) => i + 1);

export default function ShelfGrid({
  shelfData,
  onCellClick,
  searchResult,
  lastUpdatedCell,
  tutorialHighlight
}: ShelfGridProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full flex justify-center">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
          {/* Grid Cells */}
          {columns.map(col => (
            <div key={`col-content-${col}`} className="flex flex-col gap-1.5 ">
              {Array.from({ length: getRowsForColumn(col) }, (_, i) => i + 1).map(row => {
                const cellId = `${col}-${row}`;
                let notebooks = shelfData[cellId] || [];
                const isSearchResult = cellId === searchResult;
                const isLastUpdated = cellId === lastUpdatedCell;
                const isTutorialHighlight = tutorialHighlight === `cell-${cellId}`;

                return (
                  <Tooltip key={cellId}>
                    <TooltipTrigger asChild>
                      <Button
                        id={`cell-${cellId}`}
                        onClick={() => onCellClick(cellId)}
                        variant="outline"
                        size="icon"
                        className={cn(
                          "h-16 w-16 flex-col items-center justify-center p-3 transition-all duration-300 ease-in-out relative shadow-inner",
                          "hover:bg-primary/10 hover:border-primary/80",
                          notebooks.length > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'border-dashed border-border/80 text-muted-foreground hover:text-primary',
                          isSearchResult && 'ring-2 ring-offset-2 ring-offset-background ring-accent animate-pulse',
                          isLastUpdated && 'animate-flash',
                          isTutorialHighlight && 'ring-2 ring-offset-2 ring-offset-background ring-primary animate-pulse'
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-center w-full h-full gap-0.5 overflow-hidden">
                          {notebooks.length > 0 ? (
                            notebooks.slice(0, 4).map((nb, idx) => (
                              <Book key={idx} className="h-3 w-3 min-w-0 min-h-0 flex-shrink-0 object-contain" style={{ maxWidth: '1rem', maxHeight: '1rem' }} />
                            ))
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </div>
                        <span className="sr-only">Slot C{col}-L{row}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border-border shadow-lg">
                      <p className="font-semibold text-sm">
                        Slot: C{col}, L{row}
                      </p>
                      {notebooks.length > 0 ? (
                        <ul className="text-muted-foreground font-mono text-xs">
                          {notebooks.map((nb, idx) => (
                            <li key={idx}>{translations.barcode}: {nb.barcode}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          {translations.empty_slot}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
