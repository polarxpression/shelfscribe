'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Barcode, Trash2, Move } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import translations from '../translations/pt.json';

type Notebook = {
  barcode: string;
  title?: string;
};

type EditCellDialogProps = {
  isOpen: boolean;
  cellId: string;
  currentNotebooks: Notebook[];
  onSave: (cellId: string, notebooks: Notebook[]) => void;
  onDelete: (cellId: string) => void;
  onClose: () => void;
  onInitiateMove: (sourceCellId: string, notebooksToMove: Notebook[]) => void;
};

export default function EditCellDialog({
  isOpen,
  cellId,
  currentNotebooks,
  onSave,
  onDelete,
  onClose,
  onInitiateMove,
}: EditCellDialogProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(currentNotebooks);
  const [selectedNotebooks, setSelectedNotebooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (notebooks.length > 0) {
      const lastInput = document.getElementById(`barcode-${notebooks.length - 1}`);
      lastInput?.focus();
    }
  }, [notebooks.length]);

  const [col, row] = cellId.split('-').map(Number);

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

  const cellName = `${columnLabel(col)}${row}`;

  const handleSave = () => {
    const filtered = notebooks.filter(nb => nb.barcode && nb.barcode.trim() !== '');
    onSave(cellId, filtered);
  };

  const handleDelete = () => {
    onDelete(cellId);
  };

  const handleNotebookChange = (idx: number, value: string) => {
    setNotebooks(nbs => nbs.map((nb, i) => i === idx ? { ...nb, barcode: value } : nb));
  };

  const handleAddNotebook = () => {
    setNotebooks(nbs => [...nbs, { barcode: '' }]);
  };

  const handleRemoveNotebook = (idx: number) => {
    setNotebooks(nbs => nbs.filter((_, i) => i !== idx));
  };

  const handleToggleSelect = (barcode: string) => {
    setSelectedNotebooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(barcode)) {
        newSet.delete(barcode);
      } else {
        newSet.add(barcode);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    const remainingNotebooks = notebooks.filter(nb => !selectedNotebooks.has(nb.barcode));
    setNotebooks(remainingNotebooks);
    setSelectedNotebooks(new Set());
  };

  const handleMoveRequest = () => {
    const notebooksToMove = notebooks.filter(nb => selectedNotebooks.has(nb.barcode));
    onInitiateMove(cellId, notebooksToMove);
    onClose();
  };

  const hasEmptyBarcode = notebooks.some(nb => !nb.barcode || nb.barcode.trim() === '');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleSave();
        onClose();
      }
    }}>
      <DialogContent className="flex h-auto max-h-[92dvh] w-[calc(100%-0.75rem)] flex-col gap-0 overflow-hidden rounded-t-2xl rounded-b-none p-0 pb-[env(safe-area-inset-bottom)] bottom-0 top-auto translate-y-0 sm:bottom-auto sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:-translate-y-1/2 sm:rounded-lg sm:p-6 sm:pb-6">
        <DialogHeader className="shrink-0 border-b px-4 pb-3 pt-4 pr-12 sm:border-b-0 sm:px-0 sm:pb-1 sm:pt-0 sm:pr-8">
          <DialogTitle className="flex items-center gap-2 text-left text-primary">
            <span>{translations.edit_slot_title}</span>
            <span className="inline-flex shrink-0 items-center rounded-md bg-primary px-2 py-1 text-sm font-extrabold leading-none tracking-wide text-primary-foreground shadow-sm ring-1 ring-primary/30">
              {cellName}
            </span>
          </DialogTitle>
          <DialogDescription className="text-left text-xs leading-relaxed sm:text-sm">
            {translations.edit_slot_description_draggable}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-0 sm:py-4">
          <div className="grid gap-4">
            {notebooks.map((nb, idx) => {
              const isEmpty = !nb.barcode || nb.barcode.trim() === '';
              return (
                <div
                  className="grid grid-cols-[auto,minmax(0,1fr),auto] items-center gap-2 rounded-lg border bg-muted/20 p-2 sm:border-0 sm:bg-transparent sm:p-0"
                  key={idx}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                      sourceCellId: cellId,
                      notebook: nb,
                    }));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <Checkbox
                    id={`select-nb-${idx}`}
                    checked={selectedNotebooks.has(nb.barcode)}
                    onCheckedChange={() => handleToggleSelect(nb.barcode)}
                    aria-label={`${translations.barcode_label} #${idx + 1}`}
                  />
                  <div className="relative min-w-0">
                    <Label htmlFor={`barcode-${idx}`} className="absolute -top-2 left-2 z-10 bg-background px-1 text-[11px] font-medium text-muted-foreground">
                      {translations.barcode_label} #{idx + 1}
                    </Label>
                    <Barcode className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={`barcode-${idx}`}
                      value={nb.barcode}
                      onChange={e => handleNotebookChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNotebook();
                        }
                      }}
                      className={`h-11 w-full pl-10 transition-all duration-200 ${isEmpty ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      placeholder={translations.barcode_placeholder}
                      aria-invalid={isEmpty}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveNotebook(idx)}
                    aria-label={`${translations.delete_entry_button} #${idx + 1}`}
                    className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <Button type="button" variant="secondary" onClick={handleAddNotebook} className="h-11 w-full">
              + {translations.add_notebook || 'Add Notebook'}
            </Button>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-2 sm:border-t-0 sm:bg-transparent sm:p-0 sm:pt-2 sm:backdrop-blur-none">
          <div className={`w-full transition-all duration-300 ease-in-out ${selectedNotebooks.size > 0 ? 'max-h-40 opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
            <div className="grid grid-cols-2 gap-2 pb-1">
              <Button type="button" variant="outline" onClick={handleMoveRequest} disabled={selectedNotebooks.size === 0} className="w-full">
                <Move className="mr-2 h-4 w-4" />
                {translations.move_button}
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteSelected} disabled={selectedNotebooks.size === 0} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                {translations.delete_selected_button}
              </Button>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">{translations.close_button}</Button>
            </DialogClose>
            <Button type="button" onClick={handleSave} disabled={hasEmptyBarcode} className="w-full sm:w-auto">
              {translations.save_changes_button}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
              {translations.delete_entry_button}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      </Dialog>
  );
}