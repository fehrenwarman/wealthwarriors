import { useApp } from './context/AppContext';
import { SetupScreen } from './components/SetupScreen';
import { ParentDashboard } from './components/ParentDashboard';
import { KidSelection } from './components/KidSelection';
import { KidDashboard } from './components/KidDashboard';

function App() {
  const { state } = useApp();

  // No family yet - show setup
  if (!state.family) {
    return <SetupScreen />;
  }

  // Parent mode
  if (state.currentMode === 'parent') {
    return <ParentDashboard />;
  }

  // Kid mode - no kid selected
  if (!state.selectedKidId) {
    return <KidSelection />;
  }

  // Kid mode - kid selected
  return <KidDashboard />;
}

export default App;
