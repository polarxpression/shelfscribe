'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/header';
import ShelfGrid from '@/components/shelf-grid';
import EditCellDialog from '@/components/edit-cell-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import translations from '../translations/pt.json';
import { useToast } from '@/hooks/use-toast';
import Tutorial from '@/components/tutorial';
import { cn } from '@/lib/utils';

export type Notebook = {
  barcode: string;
  title?: string;
};

export type ShelfData = { [key: string]: Notebook[] };

export default function Home() {
  const [shelfData, setShelfData] = useState<ShelfData>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [lastUpdatedCell, setLastUpdatedCell] = useState<string | null>(null);
  const [lastDeletedCell, setLastDeletedCell] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialHighlight, setTutorialHighlight] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tutorialSteps = [
    {
      title: translations.tutorial_step1_title,
      description: translations.tutorial_step1_desc,
      highlightId: null,
    },
    {
      title: translations.tutorial_step2_title,
      description: translations.tutorial_step2_desc,
      highlightId: 'shelf-grid',
    },
    {
      title: translations.tutorial_step3_title,
      description: translations.tutorial_step3_desc,
      highlightId: 'cell-1-1',
      action: () => handleCellClick('1-1'),
    },
    {
      title: translations.tutorial_step4_title,
      description: translations.tutorial_step4_desc,
      highlightId: 'search-bar',
    },
    {
      title: translations.tutorial_step5_title,
      description: translations.tutorial_step5_desc,
      highlightId: 'more-options',
    },
    {
      title: translations.tutorial_step6_title,
      description: translations.tutorial_step6_desc,
      highlightId: null,
    }
  ];

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
        setShowTutorial(true);
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
    const found = Object.entries(shelfData).find(([_, notebooks]) =>
      notebooks.some(nb => nb.barcode.toLowerCase() === trimmedQuery)
    );
    setSearchResult(found ? found[0] : null);
  }, [searchQuery, shelfData]);

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
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
  
  const handleTutorialStepChange = (step: any) => {
    setTutorialHighlight(step.highlightId || null);
    if (step.action) {
      step.action();
    } else if (selectedCell && step.highlightId !== 'cell-1-1') {
      handleCloseDialog();
    }
  };

  const handleImport = (data: ShelfData, merge: boolean) => {
    if (typeof data !== 'object' || data === null) {
      toast({
        title: translations.import_error_title,
        description: translations.import_error_invalid_json,
        variant: "destructive",
      });
      return;
    }

    if (merge) {
      setShelfData(prevData => {
        const newData = { ...prevData };
        for (const cellId in data) {
          if (newData[cellId]) {
            // Merge notebooks within the same cell, avoiding duplicates
            const existingBarcodes = new Set(newData[cellId].map(nb => nb.barcode));
            const newNotebooks = data[cellId].filter(nb => !existingBarcodes.has(nb.barcode));
            newData[cellId] = [...newData[cellId], ...newNotebooks];
          } else {
            newData[cellId] = data[cellId];
          }
        }
        return newData;
      });
      toast({
        title: translations.import_success_title,
        description: translations.import_success_description + " (Mesclado)",
      });
    } else {
      setShelfData(data);
      toast({
        title: translations.import_success_title,
        description: translations.import_success_description + " (Substituído)",
      });
    }
  };

  const handleImportError = (message: string) => {
    toast({
      title: translations.import_error_title,
      description: message,
      variant: "destructive",
    });
  };

  return (
    <>
      <div className={`flex flex-col h-screen bg-secondary/20 text-foreground font-body`}>
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          onShowTutorial={() => setShowTutorial(true)}
          tutorialHighlight={tutorialHighlight}
          onImport={handleImport}
          onImportError={handleImportError}
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
          />
        )}
      </div>
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => {
          setShowTutorial(false);
          setTutorialHighlight(null);
          if (selectedCell) handleCloseDialog();
        }} 
        steps={tutorialSteps}
        onStepChange={handleTutorialStepChange}
      />
    </>
  );
}