import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { AppLayout } from "./AppLayout";
import { DiscoveryScreen } from "@/features/discovery/DiscoveryScreen";
import { ResonanceScreen } from "@/features/resonance/ResonanceScreen";
import { SharedSpaceScreen } from "@/features/shared-space/SharedSpaceScreen";
import { ImpulsesScreen } from "@/features/impulses/ImpulsesScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { CheckInScreen } from "@/features/checkins/CheckInScreen";
import { LegalPage } from "@/features/legal/LegalPage";
import { JoinRoute } from "@/routes/JoinRoute";
import { DemoScreen } from "@/features/demo/DemoScreen";
import { DesignLab } from "@/features/design-lab/DesignLab";
import { Onboarding } from "@/features/onboarding/Onboarding";
import { PairingScreen } from "@/features/pairing/PairingScreen";
import { AppLockScreen } from "@/components/privacy/AppLockScreen";
import { PrivacyShield } from "@/components/privacy/PrivacyShield";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppLock } from "@/hooks/useAppLock";
import { useSession } from "@/features/auth/useSession";
import { getConnection } from "@/features/pairing/api";
import { flushQueuedAnswers } from "@/features/matching/api";
import { loadPrefs } from "@/lib/storage/prefs";
import { loadPinRecord } from "@/lib/storage/db";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});

function Gate() {
  const { session, ready } = useSession();
  const [onboarded, setOnboarded] = useState(loadPrefs().onboardingDone);
  const [startLocked, setStartLocked] = useState<boolean | null>(null);
  const { locked, unlock } = useAppLock();

  const connection = useQuery({
    queryKey: ["connection"],
    queryFn: getConnection,
    enabled: ready && session !== null
  });

  // Lock on cold start if a PIN exists.
  useEffect(() => {
    void loadPinRecord().then((r) => setStartLocked(Boolean(r)));
  }, []);

  // Flush the encrypted offline queue whenever we come back online.
  useEffect(() => {
    const flush = () => void flushQueuedAnswers();
    window.addEventListener("online", flush);
    flush();
    return () => window.removeEventListener("online", flush);
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState title="Konfiguration fehlt.">
        VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY sind nicht gesetzt. Siehe README, Abschnitt Setup.
      </EmptyState>
    );
  }
  if (startLocked === null || !ready) return null;
  if (startLocked || locked) {
    return (
      <AppLockScreen
        onUnlock={() => {
          setStartLocked(false);
          unlock();
        }}
      />
    );
  }
  if (!onboarded) return <Onboarding onDone={() => setOnboarded(true)} />;
  if (connection.isLoading) return null;
  if (!connection.data?.connected) return <PairingScreen />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DiscoveryScreen />} />
        <Route path="resonanz" element={<ResonanceScreen />} />
        <Route path="gemeinsam" element={<SharedSpaceScreen />} />
        <Route path="impulse" element={<ImpulsesScreen />} />
        <Route path="checkin" element={<CheckInScreen />} />
        <Route path="einstellungen" element={<SettingsScreen />} />
        <Route path="legal/:page" element={<LegalPage />} />
        <Route path="demo" element={<DemoScreen />} />
        {import.meta.env.DEV ? <Route path="design-lab" element={<DesignLab />} /> : null}
      </Route>
      <Route path="join/:code" element={<JoinRoute />} />
      <Route path="*" element={<EmptyState title="Diese Seite gibt es nicht." />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <PrivacyShield />
        <div id="app-content">
          <Gate />
        </div>
      </HashRouter>
    </QueryClientProvider>
  );
}
