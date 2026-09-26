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
    <div className="flex flex-wrap items-center gap-2">
      <Select value={activeLayoutId} onValueChange={onLayoutChange}>
        <SelectTrigger className="w-[220px] bg-background">
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

      <Button variant="outline" size="icon" onClick={onCreateLayout} aria-label={translations.new_layout_button}>
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onRenameLayout} aria-label={translations.rename_layout_button}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onDeleteLayout}
        disabled={layouts.length <= 1}
        aria-label={translations.delete_layout_button}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
