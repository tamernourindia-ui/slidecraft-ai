import PptxGenJS from 'pptxgenjs';
import * as pdfjsLib from 'pdfjs-dist';
import { GenerationSettings } from './types';
// Configure the worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;
type SlideContent = {
  slide_number: number;
  title: string;
  content: string;
  key_points: string[];
  original_section: string;
};
type TranslatedSlideContent = {
  title_fa: string;
  content_fa: string;
  key_points_fa: string[];
  title_en: string;
  content_en: string;
  key_points_en: string[];
};
const extractPdfData = async (file: File): Promise<{ text: string; pageCount: number }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = '';
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  return { text: fullText, pageCount: numPages };
};
const callGoogleAI = async (prompt: string, apiKey: string, model: string): Promise<any> => {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
      }
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Google AI API Error:", errorBody);
    throw new Error(`Google AI API request failed with status ${response.status}`);
  }
  const data = await response.json();
  const text = data.candidates[0]?.content.parts[0]?.text;
  if (!text) {
    throw new Error("Invalid response structure from Google AI API");
  }
  return JSON.parse(text);
};
const createSummarizationPrompt = (rawText: string, numSlides: number, summarizationLevel: string): string => {
  const summaryRatios = { low: 0.3, medium: 0.5, high: 0.7 };
  const ratio = summaryRatios[summarizationLevel as keyof typeof summaryRatios];
  return `
    You are an expert academic researcher. Summarize the following scientific article text and divide it into ${numSlides} distinct sections, each suitable for a presentation slide.
    Article Text:
    "${rawText.substring(0, 25000)}"
    Instructions:
    - The summarization ratio should be approximately ${Math.round(ratio * 100)}% (detail level: ${summarizationLevel}).
    - Maintain scientific accuracy and use key terminology from the text.
    - Ensure a logical flow from one slide to the next.
    - For each slide, provide a title, a paragraph of content, and a few bullet points (key_points).
    Output Format (JSON only):
    {
        "slide_summaries": [
            {
                "slide_number": 1,
                "title": "Slide Title in English",
                "content": "Summarized content paragraph in English.",
                "key_points": ["Key point 1 in English", "Key point 2 in English"],
                "original_section": "Reference to the original section of the text"
            }
        ]
    }
  `;
};
const createTranslationPrompt = (slides: SlideContent[]): string => {
  const slidesJson = JSON.stringify(slides.map(({ title, content, key_points }) => ({ title, content, key_points })), null, 2);
  return `
    You are an expert translator specializing in scientific and academic texts. Translate the following JSON object containing slide content from English to Farsi.
    Input JSON:
    ${slidesJson}
    Instructions:
    - Provide a professional, accurate, and fluent translation.
    - Maintain the original JSON structure precisely.
    - Translate the values for "title", "content", and each string within the "key_points" array.
    Output Format (JSON only):
    {
        "translated_slides": [
            {
                "title_fa": "Translated title in Farsi",
                "content_fa": "Translated content paragraph in Farsi.",
                "key_points_fa": ["Translated key point 1 in Farsi", "Translated key point 2 in Farsi"]
            }
        ]
    }
  `;
};
const getThemeColors = (theme: string): { [key: string]: [number, number, number] } => {
  const themes = {
    high_contrast: {
      background: [255, 255, 255], text_title: [0, 0, 0], text_body: [50, 50, 50], accent: [0, 51, 102],
    },
    professional: {
      background: [240, 245, 250], text_title: [0, 51, 102], text_body: [40, 40, 40], accent: [0, 102, 204],
    },
    dark: {
      background: [45, 45, 48], text_title: [255, 255, 255], text_body: [220, 220, 220], accent: [100, 200, 255],
    },
  };
  return themes[theme as keyof typeof themes] || themes.professional;
};
const generatePresentationVersion = async (slidesData: TranslatedSlideContent[], settings: GenerationSettings): Promise<Blob> => {
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_16x9';
  const themeColors = getThemeColors(settings.colorTheme);
  // Title Slide
  const titleSlide = prs.addSlide();
  titleSlide.background = { color: new PptxGenJS.RGB(themeColors.background) };
  titleSlide.addText(settings.paperName, {
    x: 0.5, y: 2.5, w: 9, h: 1, align: 'center', fontSize: 36, fontFace: settings.englishFont,
    color: new PptxGenJS.RGB(themeColors.text_title), bold: true
  });
  titleSlide.addText('Generated by SlideCraft AI', {
    x: 0.5, y: 3.5, w: 9, h: 1, align: 'center', fontSize: 18, fontFace: settings.englishFont,
    color: new PptxGenJS.RGB(themeColors.accent)
  });
  // Content Slides
  for (const slideData of slidesData) {
    const slide = prs.addSlide();
    slide.background = { color: new PptxGenJS.RGB(themeColors.background) };
    slide.addShape(prs.shapes.LINE, {
      x: 0.5, y: 0.9, w: 9, h: 0, line: { color: new PptxGenJS.RGB(themeColors.accent), width: 2 }
    });
    slide.addText(slideData.title_fa, {
      x: 0.5, y: 0.2, w: 9, h: 0.8, align: 'right', fontSize: settings.fontSize + 8,
      fontFace: settings.farsiFont, color: new PptxGenJS.RGB(themeColors.text_title), bold: true, isRTL: true
    });
    let content = `${slideData.content_fa}\n\n`;
    slideData.key_points_fa.forEach(point => { content += `��� ${point}\n`; });
    slide.addText(content, {
      x: 0.5, y: 1.2, w: 9, h: 5.5, align: 'right', fontSize: settings.fontSize,
      fontFace: settings.farsiFont, color: new PptxGenJS.RGB(themeColors.text_body), isRTL: true,
      bullet: false,
    });
    // Add a simple fade transition
    slide.transition = { type: "fade", duration: 1 };
  }
  return await prs.write('blob');
};
const generatePresenterVersion = async (slidesData: TranslatedSlideContent[], settings: GenerationSettings): Promise<Blob> => {
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_16x9';
  for (const slideData of slidesData) {
    const slide = prs.addSlide();
    slide.background = { color: 'FFFFFF' };
    slide.addText(slideData.title_fa, {
      x: 0.5, y: 0.5, w: 9, h: 1, align: 'right', fontSize: 32, fontFace: settings.farsiFont, bold: true, isRTL: true
    });
    slide.addText(slideData.content_fa, {
      x: 0.5, y: 1.5, w: 9, h: 5, align: 'right', fontSize: 20, fontFace: settings.farsiFont, isRTL: true
    });
    const notes = `
      SPEAKER NOTES
      -------------------
      Slide Title (EN): ${slideData.title_en}
      Key Points (FA):
      ${slideData.key_points_fa.map(p => `- ${p}`).join('\n')}
      Original Content (EN):
      ${slideData.content_en}
      Key Points (EN):
      ${slideData.key_points_en.map(p => `- ${p}`).join('\n')}
    `;
    slide.addNotes(notes);
  }
  return await prs.write('blob');
};
export const generatePresentation = async (
  settings: GenerationSettings,
  apiKey: string,
  model: string
): Promise<{ presentationBlob: Blob; presenterBlob: Blob; stats: any }> => {
  if (!settings.pdfFile) {
    throw new Error('PDF file not provided.');
  }
  const startTime = Date.now();
  // 1. Extract PDF Data
  const { text: rawText, pageCount } = await extractPdfData(settings.pdfFile);
  // 2. Summarize
  const summarizationPrompt = createSummarizationPrompt(rawText, settings.numSlides, settings.summarizationLevel);
  const summaryResult = await callGoogleAI(summarizationPrompt, apiKey, model);
  const summarizedSlides: SlideContent[] = summaryResult.slide_summaries;
  // 3. Translate
  const translationPrompt = createTranslationPrompt(summarizedSlides);
  const translationResult = await callGoogleAI(translationPrompt, apiKey, model);
  const translatedSlidesContent = translationResult.translated_slides;
  const combinedSlides: TranslatedSlideContent[] = summarizedSlides.map((original, index) => ({
    ...original,
    ...translatedSlidesContent[index],
    title_en: original.title,
    content_en: original.content,
    key_points_en: original.key_points,
  }));
  // 4. Generate PPTX files
  const [presentationBlob, presenterBlob] = await Promise.all([
    generatePresentationVersion(combinedSlides, settings),
    generatePresenterVersion(combinedSlides, settings),
  ]);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const stats = {
    source: settings.paperName,
    field: 'Scientific Article',
    pdfPages: pageCount,
    slides: settings.numSlides,
    summaryLevel: settings.summarizationLevel,
    duration: `${duration}s`,
    modelUsed: model,
  };
  return { presentationBlob, presenterBlob, stats };
};