'use client';

import { Book, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Notebook, ShelfData } from '@/app/page';
import translations from '../translations/pt.json';
import { useEffect, useState } from 'react';

const columnLabel = (column: number) => {
  let value = column;
  let label = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
};

export type ShelfGridProps = {
  shelfData: ShelfData;
  onCellClick: (cellId: string) => void;
  searchResult: string | null;
  lastUpdatedCell: string | null;
  lastDeletedCell: string | null;
  tutorialHighlight: string | null;
  onMoveNotebook: (sourceCellId: string, targetCellId: string, notebooks: Notebook[]) => void;
  isMoveMode: boolean;
};

export default function ShelfGrid({
  shelfData,
  onCellClick,
  searchResult,
  lastUpdatedCell,
  lastDeletedCell,
  tutorialHighlight,
  onMoveNotebook,
  isMoveMode,
}: ShelfGridProps) {
  const [renderedCells, setRenderedCells] = useState<Set<string>>(new Set());

  const occupiedCells = Object.keys(shelfData).filter(key => shelfData[key].length > 0);

  const { maxCol, maxRow } = occupiedCells.reduce(
    (acc, cellId) => {
      const [col, row] = cellId.split('-').map(Number);
      return {
        maxCol: Math.max(acc.maxCol, col),
        maxRow: Math.max(acc.maxRow, row),
      };
    },
    { maxCol: 1, maxRow: 1 }
  );

  const gridCols = maxCol + 1;
  const gridRows = maxRow + 1;

  useEffect(() => {
    const newCells = new Set<string>();
    for (let c = 1; c <= gridCols; c++) {
      for (let r = 1; r <= gridRows; r++) {
        const cellId = `${c}-${r}`;
        const hasContent = shelfData[cellId] && shelfData[cellId].length > 0;
        const isAdjacent =
          (shelfData[`${c - 1}-${r}`] && shelfData[`${c - 1}-${r}`].length > 0) ||
          (shelfData[`${c + 1}-${r}`] && shelfData[`${c + 1}-${r}`].length > 0) ||
          (shelfData[`${c}-${r - 1}`] && shelfData[`${c}-${r - 1}`].length > 0) ||
          (shelfData[`${c}-${r + 1}`] && shelfData[`${c}-${r + 1}`].length > 0);

        if (hasContent || isAdjacent || (c === 1 && r === 1)) {
          newCells.add(cellId);
        }
      }
    }
    setRenderedCells(newCells);
  }, [shelfData, gridCols, gridRows]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full min-w-max flex justify-center">
        <div
          className="grid gap-2 sm:gap-2.5 min-w-max"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            transition: 'grid-template-columns 0.5s ease-in-out',
          }}
        >
          {Array.from({ length: gridCols }, (_, i) => i + 1).map(col => (
            <div key={`col-content-${col}`} className="flex flex-col gap-1 sm:gap-1.5">
              {Array.from({ length: gridRows }, (_, i) => i + 1).map(row => {
                const cellId = `${col}-${row}`;
                if (!renderedCells.has(cellId) && lastDeletedCell !== cellId) {
                  return <div key={cellId} className="h-20 w-20 sm:h-24 sm:w-24" />;
                }

                const notebooks = shelfData[cellId] || [];
                const isSearchResult = cellId === searchResult;
                const isLastUpdated = cellId === lastUpdatedCell;
                const isTutorialHighlight = tutorialHighlight === `cell-${cellId}`;
                const isNew = !occupiedCells.includes(cellId) && renderedCells.has(cellId);
                const isDisappearing = cellId === lastDeletedCell;
                const cellName = `${columnLabel(col)}${row}`;

                return (
                  <Tooltip key={cellId}>
                    <TooltipTrigger asChild>
                      <Button
                        id={`cell-${cellId}`}
                        onClick={() => onCellClick(cellId)}
                        variant="outline"
                        size="icon"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          try {
                            const { sourceCellId, notebook } = JSON.parse(e.dataTransfer.getData('text/plain'));
                            if (sourceCellId && notebook) {
                              onMoveNotebook(sourceCellId, cellId, [notebook]);
                            }
                          } catch {
                            // Ignore malformed drag data.
                          }
                        }}
                        aria-label={`${cellName}${notebooks.length > 0 ? `, ${notebooks.length} ${notebooks.length === 1 ? 'caderno' : 'cadernos'}` : ', vazio'}`}
                        className={cn(
                          'h-20 w-20 sm:h-24 sm:w-24 flex-col items-center justify-center p-1.5 sm:p-2 transition-all duration-300 ease-in-out relative shadow-inner touch-manipulation',
                          'hover:bg-primary/10 hover:border-primary/80',
                          notebooks.length > 0
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'border-dashed border-border/80 text-muted-foreground hover:text-primary',
                          isSearchResult && 'ring-2 ring-offset-2 ring-offset-background ring-accent animate-pulse',
                          isLastUpdated && 'animate-flash',
                          isTutorialHighlight && 'ring-2 ring-offset-2 ring-offset-background ring-primary animate-pulse',
                          isNew && 'animate-cell-appear',
                          isDisappearing && 'animate-cell-disappear',
                          isMoveMode && 'border-2 border-blue-500',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-1 top-1 z-10 rounded-md bg-primary px-2 py-1 text-sm font-extrabold leading-none tracking-wide text-primary-foreground shadow-sm ring-1 ring-primary/30 sm:left-1.5 sm:top-1.5 sm:px-2.5 sm:py-1.5 sm:text-base"
                        >
                          {cellName}
                        </span>
                        <div className="flex flex-wrap items-center justify-center w-full h-full gap-1 overflow-hidden pt-5 sm:pt-6">
                          {notebooks.length > 0 ? (
                            notebooks.slice(0, 4).map((nb, idx) => (
                              <Book key={idx} className="h-4 w-4 min-w-0 min-h-0 flex-shrink-0 object-contain sm:h-5 sm:w-5" />
                            ))
                          ) : (
                            <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
                          )}
                        </div>
                        <span className="sr-only">{cellName}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border-border shadow-lg">
                      <p className="font-semibold text-sm">{cellName}</p>
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
