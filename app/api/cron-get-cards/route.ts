import { generateCardsV2 } from "../../lib/cron";

export async function GET() {
  await generateCardsV2();
  return Response.json({ message: 'Daily cards generated' });
}