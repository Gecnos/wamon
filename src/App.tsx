import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './pages/AppShell';
import Landing from './pages/Landing';
import ExercicesView from './pages/ExercicesView';
import SeanceView, { SeanceRedirect } from './pages/SeanceView';
import LaboView from './pages/LaboView';
import CatalogView from './pages/CatalogView';
import GuideView from './pages/GuideView';
import { SeanceProvider } from './features/seance/SeanceContext';
import { ProjectionProvider } from './lib/projection';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ProjectionProvider>
      <SeanceProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Landing />} />
            <Route path="exercices" element={<ExercicesView />} />
            <Route path="seance" element={<Navigate to="/exercices" replace />} />
            <Route path="seance/:exo" element={<SeanceRedirect />} />
            <Route path="seance/:exo/:etape" element={<SeanceView />} />
            <Route path="labo" element={<LaboView />} />
            <Route path="materiel" element={<CatalogView />} />
            <Route path="materiel/:id" element={<CatalogView />} />
            <Route path="guide" element={<GuideView />} />
            <Route path="contribuer" element={<Navigate to="/" replace />} />
            {/* Anciennes adresses */}
            <Route path="simulation" element={<Navigate to="/exercices" replace />} />
            <Route path="classe" element={<Navigate to="/guide" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SeanceProvider>
    </ProjectionProvider>
  );
}
