import { registerModule } from '../core/modules/index.js';
import { dashboardModule } from '../features/dashboard/index.jsx';
import { donorManagementModule } from '../features/donor-management/index.jsx';

/**
 * THE single integration point for business modules (Open/Closed).
 * To add a module: create features/<name>/index.js exporting a module
 * definition, import it here, add one registerModule() line. Nothing else
 * in the platform changes — routing, navigation and permissions pick it up.
 *
 * Budget, Forecast, Actuals, Variance, Committed Costs, Unassigned Funding,
 * Optimiser and Reports are specified in the scope document but have no
 * backend endpoints yet (docs/BACKEND_GAPS.md #7); they will be registered
 * here as their APIs ship.
 */
let registered = false;

export function registerAppModules() {
  if (registered) return;
  registered = true;
  registerModule(dashboardModule);
  registerModule(donorManagementModule);
}
