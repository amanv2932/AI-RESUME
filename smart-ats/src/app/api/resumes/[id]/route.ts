import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import ResumeSnapshot from '@/models/ResumeSnapshot';
import mongoose from 'mongoose';
import { deleteResume, getResume } from '@/lib/server-local-db';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const userId = new URL(req.url).searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const conn = await connectToDatabase();
    if (!conn || !process.env.MONGODB_URI) {
      const doc = await getResume(id);
      if (!doc || doc.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    const doc = await ResumeSnapshot.findOne({ _id: id, userId }).lean();
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
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const userId = new URL(req.url).searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const conn = await connectToDatabase();
    if (!conn || !process.env.MONGODB_URI) {
      const deleted = await deleteResume(id, userId);
      if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ ok: true, isFallback: true });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const deleted = await ResumeSnapshot.findOneAndDelete({ _id: id, userId });
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
