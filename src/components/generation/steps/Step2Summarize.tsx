import { motion } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SummarizationLevel } from '@/lib/types';
export function Step2Summarize() {
  const numSlides = useGenerationStore((s) => s.numSlides);
  const setNumSlides = useGenerationStore((s) => s.setNumSlides);
  const summarizationLevel = useGenerationStore((s) => s.summarizationLevel);
  const setSummarizationLevel = useGenerationStore((s) => s.setSummarizationLevel);
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Summarization Settings</h2>
        <p className="text-muted-foreground">Control the length and detail of your presentation.</p>
      </div>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="num-slides">Number of Slides</Label>
            <span className="text-sm font-medium text-primary">{numSlides} slides</span>
          </div>
          <Slider
            id="num-slides"
            min={5}
            max={100}
            step={1}
            value={[numSlides]}
            onValueChange={(value) => setNumSlides(value[0])}
          />
        </div>
        <div className="space-y-4">
          <Label>Summarization Level</Label>
          <RadioGroup
            value={summarizationLevel}
            onValueChange={(value) => setSummarizationLevel(value as SummarizationLevel)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { value: 'low', label: 'Low', description: 'Brief summary (approx. 30%)' },
              { value: 'medium', label: 'Medium', description: 'Balanced summary (approx. 50%)' },
              { value: 'high', label: 'High', description: 'Detailed summary (approx. 70%)' },
            ].map(({ value, label, description }) => (
              <Label
                key={value}
                htmlFor={`level-${value}`}
                className="flex flex-col items-start space-y-1 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={value} id={`level-${value}`} />
                  <span className="font-medium">{label}</span>
                </div>
                <p className="text-sm text-muted-foreground pl-7">{description}</p>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </motion.div>
  );
}