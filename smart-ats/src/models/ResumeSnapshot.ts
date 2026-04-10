import mongoose from 'mongoose';

const ResumeSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, default: 'My resume' },
    atsScore: { type: Number, default: 0 },
    targetPreview: { type: String, default: '' },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ResumeSnapshot ||
  mongoose.model('ResumeSnapshot', ResumeSnapshotSchema);
