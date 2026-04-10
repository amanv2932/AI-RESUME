import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

export async function POST(req: Request) {
  try {
    let reqBody: {
      experience?: unknown[];
      skills?: unknown[];
      projects?: unknown[];
      targetJob?: string;
      keywords?: string[];
    };
    try {
      reqBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload format' }, { status: 400 });
    }
    const { experience, skills, projects = [], targetJob, keywords = [] } = reqBody;

    if (!targetJob?.trim()) {
      return NextResponse.json({ error: 'Target Job description is required to optimize.' }, { status: 400 });
    }

    if (!Array.isArray(experience)) {
      return NextResponse.json({ error: 'experience must be an array' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key') {
      return NextResponse.json({
        optimizedExperience: experience.map((raw) => {
          const exp = raw as { id?: string; bullets?: unknown };
          const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
          return {
            id: String(exp.id ?? ''),
            bullets: bullets.map((b) => `[mock] ${String(b)} — set GEMINI_API_KEY`),
          };
        }),
        suggestedSkills: [{ name: 'Mock Skill', proficiency: 'Intermediate' }],
        optimizedProjects: Array.isArray(projects)
          ? projects.map((raw) => {
              const p = raw as { id?: string; description?: string; techStack?: string };
              return {
                id: String(p.id ?? ''),
                description: p.description ?? '',
                techStack: p.techStack ?? '',
              };
            })
          : [],
        skillOrder: Array.isArray(skills)
          ? skills.map((raw) => String((raw as { name?: string }).name ?? '')).filter(Boolean)
          : [],
      });
    }

    const keywordLine =
      keywords.length > 0
        ? `\nPrioritize weaving in these extracted keywords where honest: ${keywords.slice(0, 40).join(', ')}`
        : '';

    const prompt = `You are an ATS-focused resume editor. Rewrite the candidate's content to align with the job. Rules:
- Keep factual: same employers, roles, dates; do not invent credentials.
- Rewrite bullets to integrate posting vocabulary and strong metrics ONLY when consistent with the original bullet.
- skillOrder: list skill names in best order for this job (most relevant first). Include every current skill name; you may add suggested new skills via suggestedSkills.
- suggestedSkills: skills from the job text missing from current skills (name + proficiency Beginner|Intermediate|Advanced|Expert).

Job Description:
${targetJob.substring(0, 12000)}
${keywordLine}

Current User Experience:
${JSON.stringify(experience, null, 2)}

Current User Skills:
${JSON.stringify(skills, null, 2)}

Current User Projects:
${JSON.stringify(projects, null, 2)}

Return JSON only:
{
  "optimizedExperience": [ { "id": "same as input", "bullets": ["..."] } ],
  "suggestedSkills": [ { "name": "...", "proficiency": "Intermediate" } ],
  "optimizedProjects": [ { "id": "same as input", "description": "...", "techStack": "..." } ],
  "skillOrder": [ "Skill A", "Skill B" ]
}

If there are no projects, return optimizedProjects as []. Every experience id from input must appear exactly once.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['id', 'bullets'],
              },
            },
            suggestedSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  proficiency: { type: Type.STRING },
                },
                required: ['name'],
              },
            },
            optimizedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techStack: { type: Type.STRING },
                },
                required: ['id', 'description', 'techStack'],
              },
            },
            skillOrder: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['optimizedExperience', 'suggestedSkills', 'optimizedProjects', 'skillOrder'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'No output from AI' }, { status: 500 });
    }

    const cleanJsonText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsedInfo = JSON.parse(cleanJsonText);
    return NextResponse.json(parsedInfo, { status: 200 });
  } catch (error: unknown) {
    console.error('Resume Optimization Error:', error);
    return NextResponse.json({ error: 'Failed to optimize full resume' }, { status: 500 });
  }
}
