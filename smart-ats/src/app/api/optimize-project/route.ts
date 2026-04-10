import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || 'dummy-key';
const client = new GoogleGenAI({ apiKey });
const PROJECT_OPTIMIZER_MODELS = ['gemini-2.5-pro', 'gemini-2.5-flash'] as const;

function cleanJson(str: string) {
  return str.replace(/```json/gi, '').replace(/```/gi, '').trim();
}

function classifyAiFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (message.includes('"code":429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
    return {
      reason: 'quota_exceeded',
      message: 'Gemini quota is exhausted for the configured API key. Wait for reset or switch to a billed key.',
    };
  }
  return {
    reason: 'ai_unavailable',
    message: 'Gemini could not optimize the project right now.',
  };
}

export async function POST(req: Request) {
  try {
    let reqBody: { 
      name: string;
      description: string; 
      techStack: string;
      targetJob?: string;
    };
    try {
      reqBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    const { name, description, techStack, targetJob } = reqBody;

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const jobContext = targetJob?.trim() || 'General professional optimization.';
    
    const prompt = `You are an elite career strategist. Optimize this project description and tech stack for a resume.
Target Job context: ${jobContext}

Current Project:
Name: ${name}
Description: ${description}
Tech Stack: ${techStack}

Rules:
- Make the description high-impact, results-oriented, and ATS-friendly.
- Optimize the tech stack: reorder for relevance, normalize names.
- CRITICAL: Preserve EVERY single technology, tool, and language mentioned.
- Stay truthful to the original project. Do NOT add fabricated metrics.
- Format techStack strictly as a comma-separated list (e.g. "React, Node.js, PostgreSQL"). NO dots or bullets.
- Return ONLY a valid JSON object: { "description": "...", "techStack": "..." }. No markdown.`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          techStack: { type: Type.STRING },
        },
        required: ['description', 'techStack'],
      },
    };

    try {
      if (apiKey === 'dummy-key') throw new Error('Dummy key');

      let lastError: unknown;
      for (const model of PROJECT_OPTIMIZER_MODELS) {
        try {
          const result = await client.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config,
          });

          const text = result.text;
          if (!text) throw new Error(`AI returned empty response for ${model}`);

          const parsed = JSON.parse(cleanJson(text));
          return NextResponse.json({
            description: parsed.description || description,
            techStack: parsed.techStack || techStack,
            model,
          });
        } catch (modelError) {
          lastError = modelError;
          console.warn(`[PROJECT-OPTIMIZE:${model}]`, modelError instanceof Error ? modelError.message : modelError);
        }
      }

      throw lastError instanceof Error ? lastError : new Error('All project optimizer models failed');
    } catch (aiError: unknown) {
      const aiMessage = aiError instanceof Error ? aiError.message : String(aiError ?? '');
      console.warn('[PROJECT-OPTIMIZE-FALLBACK]', aiMessage);
      const failure = classifyAiFailure(aiError);

      // Intelligent fallback that doesn't look broken
      const cleanDesc = description.trim();
      const points = cleanDesc.split(/(?<=\.)\s+/).filter(Boolean);
      const betterFormat = points.length > 1
        ? `• ${points.join('\n• ')}`
        : cleanDesc;

      const betterStack = techStack
        ? techStack.split(/[,\n]+/).filter(Boolean).map(s => s.trim()).join(', ')
        : '';

      return NextResponse.json({
        description: betterFormat,
        techStack: betterStack || techStack,
        isFallback: true,
        fallbackReason: failure.reason,
        message: failure.message,
      });
    }
  } catch (error: unknown) {
    console.error('Optimizing Project Route Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
