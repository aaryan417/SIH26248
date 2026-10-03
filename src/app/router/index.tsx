import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

// Pages
import { LandingPage } from '../../features/landing/LandingPage';
import { RoleSelectionPage } from '../../features/auth/RoleSelectionPage';
import { LoginPage } from '../../features/auth/LoginPage';
import { ScenarioListPage } from '../../features/scenarios/ScenarioListPage';
import { ScenarioDetailPage } from '../../features/scenarios/ScenarioDetailPage';
import { InstructorDashboard } from '../../features/instructor/InstructorDashboard';
import { TraineeMissionPage } from '../../features/trainee/TraineeMissionPage';
import { TeamCoordinationPage } from '../../features/team/TeamCoordinationPage';
import { AARPage } from '../../features/aar/AARPage';
import { SettingsPage } from '../../features/settings/SettingsPage';
import { HelpPage } from '../../features/help/HelpPage';

import { useSessionStore } from '../../store/useSessionStore';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-command-950 text-slate-100 font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const InstructorRedirect: React.FC = () => {
  const { currentSession } = useSessionStore();
  if (currentSession) {
    return <Navigate to={`/instructor/session/${currentSession.id}`} replace />;
  }
  return <Navigate to="/scenarios" replace />;
};

const TraineeRedirect: React.FC = () => {
  const { currentSession } = useSessionStore();
  if (currentSession) {
    return <Navigate to={`/mission/${currentSession.id}`} replace />;
  }
  return <Navigate to="/role-selection" replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />

        <Route path="/scenarios" element={<ScenarioListPage />} />
        <Route path="/scenarios/:scenarioId" element={<ScenarioDetailPage />} />

        <Route path="/instructor" element={<InstructorRedirect />} />
        <Route path="/instructor/session/:sessionId" element={<InstructorDashboard />} />

        <Route path="/trainee" element={<TraineeRedirect />} />
        <Route path="/mission/:sessionId" element={<TraineeMissionPage />} />

        <Route path="/team/:sessionId" element={<TeamCoordinationPage />} />
        <Route path="/aar/:sessionId" element={<AARPage />} />

        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
