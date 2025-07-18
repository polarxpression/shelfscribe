
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import translations from '../translations/pt.json';

interface TutorialStep {
  title: string;
  description: string;
  highlightId?: string | null;
  action?: () => void;
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  setHighlight: (highlightId: string | null) => void;
  onOpenCell: (cellId: string) => void;
  onCloseCell: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, setHighlight, onOpenCell, onCloseCell }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const tutorialSteps: TutorialStep[] = useMemo(() => [
    {
      title: translations.tutorial_step1_title,
      description: translations.tutorial_step1_desc,
    },
    {
      title: translations.tutorial_step2_title,
      description: translations.tutorial_step2_desc,
      highlightId: 'shelf-grid',
    },
    {
      title: translations.tutorial_step3_title,
      description: translations.tutorial_step3_desc,
      highlightId: '1-1',
      action: () => onOpenCell('1-1'),
    },
    {
      title: translations.tutorial_step4_title,
      description: translations.tutorial_step4_desc,
      highlightId: 'search-bar',
    },
    {
      title: translations.tutorial_step5_title,
      description: translations.tutorial_step5_desc,
      highlightId: 'more-options',
    },
    {
      title: translations.tutorial_step6_title,
      description: translations.tutorial_step6_desc,
    },
  ], [onOpenCell]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setHighlight(tutorialSteps[0].highlightId || null);
    }
  }, [isOpen, setHighlight, tutorialSteps]);

  useEffect(() => {
    setHighlight(tutorialSteps[currentStepIndex].highlightId || null);
  }, [currentStepIndex, setHighlight, tutorialSteps]);

  const goToStep = (index: number) => {
    if (index >= 0 && index < tutorialSteps.length) {
      onCloseCell(); 
      setCurrentStepIndex(index);
      if (tutorialSteps[index].action) {
        tutorialSteps[index].action();
      }
    }
  };

  const handleNext = () => {
    goToStep(currentStepIndex + 1);
  };

  const handlePrevious = () => {
    goToStep(currentStepIndex - 1);
  };

  const handleClose = () => {
    setHighlight(null);
    onCloseCell(); // Close any open dialogs when tutorial is skipped/finished
    onClose();
  };

  if (!isOpen || !tutorialSteps[currentStepIndex]) return null;

  const step = tutorialSteps[currentStepIndex];

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <div className="bg-popover border border-border text-popover-foreground rounded-lg shadow-2xl w-80">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        </div>

        <div className="p-4 flex justify-center items-center gap-4">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentStepIndex === index ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label={translations.tutorial_go_to_step.replace('{step}', (index + 1).toString())}
            />
          ))}
        </div>

        <div className="p-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={handleClose}>
            {translations.tutorial_skip_button}
          </Button>
          <div className="flex gap-2 mb-2 sm:mb-0">
            {currentStepIndex > 0 && (
              <Button variant="ghost" onClick={handlePrevious} size="icon">
                <ArrowLeft />
                <span className="sr-only">{translations.tutorial_previous_button}</span>
              </Button>
            )}
            {currentStepIndex < tutorialSteps.length - 1 ? (
              <Button onClick={handleNext}>{translations.tutorial_next_button} <ArrowRight /></Button>
            ) : (
              <Button onClick={handleClose}>{translations.tutorial_finish_button}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
