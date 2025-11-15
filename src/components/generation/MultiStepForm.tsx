import { AnimatePresence } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Step1Info } from './steps/Step1Info';
import { Step2Summarize } from './steps/Step2Summarize';
import { Step3Design } from './steps/Step3Design';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
export function MultiStepForm() {
  const currentStep = useGenerationStore((s) => s.currentStep);
  const nextStep = useGenerationStore((s) => s.nextStep);
  const prevStep = useGenerationStore((s) => s.prevStep);
  const startProcessing = useGenerationStore((s) => s.startProcessing);
  const paperName = useGenerationStore((s) => s.paperName);
  const pdfFile = useGenerationStore((s) => s.pdfFile);
  const isStep1Valid = paperName.trim() !== '' && pdfFile !== null;
  const canGoNext = currentStep === 1 ? isStep1Valid : true;
  const steps = [
    { number: 1, name: 'Information' },
    { number: 2, name: 'Summarization' },
    { number: 3, name: 'Design' },
  ];
  return (
    <div className="w-full">
      <div className="mb-8">
        <Progress value={(currentStep / 3) * 100} className="h-2" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`w-1/3 text-center ${currentStep >= step.number ? 'font-semibold text-foreground' : ''}`}
            >
              Step {step.number}: {step.name}
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[420px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && <Step1Info key="step1" />}
          {currentStep === 2 && <Step2Summarize key="step2" />}
          {currentStep === 3 && <Step3Design key="step3" />}
        </AnimatePresence>
      </div>
      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {currentStep < 3 ? (
          <Button onClick={nextStep} disabled={!canGoNext}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={startProcessing} className="bg-blue-600 hover:bg-blue-700">
            Generate Presentation <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}