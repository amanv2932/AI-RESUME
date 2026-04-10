import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || 'dummy-key';
const client = new GoogleGenAI({ apiKey });

function cleanJson(str: string) {
  return str.replace(/```json/gi, '').replace(/```/gi, '').trim();
}

export async function POST(req: Request) {
  try {
    let reqBody: { jobDescription?: string };
    try {
      reqBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    const { jobDescription } = reqBody;

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const systemPrompt = `Analyze this job description for ATS optimization.
Return ONLY a JSON object with this exact schema:
{
  "keywords": ["React", "Project Management"],
  "domain": "Software Engineering",
  "missingSkillsOrWeakPoints": "Advice text",
  "requiredSkills": ["skill1", "skill2"],
  "responsibilities": ["duty1", "duty2"],
  "roleTransitionGuidance": "Detailed guidance on how someone should pivot or reframe if they are coming from a different role.",
  "actionableRecommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          domain: { type: Type.STRING },
          missingSkillsOrWeakPoints: { type: Type.STRING },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
          roleTransitionGuidance: { type: Type.STRING },
          actionableRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          'keywords',
          'domain',
          'missingSkillsOrWeakPoints',
          'requiredSkills',
          'responsibilities',
          'roleTransitionGuidance',
          'actionableRecommendations'
        ],
      },
    };

    try {
      if (apiKey === 'dummy-key') throw new Error('Dummy key');
      const result = await client.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nJD:\n${jobDescription.substring(0, 10000)}` }] },
        ],
        config,
      });

      const rawText = result.text;
      if (!rawText) throw new Error('Empty response');
      return NextResponse.json(JSON.parse(cleanJson(rawText)), { status: 200 });
    } catch (proError: any) {
      console.warn('[GEMINI-ANALYZE-FALLBACK]', proError.message);
      
      // Return a smart structural fallback with 200 so UI doesn't crash or show error
      return NextResponse.json({
        keywords: ['Communication', 'Leadership', 'Problem Solving'],
        domain: 'General Professional',
        missingSkillsOrWeakPoints: 'Focus on highlighting measurable impact in your current experience.',
        requiredSkills: ['Teamwork', 'Organization', 'Execution'],
        responsibilities: ['Drive project success', 'Communicate with stakeholders'],
        roleTransitionGuidance: 'Emphasize your transferable skills and ability to adapt quickly.',
        actionableRecommendations: [
          'Quantify results using metrics like time saved or revenue generated.',
          'Align your resume summary with the primary responsibilities listed.'
        ],
        isFallback: true
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Job Analysis Error:', error);
    return NextResponse.json({ error: 'Critical failure' }, { status: 500 });
  }
}
