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
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 bg-background/95 p-3 backdrop-blur sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <BookMarked className="h-7 w-7 shrink-0 stroke-primary sm:h-8 sm:w-8" />
        <h1 className="truncate text-lg font-bold text-primary sm:text-2xl">{translations.my_notebook_shelf_title}</h1>
      </div>
      <div className={cn('order-3 w-full sm:order-none sm:flex-1 sm:max-w-md sm:mx-4', tutorialHighlight === 'search-bar' ? 'tutorial-highlight' : '')}>
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
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <ModeToggle />
        <div className={cn(tutorialHighlight === 'more-options' ? 'tutorial-highlight' : '')}>
          <SettingsDialog onShowTutorial={onShowTutorial} onReset={onReset} onExport={onExport} onImportFile={onImportFile} />
        </div>
      </div>
    </header>
  );
}
