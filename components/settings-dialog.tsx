"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import ImportDialog from "./import-dialog";
import translations from "../translations/pt.json";

import { SlidersHorizontal } from 'lucide-react';

type SettingsDialogProps = {
  onShowTutorial: () => void;
  onReset: () => void;
  onExport: () => void;
  onImportFile: (file: File, merge: boolean) => void;
};

export default function SettingsDialog({ onShowTutorial, onReset, onExport, onImportFile }: SettingsDialogProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setShowImportDialog(true);
    }
  };

  const handleImportConfirm = (merge: boolean) => {
    if (selectedFile) {
      onImportFile(selectedFile, merge);
    }
    setShowImportDialog(false);
    setSelectedFile(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleShowTutorialClick = () => {
    onShowTutorial();
    setOpen(false); // Close the settings dialog
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More options">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{translations.more_options_button}</DialogTitle>
            <DialogDescription>
              {translations.shelf_description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleShowTutorialClick}>{translations.view_tutorial_button}</Button>
            </DialogClose>
            <Button variant="outline" onClick={handleImportClick}>{translations.import_json_button}</Button>
            <Button variant="outline" onClick={onExport}>{translations.export_json_button}</Button>
            <Button variant="destructive" onClick={() => { onReset(); setOpen(false); }}>{translations.reset_button}</Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{translations.close_button}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onConfirm={handleImportConfirm}
      />
    </>
  );
}
