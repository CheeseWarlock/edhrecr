import BuilderContent from "../components/builder/BuilderContent";
import PasswordProtection from "../components/PasswordProtection";
import { getPopulatedDays } from "../lib/editor";

export default async function Builder() {
  const response = await getPopulatedDays();
  const populatedDays = new Set(response.populatedDays.map(d => d.toISOString().split('T')[0]));
  
  return (
    <PasswordProtection>
      <BuilderContent populatedDays={populatedDays} today={response.today} />
    </PasswordProtection>
  );
}