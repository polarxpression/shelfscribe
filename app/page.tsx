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
import LayoutSelector from '@/components/layout-selector';

export type Notebook = {
  barcode: string;
  title?: string;
};

export type ShelfData = { [key: string]: Notebook[] };

export type ShelfLayout = {
  id: string;
  name: string;
  shelfData: ShelfData;
};

type ExportedShelfFile = {
  version: 2;
  activeLayoutId: string;
  layouts: ShelfLayout[];
};

type ImportedShelfData = {
  layouts: ShelfLayout[];
  activeLayoutId: string;
};



export default function Home() {
  const [layouts, setLayouts] = useState<ShelfLayout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  const activeLayout = layouts.find(layout => layout.id === activeLayoutId) ?? layouts[0];
  const shelfData: ShelfData = activeLayout?.shelfData ?? {};
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

  const createLayoutId = () => `layout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const normalizeShelfData = (data: Record<string, unknown>): ShelfData =>
    Object.fromEntries(
      Object.entries(data).map(([key, value]) =>
        Array.isArray(value)
          ? [key, value]
          : [key, [{ barcode: value as string }]]
      )
    );

  const createLayout = (name: string, data: ShelfData): ShelfLayout => ({
    id: createLayoutId(),
    name,
    shelfData: data,
  });

  const isValidShelfLayouts = (data: unknown): data is ShelfLayout[] => {
    if (!Array.isArray(data)) return false;
    return data.every(layout =>
      typeof layout === 'object' &&
      layout !== null &&
      typeof (layout as ShelfLayout).id === 'string' &&
      typeof (layout as ShelfLayout).name === 'string' &&
      isValidShelfData((layout as ShelfLayout).shelfData)
    );
  };

  const loadLegacyShelfData = () => {
    const storedData = localStorage.getItem('shelfData');
    if (storedData) {
      const parsed = JSON.parse(storedData) as Record<string, unknown>;
      const migrated = normalizeShelfData(parsed);
      const legacyLayout = createLayout('Prateleira principal', migrated);
      setLayouts([legacyLayout]);
      setActiveLayoutId(legacyLayout.id);
    } else {
      const initialLayout = createLayout('Prateleira principal', { '1-1': [] });
      setLayouts([initialLayout]);
      setActiveLayoutId(initialLayout.id);
    }
  };

  const updateActiveShelfData = (updater: (data: ShelfData) => ShelfData) => {
    setLayouts(prevLayouts => prevLayouts.map(layout =>
      layout.id === activeLayoutId
        ? { ...layout, shelfData: updater(layout.shelfData) }
        : layout
    ));
  };

  

  useEffect(() => {
    try {
      const storedLayouts = localStorage.getItem('shelfLayouts');
      const storedActiveLayoutId = localStorage.getItem('activeShelfLayoutId');

      if (storedLayouts) {
        const parsed = JSON.parse(storedLayouts);
        if (isValidShelfLayouts(parsed) && parsed.length > 0) {
          const selectedId = parsed.some(layout => layout.id === storedActiveLayoutId)
            ? storedActiveLayoutId!
            : parsed[0].id;
          setLayouts(parsed);
          setActiveLayoutId(selectedId);
        } else {
          loadLegacyShelfData();
        }
      } else {
        loadLegacyShelfData();
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      toast({
        title: "Error loading data",
        description: "Could not load shelf data from your browser's storage.",
        variant: "destructive",
      });
      const fallback = createLayout('Prateleira principal', { '1-1': [] });
      setLayouts([fallback]);
      setActiveLayoutId(fallback.id);
    }
    setIsLoaded(true);
  }, [toast]);

  useEffect(() => {
    if (isLoaded && layouts.length > 0 && activeLayoutId) {
      try {
        localStorage.setItem('shelfLayouts', JSON.stringify(layouts));
        localStorage.setItem('activeShelfLayoutId', activeLayoutId);
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
  }, [layouts, activeLayoutId, isLoaded, shelfData, toast]);

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
    updateActiveShelfData(prevData => ({ ...prevData, [cellId]: notebooks }));
    handleCloseDialog();
    if (notebooks && notebooks.length > 0) {
      flashUpdate(cellId);
    }
  };

  const handleDelete = (cellId: string) => {
    setLastDeletedCell(cellId);
    setTimeout(() => {
      updateActiveShelfData(prevData => {
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
    updateActiveShelfData(prevData => {
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
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string) as unknown;
        const importedData = toImportedLayouts(raw);

        if (!importedData) {
          toast({
            title: translations.import_error_title,
            description: translations.import_error_invalid_data_format,
            variant: "destructive",
          });
          return;
        }

        if (merge && isValidShelfData(raw)) {
          updateActiveShelfData(prevData => {
            const merged = { ...prevData };
            for (const cellId of Object.keys(raw)) {
              const existingBarcodes = new Set((merged[cellId] || []).map(nb => nb.barcode));
              const additions = raw[cellId].filter(nb => !existingBarcodes.has(nb.barcode));
              merged[cellId] = [...(merged[cellId] || []), ...additions];
            }
            return merged;
          });
          toast({
            title: translations.import_success_title,
            description: translations.import_success_description + " (Mesclado)",
          });
        } else if (merge) {
          setLayouts(prevLayouts => {
            const merged = [...prevLayouts];
            for (const imported of importedData.layouts) {
              const existingIndex = merged.findIndex(layout => layout.id === imported.id);
              if (existingIndex >= 0) {
                const existing = merged[existingIndex];
                const combined = { ...existing.shelfData };
                for (const cellId of Object.keys(imported.shelfData)) {
                  const existingBarcodes = new Set((combined[cellId] || []).map(nb => nb.barcode));
                  const additions = imported.shelfData[cellId].filter(nb => !existingBarcodes.has(nb.barcode));
                  combined[cellId] = [...(combined[cellId] || []), ...additions];
                }
                merged[existingIndex] = { ...existing, shelfData: combined };
              } else {
                merged.push(imported);
              }
            }
            return merged;
          });
          toast({
            title: translations.import_success_title,
            description: translations.import_success_description + " (Mesclado)",
          });
        } else {
          setLayouts(importedData.layouts);
          setActiveLayoutId(importedData.activeLayoutId);
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

  const toImportedLayouts = (data: unknown): ImportedShelfData | null => {
    if (isValidShelfLayouts(data)) {
      return { layouts: data, activeLayoutId: data[0]?.id ?? '' };
    }

    if (typeof data === 'object' && data !== null && 'version' in data && 'layouts' in data) {
      const candidate = data as Partial<ExportedShelfFile>;
      if (!isValidShelfLayouts(candidate.layouts) || candidate.layouts.length === 0) return null;

      const importedActiveId = typeof candidate.activeLayoutId === 'string' &&
        candidate.layouts.some(layout => layout.id === candidate.activeLayoutId)
        ? candidate.activeLayoutId
        : candidate.layouts[0].id;

      return { layouts: candidate.layouts, activeLayoutId: importedActiveId };
    }

    if (isValidShelfData(data)) {
      const imported = createLayout('Prateleira importada', data);
      return { layouts: [imported], activeLayoutId: imported.id };
    }

    return null;
  };


  const isValidShelfData = (data: unknown): data is ShelfData => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const cellContent = (data as Record<string, unknown>)[key];
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
    const payload: ExportedShelfFile = {
      version: 2,
      activeLayoutId,
      layouts,
    };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shelfscribe_layouts.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: translations.export_success_title,
      description: translations.export_success_description,
    });
  };

  const handleCreateLayout = () => {
    const name = window.prompt(translations.new_layout_prompt, `${translations.new_layout_default_name} ${layouts.length + 1}`)?.trim();
    if (!name) return;

    const newLayout = createLayout(name, { '1-1': [] });
    setLayouts(prev => [...prev, newLayout]);
    setActiveLayoutId(newLayout.id);
    setSearchQuery('');
    toast({ title: translations.layout_created_title, description: name });
  };

  const handleRenameLayout = () => {
    const current = layouts.find(layout => layout.id === activeLayoutId);
    if (!current) return;
    const name = window.prompt(translations.rename_layout_prompt, current.name)?.trim();
    if (!name || name === current.name) return;

    setLayouts(prev => prev.map(layout => layout.id === activeLayoutId ? { ...layout, name } : layout));
    toast({ title: translations.layout_renamed_title, description: name });
  };

  const handleDeleteLayout = () => {
    if (layouts.length <= 1) return;
    const current = layouts.find(layout => layout.id === activeLayoutId);
    if (!current || !window.confirm(translations.delete_layout_confirm.replace('{name}', current.name))) return;

    const nextLayouts = layouts.filter(layout => layout.id !== activeLayoutId);
    setLayouts(nextLayouts);
    setActiveLayoutId(nextLayouts[0].id);
    setSearchQuery('');
    toast({ title: translations.layout_deleted_title, description: current.name });
  };

  const handleLayoutChange = (layoutId: string) => {
    setActiveLayoutId(layoutId);
    setSearchQuery('');
    setSelectedCell(null);
    setIsMoveMode(false);
    setNotebooksToMove([]);
    setSourceCellForMove(null);
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
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="pointer-events-none select-none text-xl font-bold tracking-tight text-primary">{translations.my_notebook_shelf_title}</CardTitle>
                  <CardDescription className="pointer-events-none select-none">{translations.shelf_description}</CardDescription>
                </div>
                {isLoaded && layouts.length > 0 && (
                  <LayoutSelector
                    layouts={layouts.map(({ id, name }) => ({ id, name }))}
                    activeLayoutId={activeLayoutId}
                    onLayoutChange={handleLayoutChange}
                    onCreateLayout={handleCreateLayout}
                    onRenameLayout={handleRenameLayout}
                    onDeleteLayout={handleDeleteLayout}
                  />
                )}
              </div>
              {activeLayout && (
                <div className="text-xs text-muted-foreground">{translations.active_layout_label}: <span className="font-medium text-foreground">{activeLayout.name}</span></div>
              )}
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
          updateActiveShelfData(() => ({ '1-1': [] }));
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
