'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/header';
import ShelfGrid from '@/components/shelf-grid';
import EditCellDialog from '@/components/edit-cell-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import translations from '../translations/pt.json';
import { useToast } from '@/hooks/use-toast';


import MoveModeBanner from '@/components/move-mode-banner';
import { cn } from '@/lib/utils';

import ResetDialog from '@/components/reset-dialog';

import Tutorial from '@/components/tutorial';

export type Notebook = {
  barcode: string;
  title?: string;
};

export type ShelfData = { [key: string]: Notebook[] };



export default function Home() {
  const [shelfData, setShelfData] = useState<ShelfData>({} as ShelfData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [lastUpdatedCell, setLastUpdatedCell] = useState<string | null>(null);
  const [lastDeletedCell, setLastDeletedCell] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [tutorialHighlight, setTutorialHighlight] = useState<string | null>(null);
  
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [notebooksToMove, setNotebooksToMove] = useState<Notebook[]>([]);
  const [sourceCellForMove, setSourceCellForMove] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('shelfData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const migrated: ShelfData = Object.fromEntries(
          Object.entries(parsed).map(([key, value]) =>
            Array.isArray(value)
              ? [key, value]
              : [key, [{ barcode: value as string }]]
          )
        );
        setShelfData(migrated);
      } else {
        setShelfData({ '1-1': [] });
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      toast({
        title: "Error loading data",
        description: "Could not load shelf data from your browser's storage.",
        variant: "destructive",
      });
    }
    setIsLoaded(true);
  }, [toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('shelfData', JSON.stringify(shelfData));
        if (scrollContainerRef.current) {
          const { scrollWidth, clientWidth, scrollHeight, clientHeight } = scrollContainerRef.current;
          scrollContainerRef.current.scrollTo({
            left: (scrollWidth - clientWidth) / 2,
            top: (scrollHeight - clientHeight) / 2,
            behavior: 'smooth',
          });
        }
      } catch (error) {
        console.error('Failed to save data to localStorage', error);
        toast({
          title: "Error saving data",
          description: "Could not save shelf data to your browser's storage.",
          variant: "destructive",
        });
      }
    }
  }, [shelfData, isLoaded, toast]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      setSearchResult(null);
      return;
    }
    const found = Object.entries(shelfData).find(([, notebooks]) =>
      notebooks.some(nb => nb.barcode.toLowerCase() === trimmedQuery)
    );
    setSearchResult(found ? found[0] : null);
  }, [searchQuery, shelfData]);

  const handleCellClick = (cellId: string) => {
    if (isMoveMode && sourceCellForMove) {
      handleMoveNotebook(sourceCellForMove, cellId, notebooksToMove);
    } else {
      setSelectedCell(cellId);
    }
  };

  const handleCloseDialog = () => {
    setSelectedCell(null);
  };

  const flashUpdate = (cellId: string) => {
    setLastUpdatedCell(cellId);
    setTimeout(() => {
      setLastUpdatedCell(null);
    }, 1500);
  };

  const handleSave = (cellId: string, notebooks: Notebook[]) => {
    setShelfData(prevData => ({ ...prevData, [cellId]: notebooks }));
    handleCloseDialog();
    if (notebooks && notebooks.length > 0) {
      flashUpdate(cellId);
    }
  };

  const handleDelete = (cellId: string) => {
    setLastDeletedCell(cellId);
    setTimeout(() => {
      setShelfData(prevData => {
        const newData = { ...prevData };
        delete newData[cellId];
        return newData;
      });
      setLastDeletedCell(null);
    }, 300);
    handleCloseDialog();
  };

  

  const handleInitiateMove = (sourceCellId: string, notebooksToMove: Notebook[]) => {
    setIsMoveMode(true);
    setNotebooksToMove(notebooksToMove);
    setSourceCellForMove(sourceCellId);
    setSelectedCell(null); // Close the dialog
    toast({
      title: translations.move_mode_active_title,
      description: translations.move_mode_active_description,
    });
  };

  const handleMoveNotebook = (sourceCellId: string, targetCellId: string, notebooksToMove: Notebook[]) => {
    setShelfData(prevData => {
      const newData = { ...prevData };
      // Remove from source
      newData[sourceCellId] = (newData[sourceCellId] || []).filter(nb => 
        !notebooksToMove.some(movingNb => movingNb.barcode === nb.barcode)
      );
      // Add to target
      newData[targetCellId] = [...(newData[targetCellId] || []), ...notebooksToMove];
      return newData;
    });
    flashUpdate(targetCellId);
    flashUpdate(sourceCellId);
    setIsMoveMode(false);
    setNotebooksToMove([]);
    setSourceCellForMove(null);
  };

  
  
  

  const handleImport = (file: File, merge: boolean) => {
    console.log('handleImport called with file:', file, 'and merge:', merge);
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log('FileReader onload fired.');
      try {
        const importedData: ShelfData = JSON.parse(event.target?.result as string);
        console.log('Parsed imported data:', importedData);

        if (!isValidShelfData(importedData)) {
          console.error("Imported data is not valid:", importedData);
          toast({
            title: translations.import_error_title,
            description: translations.import_error_invalid_data_format,
            variant: "destructive",
          });
          return;
        }

        if (merge) {
          setShelfData(prevData => {
            const newData = { ...prevData };
            for (const cellId in importedData) {
              if (newData[cellId]) {
                const existingBarcodes = new Set(newData[cellId].map(nb => nb.barcode));
                const newNotebooks = (importedData[cellId] as Notebook[]).filter((nb: Notebook) => !existingBarcodes.has(nb.barcode));
                newData[cellId] = [...newData[cellId], ...newNotebooks];
              } else {
                newData[cellId] = importedData[cellId];
              }
            }
            return newData;
          });
          toast({
            title: translations.import_success_title,
            description: translations.import_success_description + " (Mesclado)",
          });
        } else {
          setShelfData(importedData);
          toast({
            title: translations.import_success_title,
            description: translations.import_success_description + " (Substituído)",
          });
        }
      } catch (error) {
        console.error("Error parsing imported file:", error);
        toast({
          title: translations.import_error_title,
          description: translations.import_error_parsing_file,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  

  const isValidShelfData = (data: unknown): data is ShelfData => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // @ts-expect-error - The type of data is not known at this point.
        const cellContent = data[key];
        if (!Array.isArray(cellContent)) {
          return false;
        }
        for (const item of cellContent) {
          if (typeof item !== 'object' || item === null || !('barcode' in item)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(shelfData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shelfscribe_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: translations.export_success_title,
      description: translations.export_success_description,
    });
  };

  return (
    <>
      <div className={`flex flex-col h-screen bg-secondary/20 text-foreground font-body`}>
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          onImportFile={handleImport}
          onShowTutorial={() => setShowTutorial(true)}
          onReset={() => setShowResetDialog(true)}
          onExport={handleExport}
          tutorialHighlight={tutorialHighlight}
        />
          
        <main className="flex-grow container mx-auto p-4 flex flex-col">
          <Card id="shelf-grid-card" className="w-full shadow-lg border-primary/20 flex-grow flex flex-col relative">
             <div id="shelf-grid" className={cn('absolute -inset-2 rounded-lg border-2 border-dashed border-transparent transition-all duration-300 pointer-events-none', {'border-primary animate-pulse-border': tutorialHighlight === 'shelf-grid'})}></div>
            <CardHeader>
              <CardTitle className="pointer-events-none select-none text-xl font-bold tracking-tight text-primary">{translations.my_notebook_shelf_title}</CardTitle>
              <CardDescription className="pointer-events-none select-none">{translations.shelf_description}</CardDescription>
            </CardHeader>
            <CardContent ref={scrollContainerRef} className="flex-grow flex items-center justify-center overflow-auto p-4">
              {isLoaded ? (
                <ShelfGrid
                  shelfData={shelfData}
                  onCellClick={handleCellClick}
                  searchResult={searchResult}
                  lastUpdatedCell={lastUpdatedCell}
                  lastDeletedCell={lastDeletedCell}
                  tutorialHighlight={tutorialHighlight}
                  onMoveNotebook={handleMoveNotebook}
                  isMoveMode={isMoveMode}
                />
              ) : (
                <div className="text-center p-8 flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">{translations.loading_shelf}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        {selectedCell && (
          <EditCellDialog
            isOpen={!!selectedCell}
            cellId={selectedCell}
            currentNotebooks={shelfData[selectedCell] || []}
            onSave={handleSave}
            onDelete={handleDelete}
    onClose={handleCloseDialog}
    onInitiateMove={handleInitiateMove}
  />
        )}
      {isMoveMode && (
        <MoveModeBanner onCancel={() => {
          setIsMoveMode(false);
          setNotebooksToMove([]);
          setSourceCellForMove(null);
        }} />
      )}
      <ResetDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => {
          setShelfData({ '1-1': [] });
          setShowResetDialog(false);
        }}
      />

      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        setHighlight={setTutorialHighlight}
        onOpenCell={useCallback((cellId) => setSelectedCell(cellId), [])}
        onCloseCell={() => setSelectedCell(null)}
      />

      </div>
    </>
  );
}