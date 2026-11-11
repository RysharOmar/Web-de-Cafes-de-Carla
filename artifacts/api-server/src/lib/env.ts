export const optionalEnv = (key: string, fallback: string) =>
  process.env[key] ?? fallback;

export const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}`);
  return value;
};
