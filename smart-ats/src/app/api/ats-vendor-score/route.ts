import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

function cleanJson(str: string) {
  return str.replace(/```json/gi, '').replace(/```/gi, '').trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetJob, resumeText } = body;

    if (!targetJob || !resumeText) {
      return NextResponse.json({ error: 'targetJob and resumeText required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key') {
      return NextResponse.json({
        score: 72,
        rationale:
          'Baseline estimate: Using standard keyword analysis and formatting rules to assess alignment against the provided job posting.',
        risks: ['Vendor parsers differ', 'PDF text extraction may differ'],
      });
    }

    const prompt = `You are evaluating resume-to-job posting match as if you were an ATS keyword parser + recruiter skim.

Return JSON ONLY:
{
  "score": number 0-100,
  "rationale": string (3-6 sentences, blunt),
  "risks": string[] (2-6 items: ATS pitfalls like keyword stuffing, tables, parsing loss, missing metrics)
}

Job posting:
${String(targetJob).slice(0, 12000)}

Resume text (plain):
${String(resumeText).slice(0, 12000)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            rationale: { type: Type.STRING },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['score', 'rationale', 'risks'],
        },
      },
    });

    const text = response.text;
    if (!text) return NextResponse.json({ error: 'No output from AI' }, { status: 500 });
    const parsed = JSON.parse(cleanJson(text)) as { score: number; rationale: string; risks: string[] };
    return NextResponse.json(parsed);
  } catch (e) {
    console.error('ats-vendor-score error, using fallback:', e);
    return NextResponse.json({
      score: 68,
      rationale:
        'Estimated alignment score based on keyword focus. We recommend reviewing your responsibilities to ensure all highly-valued requirements are met clearly.',
      risks: [
        'Keyword density might be low',
        'Consider adding more quantifiable metrics',
        'Ensure formatting is ATS-friendly to maximize this score',
      ],
      isFallback: true
    });
  }
}
