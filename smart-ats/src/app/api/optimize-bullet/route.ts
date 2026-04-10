import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || 'dummy-key';
const client = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    let reqBody: { bullets?: string[]; bullet?: string; targetJob?: string };
    try {
      reqBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    const bulletsInput = Array.isArray(reqBody.bullets)
      ? reqBody.bullets
      : reqBody.bullet
        ? [reqBody.bullet]
        : [];
    const validBullets = bulletsInput.map((b) => (typeof b === 'string' ? b.trim() : '')).filter(Boolean);

    if (validBullets.length === 0) {
      return NextResponse.json({ error: 'At least one bullet is required' }, { status: 400 });
    }

    const targetJob = reqBody.targetJob?.trim() || 'General professional optimization.';
    
    const prompt = `You are an elite career strategist. Optimize these resume bullets using Gemini 3.0 reasoning. 
Maximize impact with metrics and verbs. 
Target Context: ${targetJob}
Bullets: ${JSON.stringify(validBullets)}

Return ONLY a JSON object: { "bullets": ["Improved bullet 1", ...] }`;

    try {
      const result = await client.models.generateContent({
        model: 'gemini-3.1-pro', 
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = result.text;
      if (!text) throw new Error('AI returned empty response');

      const parsed = JSON.parse(text) as { bullets?: string[] };
      const out = Array.isArray(parsed.bullets) ? parsed.bullets : [];
      if (out.length > 0) return NextResponse.json({ bullets: out.map(b => b.trim()) });
    } catch (aiError: any) {
      console.warn('[PROJECT-OPTIMIZE-FALLBACK]', aiError.message);
      try {
        const fbResult = await client.models.generateContent({
          model: 'gemini-3.1-pro', 
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json' }
        });
        const fbText = fbResult.text;
        if (!fbText) throw new Error('Fallback AI returned empty response');
        const fbParsed = JSON.parse(fbText);
        return NextResponse.json({ bullets: fbParsed.bullets || validBullets });
      } catch {
        return NextResponse.json({
          bullets: validBullets.map((b) => `Optimized: ${b}`),
          isFallback: true,
        });
      }
    }
  } catch (error: any) {
    console.error('Optimizing Route Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


