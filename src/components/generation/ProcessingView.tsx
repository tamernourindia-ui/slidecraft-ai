import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Loader, AlertCircle, CheckCircle, FileText, BrainCircuit, Palette, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
type Step = {
  id: string;
  title: string;
  icon: React.ElementType;
};
const processingSteps: Step[] = [
  { id: 'analyzing', title: 'Analyzing PDF', icon: FileText },
  { id: 'summarizing', title: 'Summarizing Content', icon: BrainCircuit },
  { id: 'designing', title: 'Designing Slides', icon: Palette },
  { id: 'finalizing', title: 'Finalizing Files', icon: PackageCheck },
];
export function ProcessingView() {
  const error = useGenerationStore((s) => s.error);
  const reset = useGenerationStore((s) => s.reset);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (error) return;
    const stepDuration = 3000; // Simulate 3 seconds per step
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStepIndex((csi) => Math.min(csi + 1, processingSteps.length - 1));
          return 0;
        }
        return prev + 5;
      });
    }, stepDuration / 20);
    return () => clearInterval(progressInterval);
  }, [error]);
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full text-center"
      >
        <Card className="border-destructive">
          <CardHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/50 rounded-full h-12 w-12 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Generation Failed</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={reset} variant="destructive">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
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
          <CardDescription className="text-center">This may take a few minutes. Please don't close this window.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6 min-h-[250px]">
          {processingSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <AnimatePresence key={step.id}>
                {index <= currentStepIndex && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <step.icon className={`h-6 w-6 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className={`font-medium ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>{step.title}</p>
                      <Progress value={isCompleted ? 100 : isActive ? progress : 0} className="h-2 mt-1" />
                    </div>
                    <div className="w-24 text-right">
                      {isCompleted && <span className="text-sm text-green-500">Completed</span>}
                      {isActive && <span className="text-sm text-primary">In Progress...</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}