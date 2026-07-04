import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearRegistryForTests,
  getModuleRoutes,
  getNavSections,
  registerModule,
} from './moduleRegistry.js';

describe('module registry', () => {
  beforeEach(() => clearRegistryForTests());

  it('rejects duplicate module ids', () => {
    registerModule({ id: 'a', title: 'A' });
    expect(() => registerModule({ id: 'a', title: 'A again' })).toThrow(/already registered/);
  });

  it('tags routes with their owning module id', () => {
    registerModule({
      id: 'donors',
      title: 'Donors',
      routes: [{ path: '/donors', element: null }],
    });
    expect(getModuleRoutes()).toEqual([
      expect.objectContaining({ path: '/donors', moduleId: 'donors' }),
    ]);
  });

  it('builds nav sections filtered by permission', () => {
    registerModule({
      id: 'visible',
      title: 'Visible',
      navSection: 'CORE',
      navItems: [{ label: 'Visible', path: '/visible' }],
    });
    registerModule({
      id: 'hidden',
      title: 'Hidden',
      navSection: 'CORE',
      navItems: [{ label: 'Hidden', path: '/hidden' }],
    });
    const sections = getNavSections({ role: 'X' }, (_user, moduleId) => moduleId === 'visible');
    expect(sections).toHaveLength(1);
    expect(sections[0].items).toEqual([
      expect.objectContaining({ path: '/visible', moduleId: 'visible' }),
    ]);
  });
});
