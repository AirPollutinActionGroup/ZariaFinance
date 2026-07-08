/** Pure formatting and derivation helpers — no React, unit-testable. */
import { CR } from './data.js';

const L = 1e5;

export const inr = (v) => {
  const a = Math.abs(v);
  const s = v < 0 ? '-' : '';
  if (a >= CR) return `${s}₹${(a / CR).toFixed(2)} Cr`;
  if (a >= L) return `${s}₹${(a / L).toFixed(2)} L`;
  return `${s}₹${Math.round(a).toLocaleString('en-IN')}`;
};

export const money = (v, ccy) =>
  ccy === 'INR' ? inr(v) : `${ccy === 'USD' ? '$' : ccy === 'GBP' ? '£' : '€'}${(v / 1000).toFixed(0)}k`;

export const dtf = (s) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/** Per-grant derived figures (INR reporting). */
export function gFig(g, tranches) {
  const trs = tranches.filter((t) => t.gid === g.id);
  const receivedCcy = trs.reduce((s, t) => s + (t.act || 0), 0);
  const committedInr = g.amount * g.fx;
  const receivedInr = receivedCcy * g.fx;
  const utilisedInr = g.utilisedInr;
  return {
    trs,
    committedInr,
    receivedInr,
    utilisedInr,
    availableInr: receivedInr - utilisedInr,
    outstandingInr: committedInr - receivedInr,
  };
}

/** Portfolio totals; blocked commitments are excluded from every figure. */
export function totals(grants, tranches) {
  let committed = 0, received = 0, utilised = 0, blocked = 0;
  grants.forEach((g) => {
    const f = gFig(g, tranches);
    if (g.status === 'Blocked') { blocked += f.committedInr; return; }
    committed += f.committedInr;
    received += f.receivedInr;
    utilised += g.utilisedInr;
  });
  return { committed, received, utilised, blocked, available: received - utilised, open: committed - received };
}

/** Utilisation % of the most recent received tranche (drives release gates). */
export function priorUtilPct(g, tranches) {
  const f = gFig(g, tranches);
  const recvd = f.trs.filter((t) => t.status === 'Received');
  if (!recvd.length) return 0;
  const last = recvd[recvd.length - 1];
  const before = recvd.slice(0, -1).reduce((s, t) => s + t.act, 0) * g.fx;
  const lastInr = last.act * g.fx;
  return Math.max(0, Math.min(100, ((g.utilisedInr - before) / lastInr) * 100));
}

export const druleOf = (g, drules) => drules.find((r) => r.fp === g.fp);

/** Review rule #1: no Active grant may hang off a non-Active donor. */
export const statusClash = (grants, donors) =>
  grants.some((g) => g.status === 'Active' && donors.find((d) => d.id === g.donorId).status !== 'Active');
