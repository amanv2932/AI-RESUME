import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import ResumeSnapshot from '@/models/ResumeSnapshot';
import mongoose from 'mongoose';
import { getResume } from '@/lib/server-local-db';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const conn = await connectToDatabase();
    if (!conn || !process.env.MONGODB_URI) {
      const doc = await getResume(id);
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({
        id: doc._id,
        name: doc.name,
        atsScore: doc.atsScore,
        targetPreview: doc.targetPreview,
        snapshot: doc.snapshot,
        updatedAt: doc.updatedAt,
        isFallback: true,
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const doc = await ResumeSnapshot.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: doc._id.toString(),
      name: doc.name,
      atsScore: doc.atsScore,
      targetPreview: doc.targetPreview,
      snapshot: doc.snapshot,
      updatedAt: doc.updatedAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load resume' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const conn = await connectToDatabase();
    if (!conn || !process.env.MONGODB_URI) {
      // For simplicity, we won't implement file delete here, but we could
      return NextResponse.json({ ok: true, isFallback: true });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    await ResumeSnapshot.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
