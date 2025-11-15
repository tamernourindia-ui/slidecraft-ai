import { motion } from 'framer-motion';
import { useGenerationStore } from '@/hooks/useGenerationStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/ui/file-uploader';
export function Step1Info() {
  const paperName = useGenerationStore((s) => s.paperName);
  const setPaperName = useGenerationStore((s) => s.setPaperName);
  const pdfFile = useGenerationStore((s) => s.pdfFile);
  const setPdfFile = useGenerationStore((s) => s.setPdfFile);
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Article Information</h2>
        <p className="text-muted-foreground">Start by providing the article's name and uploading the PDF file.</p>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="paper-name">Article Name (English)</Label>
          <Input
            id="paper-name"
            placeholder="e.g., Diabetic Retinopathy: Diagnosis and Treatment"
            value={paperName}
            onChange={(e) => setPaperName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pdf-file">PDF File</Label>
          <FileUploader value={pdfFile} onValueChange={setPdfFile} />
        </div>
      </div>
    </motion.div>
  );
}