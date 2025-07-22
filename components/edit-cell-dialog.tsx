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

  const [col, row] = cellId.split('-');

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
      <DialogContent className="sm:max-w-lg bg-background">
        <DialogHeader>
          <DialogTitle className="text-primary">{translations.edit_slot_title.replace('{col}', col).replace('{row}', row)}</DialogTitle>
          <DialogDescription>
            {translations.edit_slot_description_draggable}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {notebooks.map((nb, idx) => {
            const isEmpty = !nb.barcode || nb.barcode.trim() === '';
            return (
              <div
                className="relative flex items-center gap-2"
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
                  className="mr-2"
                />
                <Label htmlFor={`barcode-${idx}`} className="absolute -top-2 left-10 bg-background px-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  {translations.barcode_label} #{idx + 1}
                  <span className={`transition-all ${isEmpty ? 'text-destructive font-normal' : 'hidden'}`}>({translations.required || 'required'})</span>
                </Label>
                <Barcode className="absolute left-11 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                  className={`col-span-3 pl-10 transition-all duration-200 ${isEmpty ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder={translations.barcode_placeholder}
                  required
                />
                <Button type="button" variant="ghost" onClick={() => handleRemoveNotebook(idx)}>
                  <Trash2/>
                </Button>
              </div>
            );
          })}
          <Button type="button" variant="secondary" onClick={handleAddNotebook}>
            + {translations.add_notebook || 'Add Notebook'}
          </Button>
        </div>
        <DialogFooter className="flex flex-wrap justify-end gap-2">
          <div className={`transition-all duration-300 ease-in-out ${selectedNotebooks.size > 0 ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="outline" onClick={handleMoveRequest} disabled={selectedNotebooks.size === 0}>
                <Move className="mr-2 h-4 w-4" />
                {translations.move_button}
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteSelected} disabled={selectedNotebooks.size === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                {translations.delete_selected_button}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">{translations.close_button}</Button>
            </DialogClose>
            <Button type="button" onClick={handleSave} disabled={hasEmptyBarcode}>
              {translations.save_changes_button}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              {translations.delete_entry_button}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      </Dialog>
  );
}