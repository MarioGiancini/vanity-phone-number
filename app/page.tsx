import { AppShell } from "@/components/studio/app-shell";
import { StudioProvider } from "@/components/studio/studio-context";

export default function Home() {
  return (
    <StudioProvider>
      <AppShell />
    </StudioProvider>
  );
}
