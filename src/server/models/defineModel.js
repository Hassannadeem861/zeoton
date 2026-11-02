import mongoose from 'mongoose';

// In development, hot reload re-runs model files but mongoose keeps the first compiled
// model, so schema changes (new fields) would be silently ignored until a restart.
// Re-register the model in development; production compiles each model once.
export function defineModel(name, schema) {
  if (process.env.NODE_ENV !== 'production' && mongoose.models[name]) mongoose.deleteModel(name);
  return mongoose.models[name] || mongoose.model(name, schema);
}
