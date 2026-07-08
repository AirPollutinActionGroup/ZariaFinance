/**
 * App store: domain state, routing, filters, actions.
 *
 * Data source strategy (branch fet--UserAndDonorModule):
 *  - On boot the store tries the backend (donors, grants, programmes via
 *    src/api.js). If it responds, the app runs on live API data and the
 *    donor/grant mutations that HAVE endpoints go through them.
 *  - If the backend is unreachable (e.g. static Netlify preview), the store
 *    falls back to the workbook sample data — identical UI either way.
 *  - Fund profiles, tranches, utilisation and disbursement rules have no
 *    endpoints on that branch, so their behaviour stays client-side in both
 *    modes (API donors get "pending" placeholder profiles).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DONORS, PROFILES, GRANTS, TRANCHES, DRULES, PROGRAMMES } from './data.js';
import { endpoints, fetchAll } from './api.js';

const clone = (v) => JSON.parse(JSON.stringify(v));
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

/** Keep the shared P() lookup working for API-supplied programmes. */
function syncProgrammes(list) {
  if (list && list.length) PROGRAMMES.splice(0, PROGRAMMES.length, ...list);
}

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => ({
    donors: clone(DONORS),
    profiles: clone(PROFILES),
    grants: clone(GRANTS),
    tranches: clone(TRANCHES),
    drules: clone(DRULES),
  }));
  const [source, setSource] = useState('sample'); // 'sample' | 'api'
  const [route, setRoute] = useState({ name: 'dashboard' });
  const [donorQ, setDonorQ] = useState('');
  const [grantQ, setGrantQ] = useState('');
  const [donorStatusF, setDonorStatusF] = useState('');
  const [grantStatusF, setGrantStatusF] = useState('');

  /* ── boot-time hydration from the backend, sample fallback ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const api = await fetchAll();
        if (cancelled) return;
        syncProgrammes(api.programmes);
        setDb({
          donors: api.donors,
          profiles: api.profiles,
          grants: api.grants,
          tranches: api.tranches,
          drules: api.drules,
        });
        setSource('api');
      } catch {
        /* backend unreachable — keep the workbook sample (design-preview mode) */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    const api = await fetchAll();
    syncProgrammes(api.programmes);
    setDb((p) => ({ ...p, donors: api.donors, profiles: api.profiles, grants: api.grants }));
  }, []);

  const go = useCallback((name, id) => setRoute({ name, id }), []);

  /* ── mutations ──
     Endpoint-backed when running on the API; local otherwise. Client-side
     rules (onboarding gate fields, tranche gates, utilisation) mutate local
     state in both modes — they have no backend on this branch. */

  const captureOnboarding = useCallback((donorId, key) => {
    setDb((p) => {
      const donors = p.donors.map((d) =>
        d.id === donorId
          ? {
              ...d,
              onboarding: { ...d.onboarding, [key]: true },
              pan: key === 'pan' ? d.pan || 'AAECG1014K' : d.pan,
              bankRef: key === 'bankRef' ? d.bankRef || 'DOM-CA-1001' : d.bankRef,
              updatedAt: new Date().toISOString().slice(0, 10),
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

  const activateDonorLocal = (p, donorId) => {
    const donors = p.donors.map((d) => (d.id === donorId ? { ...d, status: 'Active', active: true } : d));
    const profiles = p.profiles.map((f) => (f.donorId === donorId ? { ...f, onboarded: true } : f));
    let tranches = p.tranches;
    const grants = p.grants.map((g) => {
      if (g.donorId !== donorId || g.status !== 'Blocked') return g;
      if (!tranches.some((t) => t.gid === g.id)) {
        tranches = [
          ...tranches,
          { id: `TID-${g.id}-1`, gid: g.id, no: 1, exp: g.amount / 2, expDate: '2026-08-01', act: null, actDate: null, status: 'Expected', cond: 'Advance on signed agreement', gate: null },
          { id: `TID-${g.id}-2`, gid: g.id, no: 2, exp: g.amount / 2, expDate: '2026-12-01', act: null, actDate: null, status: 'Expected', cond: '≥75% of Tranche 1 utilised + milestone / UC accepted', gate: 75 },
        ];
      }
      return { ...g, status: 'Active' };
    });
    return { ...p, donors, profiles, grants, tranches };
  };

  const activateDonor = useCallback((donorId) => {
    if (source === 'api') {
      /* PATCH /api/v1/donors/{id}/activate, then re-sync grants so the
         donor-draft block clears server-consistently. */
      (async () => {
        try {
          await endpoints.activateDonor(donorId);
          await refresh();
        } catch {
          setDb((p) => activateDonorLocal(p, donorId)); /* optimistic fallback */
        }
      })();
      return;
    }
    setDb((p) => activateDonorLocal(p, donorId));
  }, [source, refresh]);

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
          return { ...t, act: t.exp, actDate: new Date().toISOString().slice(0, 10), status: 'Received' };
        }
        return t;
      });
      return { ...p, tranches };
    });
  }, []);

  const value = useMemo(
    () => ({
      db, source, route, go, refresh,
      donorQ, setDonorQ, grantQ, setGrantQ,
      donorStatusF, setDonorStatusF, grantStatusF, setGrantStatusF,
      actions: { captureOnboarding, approveFinance, activateDonor, setUcType, recordUtilisation, releaseTranche },
    }),
    [db, source, route, go, refresh, donorQ, grantQ, donorStatusF, grantStatusF,
     captureOnboarding, approveFinance, activateDonor, setUcType, recordUtilisation, releaseTranche],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
