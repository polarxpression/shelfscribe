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
import translations from '../translations/pt.json';

type MoveNotebooksDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetCellId: string) => void;
  currentCellId: string;
};

export default function MoveNotebooksDialog({ isOpen, onClose, onMove, currentCellId }: MoveNotebooksDialogProps) {
  const [targetCell, setTargetCell] = useState('');

  const handleMove = () => {
    onMove(targetCell);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{translations.move_notebooks_title}</DialogTitle>
          <DialogDescription>
            {translations.move_notebooks_description}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="target-cell">{translations.target_cell_label}</Label>
          <Input
            id="target-cell"
            value={targetCell}
            onChange={(e) => setTargetCell(e.target.value)}
            placeholder="e.g., 2-3"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{translations.cancel_button}</Button>
          <Button onClick={handleMove} disabled={!targetCell.match(/^\d+-\d+$/) || targetCell === currentCellId}>
            {translations.move_button}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
