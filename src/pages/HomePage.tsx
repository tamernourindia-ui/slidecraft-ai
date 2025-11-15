import { AnimatePresence, motion } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { MultiStepForm } from '@/components/generation/MultiStepForm';
import { ProcessingView } from '@/components/generation/ProcessingView';
import { ResultsView } from '@/components/generation/ResultsView';
import { ApiKeyGate } from '@/components/generation/ApiKeyGate';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileSliders } from 'lucide-react';
export function HomePage() {
  const appStatus = useGenerationStore((s) => s.appStatus);
  const isApiKeyValid = useGenerationStore((s) => s.isApiKeyValid);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-foreground">
      <div
        className="absolute top-0 left-0 w-full h-full bg-grid-slate-200/[0.6] dark:bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"
      />
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/10 dark:bg-blue-500/20 rounded-lg">
              <FileSliders className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-slate-50 dark:to-slate-400 bg-clip-text text-transparent">
              SlideCraft AI
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligently transform scientific PDF articles into professional, presentation-ready PowerPoint files.
          </p>
        </motion.div>
        <AnimatePresence mode="wait">
          {!isApiKeyValid ? (
            <motion.div
              key="api-gate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl bg-card p-6 sm:p-8 rounded-2xl shadow-2xl shadow-slate-900/10 border"
            >
              <ApiKeyGate />
            </motion.div>
          ) : (
            <motion.div
              key={appStatus}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-card p-6 sm:p-8 rounded-2xl shadow-2xl shadow-slate-900/10 border"
            >
              {appStatus === 'form' && <MultiStepForm />}
              {appStatus === 'processing' && <ProcessingView />}
              {appStatus === 'results' && <ResultsView />}
            </motion.div>
          )}
        </AnimatePresence>
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>Built with ❤️ at Cloudflare.
            <br />
            AI requests are subject to rate limits across all users.
          </p>
        </footer>
      </main>
    </div>
  );
}