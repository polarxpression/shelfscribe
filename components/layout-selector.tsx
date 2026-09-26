"use client";

import { Check, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import translations from "../translations/pt.json";

export type LayoutOption = {
  id: string;
  name: string;
};

type LayoutSelectorProps = {
  layouts: LayoutOption[];
  activeLayoutId: string;
  onLayoutChange: (layoutId: string) => void;
  onCreateLayout: () => void;
  onRenameLayout: () => void;
  onDeleteLayout: () => void;
};

export default function LayoutSelector({
  layouts,
  activeLayoutId,
  onLayoutChange,
  onCreateLayout,
  onRenameLayout,
  onDeleteLayout,
}: LayoutSelectorProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 px-2 text-left font-medium sm:w-[220px]"
            aria-label={translations.select_layout_placeholder}
          >
            <span className="truncate">{layouts.find((layout) => layout.id === activeLayoutId)?.name ?? translations.select_layout_placeholder}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(90vw,280px)] p-1">
          <div className="space-y-1">
            {layouts.map((layout) => {
              const active = layout.id === activeLayoutId;
              return (
                <Button
                  key={layout.id}
                  type="button"
                  variant="ghost"
                  onClick={() => onLayoutChange(layout.id)}
                  className="h-11 w-full justify-between px-3 font-normal"
                >
                  <span className="truncate">{layout.name}</span>
                  {active && <Check className="h-4 w-4 shrink-0" />}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onCreateLayout}
          aria-label={translations.new_layout_button}
          className="h-10 w-10 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onRenameLayout}
          aria-label={translations.rename_layout_button}
          className="h-10 w-10 shrink-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onDeleteLayout}
          disabled={layouts.length <= 1}
          aria-label={translations.delete_layout_button}
          className="h-10 w-10 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
