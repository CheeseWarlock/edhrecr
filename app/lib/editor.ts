import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getPopulatedDays() {
  const today = (new Date()).toISOString().slice(0, 10);
  const populatedDays = await sql`SELECT date FROM collections_v2`;
  const result = populatedDays.map((dayRow => dayRow.date));

  return {
    populatedDays: result,
    today: today
  }
}