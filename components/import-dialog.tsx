"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import translations from "../translations/pt.json";

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (merge: boolean) => void;
};

export default function ImportDialog({ open, onOpenChange, onConfirm }: ImportDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{translations.import_dialog_title}</AlertDialogTitle>
          <AlertDialogDescription>
            {translations.import_dialog_description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>{translations.cancel_button}</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(false)}>{translations.import_dialog_replace}</AlertDialogAction>
          <AlertDialogAction onClick={() => onConfirm(true)}>{translations.import_dialog_merge}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}