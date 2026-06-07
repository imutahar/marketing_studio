import { AppGate } from "@/components/AppGate";
import { StudioScreen } from "@/components/studio/StudioScreen";

export default function Home() {
  return (
    <AppGate>
      <StudioScreen />
    </AppGate>
  );
}
