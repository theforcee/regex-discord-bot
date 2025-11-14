import mongoose from 'mongoose';

const loreSchema = new mongoose.Schema(
  {
    search: { type: String, required: true, trim: true },
    lore: { type: String, required: true, trim: true },
    capture: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'lore',
  }
);

export default mongoose.models.Lore || mongoose.model('Lore', loreSchema);

