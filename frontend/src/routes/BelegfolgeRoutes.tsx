import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Lazy-Loading für alle Belegformulare
const BelegfolgeDashboard = lazy(() => import('../components/BelegeFormular/BelegfolgeDashboard'));
const AngebotFormular = lazy(() => import('../components/BelegeFormular/AngebotFormular'));
const AuftragFormular = lazy(() => import('../components/BelegeFormular/AuftragFormular'));
const LieferscheinFormular = lazy(() => import('../components/BelegeFormular/LieferscheinFormular'));
const RechnungFormular = lazy(() => import('../components/BelegeFormular/RechnungFormular'));
const BestellungFormular = lazy(() => import('../components/BelegeFormular/BestellungFormular'));
const EingangslieferscheinFormular = lazy(() => import('../components/BelegeFormular/EingangslieferscheinFormular'));

// Loading-Komponente für Suspense
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
);

// Dashboard-Komponenten (werden später implementiert)
const AngeboteListe = () => <div>Angebote Liste (wird implementiert)</div>;
const AuftraegeListe = () => <div>Aufträge Liste (wird implementiert)</div>;
const LieferscheineListe = () => <div>Lieferscheine Liste (wird implementiert)</div>;
const RechnungenListe = () => <div>Rechnungen Liste (wird implementiert)</div>;
const BestellungenListe = () => <div>Bestellungen Liste (wird implementiert)</div>;
const EingangslieferscheineListe = () => <div>Eingangslieferscheine Liste (wird implementiert)</div>;

const BelegfolgeRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <Routes>
        {/* Dashboard Route */}
        <Route path="/" element={<BelegfolgeDashboard />} />

        {/* Verkaufsprozess Routen */}
        <Route path="angebote">
          <Route index element={<AngeboteListe />} />
          <Route path="neu" element={<AngebotFormular />} />
          <Route path=":id" element={<AngebotFormular />} />
        </Route>

        <Route path="auftraege">
          <Route index element={<AuftraegeListe />} />
          <Route path="neu" element={<AuftragFormular />} />
          <Route path="neu/:angebotId" element={<AuftragFormular />} />
          <Route path=":id" element={<AuftragFormular />} />
        </Route>

        <Route path="lieferscheine">
          <Route index element={<LieferscheineListe />} />
          <Route path="neu" element={<LieferscheinFormular />} />
          <Route path="neu/:auftragId" element={<LieferscheinFormular />} />
          <Route path=":id" element={<LieferscheinFormular />} />
        </Route>

        <Route path="rechnungen">
          <Route index element={<RechnungenListe />} />
          <Route path="neu" element={<RechnungFormular />} />
          <Route path="neu/:lieferscheinId" element={<RechnungFormular />} />
          <Route path=":id" element={<RechnungFormular />} />
        </Route>

        {/* Einkaufsprozess Routen */}
        <Route path="bestellungen">
          <Route index element={<BestellungenListe />} />
          <Route path="neu" element={<BestellungFormular />} />
          <Route path=":id" element={<BestellungFormular />} />
        </Route>

        <Route path="eingangslieferscheine">
          <Route index element={<EingangslieferscheineListe />} />
          <Route path="neu" element={<EingangslieferscheinFormular />} />
          <Route path="neu/:bestellungId" element={<EingangslieferscheinFormular />} />
          <Route path=":id" element={<EingangslieferscheinFormular />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default BelegfolgeRoutes; 