import { generateCardsV2 } from "../../lib/cron";

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  await generateCardsV2();
  return Response.json({ message: 'Daily cards generated' });
}