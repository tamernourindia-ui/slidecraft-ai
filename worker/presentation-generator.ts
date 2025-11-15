import OpenAI from 'openai';
import pdf from 'pdf-parse';
import type { Env } from './core-utils';
import type { GenerationSettings } from '../src/lib/types';
// This is a simplified version of the settings from the frontend
// We only need a subset for the backend processing
type BackendGenerationSettings = Omit<GenerationSettings, 'pdfFile'>;
async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const data = await pdf(Buffer.from(buffer));
  return data.text;
}
function createSummarizationPrompt(text: string, settings: BackendGenerationSettings): string {
  const summaryRatios = {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
  };
  const ratio = summaryRatios[settings.summarizationLevel];
  return `
You are an expert academic researcher and presentation creator. Your task is to summarize a scientific article and structure it for a PowerPoint presentation.
**Article Name:** ${settings.paperName}
**Target Number of Slides:** ${settings.numSlides}
**Summarization Detail Level:** ${settings.summarizationLevel} (Summarize to approx. ${ratio * 100}% of original content)
**Instructions:**
1.  Read the following article text.
2.  Summarize the content, maintaining scientific accuracy and logical flow.
3.  Divide the summary into ${settings.numSlides} logical sections, each corresponding to a slide.
4.  For each slide, provide a concise title, the main content body, and 3-5 bullet points (key_points).
5.  Return the output as a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON object.
**JSON Output Format:**
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide Title",
      "content": "Summarized content for this slide.",
      "key_points": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ]
}
**Article Text:**
---
${text.substring(0, 20000)}
---
`;
}
export async function generatePresentation(formData: FormData, env: Env) {
  try {
    const file = formData.get('pdfFile') as File;
    const settings: BackendGenerationSettings = {
      paperName: formData.get('paperName') as string,
      numSlides: Number(formData.get('numSlides')),
      summarizationLevel: formData.get('summarizationLevel') as 'low' | 'medium' | 'high',
      farsiFont: formData.get('farsiFont') as any,
      englishFont: formData.get('englishFont') as any,
      fontSize: Number(formData.get('fontSize')),
      colorTheme: formData.get('colorTheme') as any,
    };
    if (!file) {
      throw new Error('PDF file is missing.');
    }
    // Step 1: Extract text from PDF
    const extractedText = await extractTextFromPdf(file);
    // Step 2: Create prompt and call AI for summarization
    const prompt = createSummarizationPrompt(extractedText, settings);
    const openai = new OpenAI({
      baseURL: env.CF_AI_BASE_URL,
      apiKey: env.CF_AI_API_KEY,
    });
    const response = await openai.chat.completions.create({
      model: 'google-ai-studio/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });
    const aiContent = response.choices[0].message.content;
    if (!aiContent) {
      throw new Error('AI returned an empty response.');
    }
    const summarizedData = JSON.parse(aiContent);
    // In a future phase, we will use this data to generate PPTX files.
    // For now, we'll return a success response with mock URLs.
    const generationResult = {
      statistics: {
        source: settings.paperName,
        field: 'AI Detected Field (e.g., Ophthalmology)',
        pdfPages: 'N/A', // pdf-parse doesn't easily give page count
        slides: summarizedData.slides.length,
        summaryLevel: `${settings.summarizationLevel} (${{ low: '30%', medium: '50%', high: '70%' }[settings.summarizationLevel]})`,
        duration: 'N/A',
        translationQuality: 'Expert PhD',
      },
      // These will be real URLs in the next phase
      presentationUrl: `/api/download/presentation_${Date.now()}.pptx`,
      presenterUrl: `/api/download/presenter_${Date.now()}.pptx`,
    };
    return { success: true, data: generationResult };
  } catch (error) {
    console.error('Error in presentation generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Generation failed: ${errorMessage}` };
  }
}