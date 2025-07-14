
'use client';

import { useState, useEffect } from 'react';
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
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onStepChange: (step: TutorialStep) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ steps, isOpen, onStepChange, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      onStepChange(steps[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      onStepChange(steps[index]);
    }
  };

  const handleNext = () => {
    goToStep(currentStepIndex + 1);
  };

  const handlePrevious = () => {
    goToStep(currentStepIndex - 1);
  };

  if (!isOpen || !steps[currentStepIndex]) return null;

  const step = steps[currentStepIndex];

  return (
    <div className="fixed bottom-5 right-5 z-[150]">
      <div className="bg-popover border border-border text-popover-foreground rounded-lg shadow-2xl w-80">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        </div>

        <div className="p-4 flex justify-center items-center gap-4">
          {steps.map((_, index) => (
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
          <Button variant="outline" onClick={onClose}>
            {translations.tutorial_skip_button}
          </Button>
          <div className="flex gap-2 mb-2 sm:mb-0">
            {currentStepIndex > 0 && (
              <Button variant="ghost" onClick={handlePrevious} size="icon">
                <ArrowLeft />
                <span className="sr-only">{translations.tutorial_previous_button}</span>
              </Button>
            )}
            {currentStepIndex < steps.length - 1 ? (
              <Button onClick={handleNext}>{translations.tutorial_next_button} <ArrowRight /></Button>
            ) : (
              <Button onClick={onClose}>{translations.tutorial_finish_button}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
