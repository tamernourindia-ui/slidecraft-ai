import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
type FileUploaderProps = {
  value: File | null;
  onValueChange: (file: File | null) => void;
  dropzoneOptions?: DropzoneOptions;
  className?: string;
};
export function FileUploader({ value, onValueChange, dropzoneOptions, className }: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onValueChange(acceptedFiles[0] ?? null);
    },
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    ...dropzoneOptions,
  });
  return (
    <div
      {...getRootProps()}
      className={twMerge(
        'relative flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-muted transition-colors',
        isDragActive && 'border-primary bg-primary/10',
        className
      )}
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="flex flex-col items-center justify-center text-center">
          <FileIcon className="w-12 h-12 text-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">{value.name}</p>
          <p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onValueChange(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PDF file (max 100MB)</p>
        </div>
      )}
    </div>
  );
}