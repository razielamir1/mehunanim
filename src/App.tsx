import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Play from './pages/Play';
import Results from './pages/Results';
import Parent from './pages/Parent';
import Settings from './pages/Settings';
import ProgressPage from './pages/Progress';
import Coach from './pages/Coach';
import Worlds from './pages/Worlds';
import Accessibility from './pages/Accessibility';
import AppShell from './components/AppShell';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/play/:gameId" element={<Play />} />
        <Route path="/results" element={<Results />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/parent" element={<Parent />} />
        <Route path="/worlds" element={<Worlds />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
