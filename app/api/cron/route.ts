import { generateDailyCollectionv2 } from "../../lib/daily-cards";

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  await generateDailyCollectionv2();
  return Response.json({ message: 'Daily collection generated' });
}