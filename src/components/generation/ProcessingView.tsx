import { motion } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Loader, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
export function ProcessingView() {
  const isLoading = useGenerationStore((s) => s.isLoading);
  const error = useGenerationStore((s) => s.error);
  const reset = useGenerationStore((s) => s.reset);
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
        </CardHeader>
        <CardContent className="space-y-6 p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader className="h-16 w-16 text-blue-500 animate-spin" />
          <p className="text-center text-muted-foreground">
            This process may take a few minutes.
            <br />
            Please don't close this window.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}