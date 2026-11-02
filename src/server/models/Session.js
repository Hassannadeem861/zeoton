import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

// Server-side sessions. Only an HMAC of the cookie token is stored, so a database
// leak does not expose usable session cookies.
const sessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['customer', 'admin'], required: true },
    userAgent: { type: String, maxlength: 300 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = defineModel('Session', sessionSchema);
