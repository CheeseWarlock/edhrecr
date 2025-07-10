import { generateDailyCollectionV2 } from "../../lib/cron";

export async function GET() {
  await generateDailyCollectionV2();
  return Response.json({ message: 'Daily collection generated' });
}