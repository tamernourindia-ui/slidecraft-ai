import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { CheckCircle2, Loader, AlertCircle, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerationResult, ProcessingStep } from '@/lib/types';
const mockSteps: ProcessingStep[] = [
  { id: 'research', title: 'Researching & Analyzing Source', status: 'pending', progress: 0 },
  { id: 'pdf_extract', title: 'Extracting PDF Content', status: 'pending', progress: 0 },
  { id: 'summarize', title: 'Intelligent Summarization', status: 'pending', progress: 0 },
  { id: 'translate', title: 'Specialized Translation', status: 'pending', progress: 0 },
  { id: 'generate_ppt', title: 'Generating PowerPoint Files', status: 'pending', progress: 0 },
  { id: 'finalize', title: 'Finalizing & Saving', status: 'pending', progress: 0 },
];
const mockResult: GenerationResult = {
  statistics: {
    source: 'Diabetic Retinopathy Treatment',
    field: 'Ophthalmology',
    pdfPages: 28,
    slides: 25,
    summaryLevel: 'Medium (50%)',
    duration: '3m 45s',
    translationQuality: 'Expert PhD',
  },
  presentationUrl: '#',
  presenterUrl: '#',
};
export function ProcessingView() {
  const { processingSteps, setProcessingSteps, updateProcessingStep, showResults } = useGenerationStore((state) => ({
    processingSteps: state.processingSteps,
    setProcessingSteps: state.setProcessingSteps,
    updateProcessingStep: state.updateProcessingStep,
    showResults: state.showResults,
  }));
  useEffect(() => {
    setProcessingSteps(mockSteps);
    let stepIndex = 0;
    const processStep = () => {
      if (stepIndex >= mockSteps.length) {
        setTimeout(() => showResults(mockResult), 1000);
        return;
      }
      const currentStepId = mockSteps[stepIndex].id;
      updateProcessingStep(currentStepId, { status: 'in_progress' });
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          clearInterval(interval);
          updateProcessingStep(currentStepId, { status: 'completed', progress: 100 });
          stepIndex++;
          setTimeout(processStep, 500);
        } else {
          updateProcessingStep(currentStepId, { progress });
        }
      }, 200);
    };
    const timeout = setTimeout(processStep, 500);
    return () => clearTimeout(timeout);
  }, [setProcessingSteps, updateProcessingStep, showResults]);
  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'in_progress':
        return <Loader className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <FileText className="h-6 w-6 text-muted-foreground" />;
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Generating Your Presentation...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <ul className="space-y-4">
            {processingSteps.map((step, index) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <span className="font-medium">{step.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(step.progress)}%</span>
                </div>
                <Progress value={step.progress} className="h-2" />
              </motion.li>
            ))}
          </ul>
          <p className="text-center text-sm text-muted-foreground">
            This process may take a few minutes. Please don't close this window.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}