import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { personalInfo, experience, skills, targetJob } = body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key') {
      return NextResponse.json({
        summary:
          '[Mock] Add GEMINI_API_KEY for a tailored LinkedIn “About” section. Keep 3–5 short paragraphs, first person, outcome-focused.',
      });
    }

    const prompt = `Write a LinkedIn "About" / summary section (not a resume duplicate). 
Rules: first person, 1200 characters max, credible-only from inputs, no hashtags spam, 3–4 short paragraphs.

Profile: ${JSON.stringify(personalInfo)}
Experience (condensed): ${JSON.stringify(experience)}
Skills: ${JSON.stringify(skills)}
Target direction: ${targetJob ? String(targetJob).slice(0, 2000) : 'general career growth'}

Return ONLY the summary text, no title or quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro',
      contents: prompt,
    });

    const summary = response.text?.trim() || '';
    if (!summary) {
      return NextResponse.json({ error: 'Empty response' }, { status: 500 });
    }
    return NextResponse.json({ summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
