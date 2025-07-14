'use client';

import { Search, BookMarked, Github, MoreVertical, FileQuestion, Upload, Download} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import translations from '../translations/pt.json';
import { useRef } from 'react';
import { ModeToggle } from './mode-toggle';

type HeaderProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShowTutorial: () => void;
  tutorialHighlight: string | null;
  onImport: (data: any) => void; // Add this line
  onImportError: (message: string) => void; // Add this line
};

export default function Header({ 
  searchQuery, 
  onSearchChange, 
  onShowTutorial, 
  tutorialHighlight, 
  onImport, 
  onImportError 
}: HeaderProps) {
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
        onImportError(translations.import_error_invalid_json);
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file');
      onImportError(translations.import_error_reading_file);
    };
    reader.readAsText(file);
    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50 select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/json"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          <div className="flex items-center gap-2">
            <BookMarked className="h-7 w-7 text-primary" />
            <h1 className="pointer-events-none text-lg md:text-xl font-bold text-primary tracking-tight">
              Shelfscribe
            </h1>
          </div>
          <div className="flex-1 flex justify-center px-2 sm:px-4">
            <div
              id="search-bar"
              className={cn('w-full max-w-sm relative transition-all duration-300 rounded-md', {'ring-2 ring-primary ring-offset-2 ring-offset-background': tutorialHighlight === 'search-bar'})}
              
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={translations.search_placeholder}
                  className="w-full pl-8 h-9 bg-secondary focus:bg-background pr-8"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 focus:outline-none"
                    
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1" >
            <ModeToggle />
            <div id="more-options" className={cn('relative rounded-full transition-all duration-300', {'ring-2 ring-primary ring-offset-2 ring-offset-background': tutorialHighlight === 'more-options'})}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" >
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">{translations.more_options_button}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleImportClick}>
                    <Download />{translations.import_json_button}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert("Exporting not implemented yet!")}>
                    <Upload /> {translations.export_json_button}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onShowTutorial}>
                    <FileQuestion /> {translations.view_tutorial_button as string}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="https://github.com/firebase/studio" target="_blank" rel="noopener noreferrer">
                      <Github /> {translations.github_link}
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
}