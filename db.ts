import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function selectFromFunction<T>(
  functionName: string,
  params?: Record<string, any>
): Promise<T[]> {
  const entries = Object.entries(params ?? {}).filter(([, v]) => v != null);
  const paramList = entries.map(([k], i) => `${k} := $${i + 1}`).join(', ');
  const values = entries.map(([, v]) => v);

  const result = await sql.query(`SELECT * FROM ${functionName}(${paramList})`, values);
  return (result as T[]) ?? [];
}

export async function executeFromFunction(
  functionName: string,
  params?: Record<string, any>
): Promise<void> {
  const entries = Object.entries(params ?? {}).filter(([, v]) => v != null);
  const paramList = entries.map(([k], i) => `${k} := $${i + 1}`).join(', ');
  const values = entries.map(([, v]) => v);

  await sql.query(`SELECT ${functionName}(${paramList})`, values);
}