import AppShell from './pages/AppShell';

export type AppView = 'home' | 'simulation' | 'catalog' | 'about' | 'contribute';

export default function App() {
  return <AppShell initialView="home" />;
}
