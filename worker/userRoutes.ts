import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { generatePresentation } from "./presentation-generator";
// Simple in-memory cache for generated files. In a real-world scenario, use R2 or KV.
const generatedFiles = new Map<string, { blob: Blob, filename: string }>();
interface GoogleAIModel {
    name: string;
    displayName: string;
    supportedGenerationMethods: string[];
}
interface GoogleAIModelList {
    models: GoogleAIModel[];
}
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.post('/api/validate-key', async (c) => {
        try {
            const { apiKey } = await c.req.json();
            if (!apiKey) {
                return c.json({ success: false, error: 'API key is required.' }, { status: 400 });
            }
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (!response.ok) {
                const errorData: any = await response.json().catch(() => ({}));
                const message = errorData?.error?.message || `Invalid API Key or failed to connect to Google AI service. Status: ${response.status}`;
                throw new Error(message);
            }
            const data = await response.json() as GoogleAIModelList;
            const availableModels = data.models
                .filter((model: GoogleAIModel) => 
                    model.supportedGenerationMethods.includes('generateContent') &&
                    !model.name.includes('embedding') &&
                    (model.name.toLowerCase().includes('gemini') || model.displayName.toLowerCase().includes('gemini'))
                )
                .map((model: GoogleAIModel) => ({
                    id: model.name.replace('models/', ''),
                    name: model.displayName,
                }))
                .sort((a: any, b: any) => a.name.localeCompare(b.name));
            return c.json({ success: true, data: { models: availableModels } });
        } catch (error) {
            console.error('API Key validation failed:', error);
            let errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            // Clean up common Google API error prefixes
            errorMessage = errorMessage.replace(/^\[.*?\]\s*/, '');
            return c.json({ success: false, error: `Validation Failed: ${errorMessage}` }, { status: 401 });
        }
    });
    app.post('/api/generate-presentation', async (c) => {
        try {
            const formData = await c.req.formData();
            const apiKey = formData.get('apiKey') as string;
            const selectedModel = formData.get('selectedModel') as string;
            if (!apiKey || !selectedModel) {
                return c.json({ success: false, error: 'API Key and a selected model are required.' }, { status: 400 });
            }
            const result = await generatePresentation(formData, c.env, apiKey, selectedModel);
            if (!result.success || !result.data) {
                return c.json({ success: false, error: result.error || 'Generation failed' }, { status: 500 });
            }
            const { presentationBlob, presenterBlob, statistics, filename } = result.data;
            const presentationId = crypto.randomUUID();
            const presenterId = crypto.randomUUID();
            generatedFiles.set(presentationId, { blob: presentationBlob, filename: `Presentation_${filename}.pptx` });
            generatedFiles.set(presenterId, { blob: presenterBlob, filename: `Presenter_${filename}.pptx` });
            // Set a timeout to clear the files from memory after 10 minutes
            setTimeout(() => {
                generatedFiles.delete(presentationId);
                generatedFiles.delete(presenterId);
            }, 10 * 60 * 1000);
            return c.json({
                success: true,
                data: {
                    statistics,
                    presentationUrl: `/api/download/${presentationId}`,
                    presenterUrl: `/api/download/${presenterId}`,
                }
            });
        } catch (error) {
            console.error('Failed to generate presentation:', error);
            return c.json({
                success: false,
                error: 'Failed to process request. Please ensure you have uploaded a valid PDF file.'
            }, { status: 400 });
        }
    });
    app.get('/api/download/:id', async (c) => {
        const { id } = c.req.param();
        const fileData = generatedFiles.get(id);
        if (!fileData) {
            return c.json({ success: false, error: 'File not found or expired.' }, { status: 404 });
        }
        // Once downloaded, remove it from memory
        generatedFiles.delete(id);
        const headers = new Headers();
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        headers.set('Content-Disposition', `attachment; filename="${fileData.filename}"`);
        return new Response(fileData.blob, { headers });
    });
    // Session management routes from template
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
}