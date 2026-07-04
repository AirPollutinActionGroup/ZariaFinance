/**
 * Plug-and-play module registry (Open/Closed Principle).
 *
 * A module is a self-contained feature package that declares:
 *   {
 *     id:        'donor-management'      // permission + registry key
 *     title:     'Donor Management'
 *     navSection:'CORE LAYERS'           // sidebar group label
 *     navItems:  [{ label, path, icon }] // entries shown in the sidebar
 *     routes:    [{ path, element }]     // mounted under the app shell
 *   }
 *
 * Adding a new business domain (Budget, Forecast, HR, …) means creating a
 * feature folder that exports such a definition and listing it once in
 * app/modules.js. No router, layout or navigation code changes.
 */

const registry = new Map();

export function registerModule(moduleDef) {
  if (!moduleDef?.id) {
    throw new Error('Module definition requires an id');
  }
  if (registry.has(moduleDef.id)) {
    throw new Error(`Module "${moduleDef.id}" is already registered`);
  }
  registry.set(moduleDef.id, Object.freeze({ navItems: [], routes: [], ...moduleDef }));
}

export function getModules() {
  return Array.from(registry.values());
}

export function getModuleRoutes() {
  return getModules().flatMap((mod) =>
    mod.routes.map((route) => ({ ...route, moduleId: mod.id })),
  );
}

/** Sidebar model: sections in declaration order, filtered by permission. */
export function getNavSections(user, canView) {
  const sections = [];
  const byLabel = new Map();
  for (const mod of getModules()) {
    if (!canView(user, mod.id)) continue;
    for (const item of mod.navItems) {
      const label = mod.navSection || '';
      if (!byLabel.has(label)) {
        const section = { label, items: [] };
        byLabel.set(label, section);
        sections.push(section);
      }
      byLabel.get(label).items.push({ ...item, moduleId: mod.id });
    }
  }
  return sections;
}

/** Test seam — production code must not call this. */
export function clearRegistryForTests() {
  registry.clear();
}
