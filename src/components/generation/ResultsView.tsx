import { motion } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileSliders, BarChart, CheckCircle, RefreshCw, Copy } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
export function ResultsView() {
  const result = useGenerationStore((s) => s.result);
  const reset = useGenerationStore((s) => s.reset);
  const settings = useGenerationStore((s) => ({
    farsiFont: s.farsiFont,
    englishFont: s.englishFont,
    fontSize: s.fontSize,
    colorTheme: s.colorTheme,
  }));
  if (!result) {
    return (
      <div className="text-center">
        <p>No results to display.</p>
        <Button onClick={reset} className="mt-4">Start Over</Button>
      </div>
    );
  }
  const { statistics, presentationUrl, presenterUrl } = result;
  const copyStats = () => {
    const statsText = Object.entries(statistics).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`).join('\n');
    navigator.clipboard.writeText(statsText);
    toast.success('Statistics copied to clipboard!');
  };
  const handleDownload = (url: string) => {
    // In a real scenario, this would trigger a download.
    // For now, we'll just log it and show a toast, as the backend returns mock URLs.
    console.log(`Downloading from: ${url}`);
    toast.info("Download functionality will be fully enabled in the next phase.");
    // window.open(url, '_blank'); // This would be used with real URLs
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold">Generation Complete!</CardTitle>
          <CardDescription>Your PowerPoint presentations are ready for download.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart className="h-5 w-5" /> Statistics</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                {Object.entries(statistics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileSliders className="h-5 w-5" /> Applied Settings</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Farsi Font</span><span className="font-medium">{settings.farsiFont}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">English Font</span><span className="font-medium">{settings.englishFont}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Font Size</span><span className="font-medium">{settings.fontSize}pt</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Color Theme</span><span className="font-medium capitalize">{settings.colorTheme.replace('_', ' ')}</span></div>
              </CardContent>
            </Card>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Download Your Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button size="lg" className="h-auto py-3 flex flex-col items-start text-left" onClick={() => handleDownload(presentationUrl)}>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <span className="font-semibold">Presentation Version</span>
                </div>
                <span className="text-xs opacity-80">Polished design for your audience.</span>
              </Button>
              <Button size="lg" variant="secondary" className="h-auto py-3 flex flex-col items-start text-left" onClick={() => handleDownload(presenterUrl)}>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <span className="font-semibold">Presenter Version</span>
                </div>
                <span className="text-xs opacity-80">Includes detailed speaker notes.</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 p-6 bg-muted/50">
          <Button variant="outline" onClick={copyStats}><Copy className="mr-2 h-4 w-4" /> Copy Stats</Button>
          <Button onClick={reset}><RefreshCw className="mr-2 h-4 w-4" /> Create New Presentation</Button>
        </CardFooter>
      </Card>
      <Toaster richColors />
    </motion.div>
  );
}