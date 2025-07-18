'use client';

import { Button } from '@/components/ui/button';
import translations from '../translations/pt.json';

type MoveModeBannerProps = {
  onCancel: () => void;
};

export default function MoveModeBanner({ onCancel }: MoveModeBannerProps) {
  return (
    <div className="bg-primary text-primary-foreground p-4 text-center">
      <p className="font-semibold">{translations.move_mode_active_title}</p>
      <p className="text-sm">{translations.move_mode_active_description}</p>
      <Button variant="secondary" onClick={onCancel} className="mt-2">
        {translations.cancel_button}
      </Button>
    </div>
  );
}