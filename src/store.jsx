/** App store: domain state (cloned from workbook data), routing, filters, actions. */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DONORS, PROFILES, GRANTS, TRANCHES, DRULES } from './data.js';

const clone = (v) => JSON.parse(JSON.stringify(v));
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => ({
    donors: clone(DONORS),
    profiles: clone(PROFILES),
    grants: clone(GRANTS),
    tranches: clone(TRANCHES),
    drules: clone(DRULES),
  }));
  const [route, setRoute] = useState({ name: 'dashboard' });
  const [donorQ, setDonorQ] = useState('');
  const [grantQ, setGrantQ] = useState('');
  const [donorStatusF, setDonorStatusF] = useState('');
  const [grantStatusF, setGrantStatusF] = useState('');

  const go = useCallback((name, id) => setRoute({ name, id }), []);

  /* ── mutations (immutable copies; rules mirror the workbook) ── */
  const captureOnboarding = useCallback((donorId, key) => {
    setDb((p) => {
      const donors = p.donors.map((d) =>
        d.id === donorId
          ? {
              ...d,
              onboarding: { ...d.onboarding, [key]: true },
              pan: key === 'pan' ? 'AAECG1014K' : d.pan,
              bankRef: key === 'bankRef' ? 'DOM-CA-1001' : d.bankRef,
              updatedAt: '2026-07-08',
            }
          : d,
      );
      const profiles = p.profiles.map((f) =>
        f.donorId === donorId
          ? {
              ...f,
              mode: key === 'fundMode' ? 'Restricted' : f.mode,
              cls: key === 'fundClass' ? 'A' : f.cls,
              freq: key === 'fundClass' ? 'Quarterly' : f.freq,
            }
          : f,
      );
      return { ...p, donors, profiles };
    });
  }, []);

  const approveFinance = useCallback((donorId) => {
    setDb((p) => ({
      ...p,
      donors: p.donors.map((d) =>
        d.id === donorId ? { ...d, onboarding: { ...d.onboarding, financeApproved: true } } : d,
      ),
    }));
  }, []);

  const activateDonor = useCallback((donorId) => {
    setDb((p) => {
      const donors = p.donors.map((d) => (d.id === donorId ? { ...d, status: 'Active', active: true } : d));
      const profiles = p.profiles.map((f) => (f.donorId === donorId ? { ...f, onboarded: true } : f));
      let tranches = p.tranches;
      const grants = p.grants.map((g) => {
        if (g.donorId !== donorId) return g;
        if (!tranches.some((t) => t.gid === g.id)) {
          tranches = [
            ...tranches,
            { id: 'TID-29', gid: g.id, no: 1, exp: g.amount / 2, expDate: '2026-08-01', act: null, actDate: null, status: 'Expected', cond: 'Advance on signed agreement', gate: null },
            { id: 'TID-30', gid: g.id, no: 2, exp: g.amount / 2, expDate: '2026-12-01', act: null, actDate: null, status: 'Expected', cond: '≥75% of Tranche 1 utilised + milestone / UC accepted', gate: 75 },
          ];
        }
        return { ...g, status: 'Active' };
      });
      return { ...p, donors, profiles, grants, tranches };
    });
  }, []);

  const setUcType = useCallback((ruleId, value) => {
    setDb((p) => ({
      ...p,
      drules: p.drules.map((r) => (r.id === ruleId ? { ...r, ucType: value } : r)),
    }));
  }, []);

  const recordUtilisation = useCallback((grantId, amountInr) => {
    setDb((p) => ({
      ...p,
      grants: p.grants.map((g) => (g.id === grantId ? { ...g, utilisedInr: g.utilisedInr + amountInr } : g)),
    }));
  }, []);

  const releaseTranche = useCallback((grantId) => {
    setDb((p) => {
      let released = false;
      const tranches = p.tranches.map((t) => {
        if (!released && t.gid === grantId && t.status === 'Expected') {
          released = true;
          return { ...t, act: t.exp, actDate: '2026-07-08', status: 'Received' };
        }
        return t;
      });
      return { ...p, tranches };
    });
  }, []);

  const value = useMemo(
    () => ({
      db, route, go,
      donorQ, setDonorQ, grantQ, setGrantQ,
      donorStatusF, setDonorStatusF, grantStatusF, setGrantStatusF,
      actions: { captureOnboarding, approveFinance, activateDonor, setUcType, recordUtilisation, releaseTranche },
    }),
    [db, route, go, donorQ, grantQ, donorStatusF, grantStatusF,
     captureOnboarding, approveFinance, activateDonor, setUcType, recordUtilisation, releaseTranche],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
