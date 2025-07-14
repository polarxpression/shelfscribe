
'use client';

import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import translations from '../translations/pt.json';

type ImportButtonProps = {
  onImport: (data: any) => void;
  onError: (message: string) => void;
};

export default function ImportButton({ onImport, onError }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const data = JSON.parse(content);
          onImport(data);
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
        <Upload className="h-5 w-5" />
        <span className="sr-only">{translations.import_json_button}</span>
      </Button>
    </>
  );
}
