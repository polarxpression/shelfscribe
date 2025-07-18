"use client";

import { Search, BookMarked } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';
import translations from '../translations/pt.json';
import { ModeToggle } from './mode-toggle';
import SettingsDialog from './settings-dialog';

type HeaderProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tutorialHighlight: string | null;
  onImportFile: (file: File, merge: boolean) => void;
  onShowTutorial: () => void;
  onReset: () => void;
  onExport: () => void;
};

export default function Header({
  searchQuery,
  onSearchChange,
  onShowTutorial,
  tutorialHighlight,
  onImportFile,
  onReset,
  onExport
}: HeaderProps) {

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center gap-4">
        <BookMarked className="h-8 w-8 stroke-primary" />
        <h1 className="text-2xl font-bold text-primary">{translations.my_notebook_shelf_title}</h1>
      </div>
      <div className={cn('flex-1 max-w-md', tutorialHighlight === 'search-bar' ? 'tutorial-highlight' : '')}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={translations.search_placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <div className={cn('flex-1 max-w-md', tutorialHighlight === 'more-options' ? 'tutorial-highlight' : '')}>
          <SettingsDialog onShowTutorial={onShowTutorial} onReset={onReset} onExport={onExport} onImportFile={onImportFile} />
        </div>
      </div>
    </header>
  );
}
