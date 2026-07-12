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
import { DONORS, PROFILES, GRANTS, TRANCHES, DRULES, GEO, URULES, PROGRAMMES } from './data.js';
import { endpoints, fetchAll, toDonorRequest, toGrantRequest } from './api.js';

const clone = (v) => JSON.parse(JSON.stringify(v));
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
const today = () => new Date().toISOString().slice(0, 10);

/** Keep the shared P() lookup working for API-supplied programmes. */
function syncProgrammes(list) {
  if (list && list.length) PROGRAMMES.splice(0, PROGRAMMES.length, ...list);
}

/** Next sequential id for a local collection, e.g. nextId(donors,'DNR') → 'DNR-15'. */
function nextId(arr, prefix) {
  const max = arr.reduce((m, x) => {
    const n = parseInt(String(x.id).replace(/\D/g, ''), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `${prefix}-${max + 1}`;
}

/** A donor is only Active when every mandatory attribute is present (else Draft + gate). */
function donorRecordFromForm(form, id, prev) {
  const foreign = form.domicile === 'Foreign';
  const complete = Boolean(form.fundMode && form.fundClass && form.pan && form.bankRef);
  return {
    id,
    code: form.code.trim(),
    name: form.name.trim(),
    source: form.source || form.type || '—',
    type: form.type || '—',
    domicile: form.domicile,
    fcra: foreign,
    foreignType: foreign ? form.foreignType || 'Foreign' : 'Domestic / NA',
    country: foreign ? form.country || null : null,
    website: form.website || null,
    registrationNumber: form.registrationNumber || null,
    contact: form.contact || '—',
    email: form.email.trim(),
    phone: form.phone || '—',
    address: form.address || '—',
    pan: form.pan || null,
    bankRef: form.bankRef || null,
    postalCode: form.postalCode || null,
    active: complete,
    status: complete ? 'Active' : 'Draft',
    createdAt: prev ? prev.createdAt : today(),
    updatedAt: today(),
    mou: form.mou || null,
    onboarding: complete
      ? undefined
      : {
          fundMode: Boolean(form.fundMode),
          fundClass: Boolean(form.fundClass),
          pan: Boolean(form.pan),
          bankRef: Boolean(form.bankRef),
          financeApproved: false,
        },
  };
}

function profileRecordFromForm(form, donorId, id) {
  return {
    id,
    donorId,
    mode: form.fundMode || null,
    cls: form.fundClass || 'pending',
    purpose: form.purpose || '—',
    tied: Boolean(form.tied),
    prog: form.progId || null,
    freq: form.freq || null,
    adminAllowed: form.adminAllowed == null ? null : Boolean(form.adminAllowed),
    overhead: form.overhead ? Number(form.overhead) : null,
    movement: Boolean(form.movement),
    explain: Boolean(form.explain),
    onboarded: Boolean(form.fundMode && form.fundClass),
  };
}

/** Child collections for a donor's fund profile, rebuilt from the form arrays. */
function geoRecordsFromForm(form, fpId) {
  return (form.geos || [])
    .map((g) => (typeof g === 'string' ? g : g.geo))
    .map((g) => (g || '').trim())
    .filter(Boolean)
    .map((geo, i) => ({ id: `DGID-${fpId}-${i + 1}`, fp: fpId, geo }));
}
function uruleRecordsFromForm(form, fpId) {
  return (form.urules || [])
    .filter((r) => r && (r.type || '').trim())
    .map((r, i) => ({
      id: `RID-${fpId}-${i + 1}`,
      fp: fpId,
      type: r.type.trim(),
      pct: r.pct === '' || r.pct == null ? 0 : Number(r.pct),
      desc: (r.desc || '').trim(),
    }));
}
function druleRecordFromForm(form, fpId) {
  const d = form.drule || {};
  if (!d.type) return null;
  return {
    id: `DRID-${fpId}`,
    fp: fpId,
    type: d.type,
    ucType: d.type === 'Tranche-on-UC' ? d.ucType || 'Management UC' : null,
    trigger: (d.trigger || '').trim() || (d.type === 'Lump-sum / on-receipt' ? 'Unconditional' : '—'),
    minUtil: d.minUtil === '' || d.minUtil == null ? null : Number(d.minUtil),
    milestone: Boolean(d.milestone),
    desc: (d.desc || '').trim(),
  };
}
function trancheRecordsFromForm(form, gid) {
  return (form.tranches || [])
    .filter((t) => t && (t.exp !== '' && t.exp != null))
    .map((t, i) => ({
      id: `TID-${gid}-${i + 1}`,
      gid,
      no: Number(t.no) || i + 1,
      exp: Number(t.exp) || 0,
      expDate: t.expDate || null,
      act: t.received ? Number(t.exp) || 0 : null,
      actDate: t.received ? (t.actDate || new Date().toISOString().slice(0, 10)) : null,
      status: t.received ? 'Received' : 'Expected',
      cond: (t.cond || '').trim() || 'Scheduled receipt',
      gate: t.gate === '' || t.gate == null ? null : Number(t.gate),
    }));
}
/** Replace all rows of a child collection that belong to `key===match`. */
const replaceChild = (arr, keyName, match, rows) => [...arr.filter((r) => r[keyName] !== match), ...rows];

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => ({
    donors: clone(DONORS),
    profiles: clone(PROFILES),
    grants: clone(GRANTS),
    tranches: clone(TRANCHES),
    drules: clone(DRULES),
    geos: clone(GEO),
    urules: clone(URULES),
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
          geos: [],   /* no geography-by-donor endpoint on this branch */
          urules: [], /* no utilisation-rule endpoint on this branch */
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

  /* ── create / update: donor ── */
  const createDonor = useCallback((form) => {
    if (source === 'api') {
      endpoints.createDonor(toDonorRequest(form)).then(refresh).catch(() => {});
      return;
    }
    setDb((p) => {
      const id = nextId(p.donors, 'DNR');
      const fpId = `FP-${id}`;
      const donor = donorRecordFromForm(form, id);
      const profile = profileRecordFromForm(form, id, fpId);
      const drule = druleRecordFromForm(form, fpId);
      return {
        ...p,
        donors: [...p.donors, donor],
        profiles: [...p.profiles, profile],
        geos: [...p.geos, ...geoRecordsFromForm(form, fpId)],
        urules: [...p.urules, ...uruleRecordsFromForm(form, fpId)],
        drules: drule ? [...p.drules, drule] : p.drules,
      };
    });
  }, [source, refresh]);

  const updateDonor = useCallback((id, form) => {
    if (source === 'api') {
      endpoints.updateDonor(id, toDonorRequest(form)).then(refresh).catch(() => {});
      return;
    }
    setDb((p) => {
      const prev = p.donors.find((d) => d.id === id);
      const donor = donorRecordFromForm(form, id, prev);
      const existingFp = p.profiles.find((f) => f.donorId === id);
      const fpId = existingFp ? existingFp.id : `FP-${id}`;
      const profile = profileRecordFromForm(form, id, fpId);
      const drule = druleRecordFromForm(form, fpId);
      return {
        ...p,
        donors: p.donors.map((d) => (d.id === id ? donor : d)),
        profiles: existingFp
          ? p.profiles.map((f) => (f.donorId === id ? profile : f))
          : [...p.profiles, profile],
        geos: replaceChild(p.geos, 'fp', fpId, geoRecordsFromForm(form, fpId)),
        urules: replaceChild(p.urules, 'fp', fpId, uruleRecordsFromForm(form, fpId)),
        drules: drule ? replaceChild(p.drules, 'fp', fpId, [drule]) : p.drules.filter((r) => r.fp !== fpId),
      };
    });
  }, [source, refresh]);

  /* ── create / update: grant ── */
  const createGrant = useCallback((form) => {
    if (source === 'api') {
      const donor = db.donors.find((d) => d.id === form.donorId);
      endpoints.createGrant(toGrantRequest(form, donor)).then(refresh).catch(() => {});
      return;
    }
    setDb((p) => {
      const id = nextId(p.grants, 'GID');
      const donor = p.donors.find((d) => d.id === form.donorId);
      const fp = p.profiles.find((f) => f.donorId === form.donorId);
      /* keep the inherited profile's programme in step with the grant's choice */
      const profiles = fp && form.progId
        ? p.profiles.map((f) => (f.id === fp.id ? { ...f, prog: form.progId, tied: f.tied || Boolean(form.progId) } : f))
        : p.profiles;
      const ccy = form.ccy || 'INR';
      const grant = {
        id,
        donorId: form.donorId,
        fp: fp ? fp.id : null,
        name: form.name.trim(),
        ref: form.ref.trim(),
        start: form.start,
        end: form.end,
        ccy,
        fx: ccy === 'INR' ? 1 : Number(form.fx) || 1,
        amount: Number(form.amount) || 0,
        status: donor && donor.status === 'Active' ? 'Active' : 'Blocked',
        approved: form.approved || '—',
        agreementDate: form.agreementDate || null,
        description: form.description || null,
        docPath: form.docPath || null,
        utilisedInr: 0,
      };
      const tranches = [...p.tranches, ...trancheRecordsFromForm(form, id)];
      return { ...p, grants: [...p.grants, grant], profiles, tranches };
    });
  }, [source, refresh, db.donors]);

  const updateGrant = useCallback((id, form) => {
    if (source === 'api') {
      const donor = db.donors.find((d) => d.id === form.donorId);
      endpoints.updateGrant(id, toGrantRequest(form, donor)).then(refresh).catch(() => {});
      return;
    }
    setDb((p) => {
      const donor = p.donors.find((d) => d.id === form.donorId);
      const fp = p.profiles.find((f) => f.donorId === form.donorId);
      const profiles = fp && form.progId
        ? p.profiles.map((f) => (f.id === fp.id ? { ...f, prog: form.progId } : f))
        : p.profiles;
      const ccy = form.ccy || 'INR';
      const grants = p.grants.map((g) =>
        g.id === id
          ? {
              ...g,
              donorId: form.donorId,
              fp: fp ? fp.id : g.fp,
              name: form.name.trim(),
              ref: form.ref.trim(),
              start: form.start,
              end: form.end,
              ccy,
              fx: ccy === 'INR' ? 1 : Number(form.fx) || 1,
              amount: Number(form.amount) || 0,
              approved: form.approved || g.approved,
              agreementDate: form.agreementDate || g.agreementDate || null,
              description: form.description || g.description || null,
              docPath: form.docPath || g.docPath || null,
              status: donor && donor.status !== 'Active' ? 'Blocked' : g.status === 'Blocked' ? 'Active' : g.status,
            }
          : g,
      );
      /* Replace the schedule only if the form supplied tranche rows; otherwise keep existing. */
      const supplied = trancheRecordsFromForm(form, id);
      const tranches = form.tranches && form.tranches.length
        ? replaceChild(p.tranches, 'gid', id, supplied)
        : p.tranches;
      return { ...p, grants, profiles, tranches };
    });
  }, [source, refresh, db.donors]);

  const value = useMemo(
    () => ({
      db, source, route, go, refresh,
      donorQ, setDonorQ, grantQ, setGrantQ,
      donorStatusF, setDonorStatusF, grantStatusF, setGrantStatusF,
      actions: {
        captureOnboarding, approveFinance, activateDonor, setUcType, recordUtilisation, releaseTranche,
        createDonor, updateDonor, createGrant, updateGrant,
      },
    }),
    [db, source, route, go, refresh, donorQ, grantQ, donorStatusF, grantStatusF,
     captureOnboarding, approveFinance, activateDonor, setUcType, recordUtilisation, releaseTranche,
     createDonor, updateDonor, createGrant, updateGrant],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
