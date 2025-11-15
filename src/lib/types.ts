export type SummarizationLevel = "low" | "medium" | "high";
export type FarsiFont = "Vazir" | "Yekan" | "IRANSans" | "Samim";
export type EnglishFont = "Calibri" | "Arial" | "Roboto";
export type ColorTheme = "high_contrast" | "professional" | "dark";
export interface GenerationSettings {
  paperName: string;
  pdfFile: File | null;
  numSlides: number;
  summarizationLevel: SummarizationLevel;
  farsiFont: FarsiFont;
  englishFont: EnglishFont;
  fontSize: number;
  colorTheme: ColorTheme;
}
export type AppStatus = "form" | "processing" | "results";
export interface ProcessingStep {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "error";
  progress: number;
  details?: string;
}
export interface GenerationResult {
  statistics: {
    source: string;
    field: string;
    pdfPages: number;
    slides: number;
    summaryLevel: string;
    duration: string;
    modelUsed: string;
  };
  presentationUrl: string;
  presenterUrl: string;
}
export interface AIModel {
  id: string;
  name: string;
}