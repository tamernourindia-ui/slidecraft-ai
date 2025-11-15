import { create } from 'zustand';
import {
  GenerationSettings,
  AppStatus,
  GenerationResult,
  SummarizationLevel,
  FarsiFont,
  EnglishFont,
  ColorTheme,
  AIModel,
} from '@/lib/types';
import { generatePresentation } from '@/lib/presentation-generator';
interface GenerationState extends GenerationSettings {
  appStatus: AppStatus;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  result: GenerationResult | null;
  apiKey: string;
  isApiKeyValid: boolean;
  availableModels: AIModel[];
  selectedModel: string;
  setPaperName: (name: string) => void;
  setPdfFile: (file: File | null) => void;
  setNumSlides: (slides: number) => void;
  setSummarizationLevel: (level: SummarizationLevel) => void;
  setFarsiFont: (font: FarsiFont) => void;
  setEnglishFont: (font: EnglishFont) => void;
  setFontSize: (size: number) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setApiKey: (key: string) => void;
  setSelectedModel: (modelId: string) => void;
  validateApiKey: () => Promise<boolean>;
  setApiKeyValid: (isValid: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  startProcessing: () => Promise<void>;
  showResults: (result: GenerationResult) => void;
  reset: () => void;
}
const initialState: GenerationSettings = {
  paperName: '',
  pdfFile: null,
  numSlides: 25,
  summarizationLevel: 'medium',
  farsiFont: 'IRANSans',
  englishFont: 'Calibri',
  fontSize: 18,
  colorTheme: 'professional',
};
export const useGenerationStore = create<GenerationState>((set, get) => ({
  ...initialState,
  appStatus: 'form',
  currentStep: 1,
  isLoading: false,
  error: null,
  result: null,
  apiKey: '',
  isApiKeyValid: false,
  availableModels: [],
  selectedModel: '',
  setPaperName: (name) => set({ paperName: name }),
  setPdfFile: (file) => set({ pdfFile: file }),
  setNumSlides: (slides) => set({ numSlides: slides }),
  setSummarizationLevel: (level) => set({ summarizationLevel: level }),
  setFarsiFont: (font) => set({ farsiFont: font }),
  setEnglishFont: (font) => set({ englishFont: font }),
  setFontSize: (size) => set({ fontSize: size }),
  setColorTheme: (theme) => set({ colorTheme: theme }),
  setApiKey: (key) => set({ apiKey: key }),
  setSelectedModel: (modelId) => set({ selectedModel: modelId }),
  setApiKeyValid: (isValid) => set({ isApiKeyValid: isValid }),
  validateApiKey: async () => {
    const { apiKey } = get();
    if (!apiKey) {
      set({ error: 'API Key cannot be empty.' });
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(API_URL);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || 'Invalid API Key.');
      }
      const geminiModels = result.models
        .filter((m: any) => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => ({ id: m.name, name: m.displayName }))
        .sort((a: AIModel, b: AIModel) => a.name.localeCompare(b.name));
      if (geminiModels.length === 0) {
        throw new Error("No compatible Gemini models found for this API key.");
      }
      set({
        availableModels: geminiModels,
        selectedModel: geminiModels[0]?.id || '',
        isLoading: false,
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false, availableModels: [] });
      return false;
    }
  },
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  startProcessing: async () => {
    const { apiKey, selectedModel, ...settings } = get();
    if (!settings.pdfFile) {
      set({ error: 'PDF file is required.' });
      return;
    }
    if (!apiKey || !selectedModel) {
      set({ error: 'API Key and a selected model are required.' });
      return;
    }
    set({ appStatus: 'processing', isLoading: true, error: null });
    try {
      const { presentationBlob, presenterBlob, stats } = await generatePresentation(settings, apiKey, selectedModel);
      const presentationUrl = URL.createObjectURL(presentationBlob);
      const presenterUrl = URL.createObjectURL(presenterBlob);
      const resultData: GenerationResult = {
        statistics: stats,
        presentationUrl,
        presenterUrl,
      };
      set({ appStatus: 'results', result: resultData, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during generation.';
      console.error("Generation failed:", error);
      set({ appStatus: 'form', error: errorMessage, isLoading: false });
    }
  },
  showResults: (result) => set({ appStatus: 'results', result, isLoading: false }),
  reset: () => {
    const oldResult = get().result;
    if (oldResult) {
      URL.revokeObjectURL(oldResult.presentationUrl);
      URL.revokeObjectURL(oldResult.presenterUrl);
    }
    set({
      ...initialState,
      appStatus: 'form',
      currentStep: 1,
      isLoading: false,
      error: null,
      result: null,
      apiKey: '',
      isApiKeyValid: false,
      availableModels: [],
      selectedModel: '',
    });
  },
}));