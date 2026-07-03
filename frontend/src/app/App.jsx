import { AppProviders } from './providers/AppProviders.jsx';
import { AppRouter } from './router/AppRouter.jsx';
import { registerAppModules } from './modules.js';

registerAppModules();

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
