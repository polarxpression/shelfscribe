'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Barcode, Trash2 } from 'lucide-react';
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
};

export default function EditCellDialog({
  isOpen,
  cellId,
  currentNotebooks,
  onSave,
  onDelete,
  onClose,
}: EditCellDialogProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(currentNotebooks);

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

  const hasEmptyBarcode = notebooks.some(nb => !nb.barcode || nb.barcode.trim() === '');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-primary">{translations.edit_slot_title.replace('{col}', col).replace('{row}', row)}</DialogTitle>
          <DialogDescription>
            {translations.edit_slot_description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {notebooks.map((nb, idx) => {
            const isEmpty = !nb.barcode || nb.barcode.trim() === '';
            return (
              <div className="relative flex items-center gap-2" key={idx}>
                <Label htmlFor={`barcode-${idx}`} className="absolute -top-2 left-2 inline-block bg-background px-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  {translations.barcode_label} #{idx + 1}
                  <span className={`transition-all ${isEmpty ? 'text-destructive font-normal' : 'hidden'}`}>({translations.required || 'required'})</span>
                </Label>
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id={`barcode-${idx}`}
                  value={nb.barcode}
                  onChange={e => handleNotebookChange(idx, e.target.value)}
                  className={`col-span-3 pl-10 transition-all duration-200 ${isEmpty ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  placeholder={translations.barcode_placeholder}
                  autoFocus={idx === 0}
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
        <DialogFooter className="sm:justify-between gap-2">
          <Button type="button" onClick={handleSave} disabled={hasEmptyBarcode}>
            {translations.save_changes_button}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}