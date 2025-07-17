
'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import translations from '../translations/pt.json';

type ImportButtonProps = {
  onImport: (data: any, merge: boolean) => void;
  onError: (message: string) => void;
};

export default function ImportButton({ onImport, onError }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedData, setImportedData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const data = JSON.parse(content);
          setImportedData(data);
          setIsDialogOpen(true);
        }
      } catch (error) {
        console.error('Failed to parse JSON file', error);
        onError(translations.import_error_invalid_json);
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file');
      onError(translations.import_error_reading_file);
    };
    reader.readAsText(file);
  };

  const handleMerge = () => {
    onImport(importedData, true);
    setIsDialogOpen(false);
    setImportedData(null);
  };

  const handleReplace = () => {
    onImport(importedData, false);
    setIsDialogOpen(false);
    setImportedData(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/json"
      />
      <Button onClick={handleClick} variant="outline" size="icon">
        <Download className="h-5 w-5" />
        {translations.import_json_button}
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.import_dialog_title}</AlertDialogTitle>
            <AlertDialogDescription>
              {translations.import_dialog_description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
              {translations.import_dialog_cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMerge}>
              {translations.import_dialog_merge}
            </AlertDialogAction>
            <AlertDialogAction onClick={handleReplace}>
              {translations.import_dialog_replace}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
