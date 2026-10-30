export const optionalEnv = (k: string, d: string) =>
  process.env[k] ?? d;

export const requiredEnv = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing ${k}`);
  return v;
};
