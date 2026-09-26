"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <Select value={activeLayoutId} onValueChange={onLayoutChange}>
        <SelectTrigger className="w-full bg-background sm:w-[220px]">
          <SelectValue placeholder={translations.select_layout_placeholder} />
        </SelectTrigger>
        <SelectContent>
          {layouts.map((layout) => (
            <SelectItem key={layout.id} value={layout.id}>
              {layout.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
