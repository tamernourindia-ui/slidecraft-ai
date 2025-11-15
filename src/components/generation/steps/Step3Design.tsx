import { motion } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FarsiFont, EnglishFont, ColorTheme } from '@/lib/types';
import { Palette, Type, Contrast } from 'lucide-react';
export function Step3Design() {
  const farsiFont = useGenerationStore((s) => s.farsiFont);
  const setFarsiFont = useGenerationStore((s) => s.setFarsiFont);
  const englishFont = useGenerationStore((s) => s.englishFont);
  const setEnglishFont = useGenerationStore((s) => s.setEnglishFont);
  const fontSize = useGenerationStore((s) => s.fontSize);
  const setFontSize = useGenerationStore((s) => s.setFontSize);
  const colorTheme = useGenerationStore((s) => s.colorTheme);
  const setColorTheme = useGenerationStore((s) => s.setColorTheme);
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Design & Style</h2>
        <p className="text-muted-foreground">Customize the look and feel of your presentation.</p>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Farsi Font</Label>
            <Select value={farsiFont} onValueChange={(v) => setFarsiFont(v as FarsiFont)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IRANSans">IRANSans</SelectItem>
                <SelectItem value="Vazir">Vazir</SelectItem>
                <SelectItem value="Yekan">Yekan</SelectItem>
                <SelectItem value="Samim">Samim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>English Font</Label>
            <Select value={englishFont} onValueChange={(v) => setEnglishFont(v as EnglishFont)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Calibri">Calibri</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select value={String(fontSize)} onValueChange={(v) => setFontSize(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[12, 14, 16, 18, 20, 22, 24, 28].map(size => (
                  <SelectItem key={size} value={String(size)}>{size} pt</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <Label>Color Theme (Projector-Friendly)</Label>
          <RadioGroup
            value={colorTheme}
            onValueChange={(value) => setColorTheme(value as ColorTheme)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { value: 'professional', label: 'Professional', icon: Palette, colors: ['bg-blue-700', 'bg-slate-100'] },
              { value: 'high_contrast', label: 'High Contrast', icon: Contrast, colors: ['bg-black', 'bg-white'] },
              { value: 'dark', label: 'Dark Mode', icon: Type, colors: ['bg-slate-800', 'bg-cyan-400'] },
            ].map(({ value, label, icon: Icon, colors }) => (
              <Label
                key={value}
                htmlFor={`theme-${value}`}
                className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value={value} id={`theme-${value}`} />
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
                <div className="ml-auto flex -space-x-1">
                  <div className={`h-4 w-4 rounded-full border-2 border-white dark:border-black ${colors[0]}`}></div>
                  <div className={`h-4 w-4 rounded-full border-2 border-white dark:border-black ${colors[1]}`}></div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </motion.div>
  );
}