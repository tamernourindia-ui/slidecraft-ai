import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { KeyRound, BrainCircuit, Loader, AlertCircle, CheckCircle } from 'lucide-react';
export function ApiKeyGate() {
  const apiKey = useGenerationStore((s) => s.apiKey);
  const setApiKey = useGenerationStore((s) => s.setApiKey);
  const isLoading = useGenerationStore((s) => s.isLoading);
  const error = useGenerationStore((s) => s.error);
  const validateApiKey = useGenerationStore((s) => s.validateApiKey);
  const availableModels = useGenerationStore((s) => s.availableModels);
  const selectedModel = useGenerationStore((s) => s.selectedModel);
  const setSelectedModel = useGenerationStore((s) => s.setSelectedModel);
  const setApiKeyValid = useGenerationStore((s) => s.setApiKeyValid);
  const [isValidated, setIsValidated] = useState(false);
  const handleValidate = async () => {
    const success = await validateApiKey();
    if (success) {
      setIsValidated(true);
    }
  };
  const handleStart = () => {
    if (selectedModel) {
      setApiKeyValid(true);
    }
  };
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Welcome to SlideCraft AI</h2>
        <p className="text-muted-foreground">Please provide your Cloudflare AI Gateway API key to begin.</p>
      </div>
      <AnimatePresence mode="wait">
        {!isValidated ? (
          <motion.div
            key="validation"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex items-center gap-2">
                <PasswordInput
                  id="api-key"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={handleValidate} disabled={isLoading || !apiKey}>
                  {isLoading ? <Loader className="animate-spin h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                  <span className="ml-2">Validate</span>
                </Button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">API Key Validated!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                You can now select a model and start generating.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="model-select">Select AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Choose a model..." />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStart} disabled={!selectedModel} className="w-full">
              <BrainCircuit className="mr-2 h-4 w-4" />
              Start Generating
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}