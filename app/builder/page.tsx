import BuilderContent from "../components/builder/BuilderContent";
import { getPopulatedDays } from "../lib/editor";

export default async function Builder() {
  const response = await getPopulatedDays();
  const populatedDays = new Set(response.populatedDays.map(d => d.toISOString().split('T')[0]));
  
  return (
    <BuilderContent populatedDays={populatedDays} today={response.today} />
  );
}

export const dynamic = 'force-dynamic';