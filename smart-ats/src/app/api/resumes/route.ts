import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import ResumeSnapshot from '@/models/ResumeSnapshot';
import { listResumes, saveResume } from '@/lib/server-local-db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }
    const conn = await connectToDatabase();
    if (!conn || !process.env.MONGODB_URI) {
      const items = await listResumes(userId);
      return NextResponse.json({
        items: items,
        isFallback: true,
      });
    }
    const items = await ResumeSnapshot.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('_id name atsScore targetPreview updatedAt')
      .lean();
    return NextResponse.json({
      items: items.map((doc) => ({
        _id: String(doc._id),
        name: doc.name,
        atsScore: doc.atsScore,
        targetPreview: doc.targetPreview,
        updatedAt: doc.updatedAt,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to list resumes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, snapshot, atsScore = 0, targetPreview = '' } = body;
    if (!userId || !snapshot || typeof snapshot !== 'object') {
      return NextResponse.json({ error: 'userId and snapshot object required' }, { status: 400 });
    }
    const conn = await connectToDatabase();
    if (!conn || !process.env.MONGODB_URI) {
      const id = await saveResume({
        userId,
        name: name || 'Saved resume',
        atsScore,
        targetPreview: String(targetPreview).slice(0, 200),
        snapshot,
      });
      return NextResponse.json({
        ok: true,
        id,
        isFallback: true,
      });
    }
    const doc = await ResumeSnapshot.create({
      userId,
      name: name || 'Saved resume',
      atsScore,
      targetPreview: String(targetPreview).slice(0, 200),
      snapshot,
    });
    return NextResponse.json({
      ok: true,
      id: doc._id.toString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
  }
}
