/** UI primitives: chips, KV tables, fund-class ⓘ, modal + toast providers. */
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { P } from './data.js';
import { inr } from './lib.js';

/* ── chips ── */
export const Chip = ({ label, tone = 'mut' }) => <span className={`chip ${tone}`}>{label}</span>;

export const GrantStatusChip = ({ status }) => (
  <Chip
    label={status}
    tone={status === 'Active' ? 'ok' : status === 'Blocked' ? 'err' : 'mut'}
  />
);

export const DonorStatusChip = ({ donor }) => (
  <Chip label={donor.status} tone={donor.status === 'Active' ? 'ok' : 'err'} />
);

/* ── fund class + contextual ⓘ (replaces the Fund Class Matrix) ── */
export const FC_INFO = {
  A: {
    title: 'Class A — Fully restricted',
    body: 'Movement between budget lines is blocked. Funds are locked to the purpose defined in the agreement. Utilisation reporting: project-level utilisation certificate required. Donors in class: Greenline, Mehta, Suraksha, Tarang, Aarohan, Kulkarni, Vidya.',
  },
  B: {
    title: 'Class B — Unrestricted with explanation',
    body: 'Movement between budget lines is allowed, but every move requires a written explanation recorded as an audit entry. Utilisation reporting: movement audit trail in utilisation context. Donor in class: Horizon.',
  },
  C: {
    title: 'Class C — Fully unrestricted',
    body: 'Movement between budget lines is free — no explanation required. Utilisation reporting: aggregate reporting only. Donors in class: Rohan, Anjali, Vikram, Priya.',
  },
  pending: {
    title: 'Pending — unconfirmed at onboarding',
    body: 'Fund class is not yet confirmed. All movement and disbursement is blocked and the donor cannot reach Active status; funds sit in the PRG-HOLD suspense pool until rules are confirmed.',
  },
};
const TIE_NOTE =
  ' Programme-tied: movement is additionally constrained to budget lines of the tied programme; a programme-level utilisation certificate covers reporting.';

export function FundClassChip({ fp }) {
  const modal = useModal();
  let label, tone, key;
  if (!fp || fp.cls === 'pending') { label = 'pending'; tone = 'err'; key = 'pending'; }
  else if (fp.cls.startsWith('A')) { label = `Class A · block${fp.tied ? ' · tied' : ''}`; tone = 'err'; key = 'A'; }
  else if (fp.cls === 'B') { label = 'Class B · explain'; tone = 'info'; key = 'B'; }
  else { label = `Class C · free${fp.tied ? ' · tied' : ''}`; tone = 'ok'; key = 'C'; }
  const info = FC_INFO[key];
  return (
    <>
      <Chip label={label} tone={tone} />
      <button
        className="ibtn"
        aria-label="Explain fund class"
        title="Explain fund class"
        onClick={(e) => {
          e.stopPropagation();
          modal.ask({ kind: 'info', title: info.title, body: <p style={{ margin: 0 }}>{info.body}{fp && fp.tied ? TIE_NOTE : ''}</p> });
        }}
      >
        i
      </button>
    </>
  );
}

/* ── key-value table ── */
export const KV = ({ rows }) => (
  <div className="tablewrap">
    <table className="kv">
      <tbody>
        {rows.filter(Boolean).map(([k, v]) => (
          <tr key={k}>
            <td className="k">{k}</td>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ── toast ── */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);
  const show = useCallback((m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={`toast ${msg ? 'show' : ''}`} role="status">{msg}</div>
    </ToastCtx.Provider>
  );
}

/* ── modal (promise-based: info / confirm / pop) ── */
const ModalCtx = createContext(null);
export const useModal = () => useContext(ModalCtx);

export function ModalProvider({ children }) {
  const [m, setM] = useState(null);
  const inputRef = useRef(null);
  const ask = useCallback((cfg) => new Promise((resolve) => setM({ ...cfg, resolve })), []);
  const close = (value) => { m.resolve(value); setM(null); };

  return (
    <ModalCtx.Provider value={{ ask }}>
      {children}
      {m && (
        <div className="modal-backdrop" onClick={() => close(m.kind === 'confirm' ? { ok: false } : undefined)}>
          <div
            className={`modal ${m.kind === 'pop' ? 'wide' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={m.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dlg-body">
              <h3>{m.title}</h3>
              <div style={{ color: 'var(--muted)', fontSize: '12.5px' }}>{m.body}</div>
              {m.input && (
                <div style={{ marginTop: 10 }}>
                  {m.input.type === 'textarea' ? (
                    <textarea ref={inputRef} placeholder={m.input.placeholder} />
                  ) : (
                    <input
                      ref={inputRef}
                      type="number"
                      min="1"
                      max={m.input.max}
                      placeholder={m.input.placeholder}
                      style={{
                        width: '100%', font: 'inherit', fontSize: 13, color: 'var(--ink)',
                        background: 'var(--paper)', border: '1px solid var(--line)',
                        borderRadius: 8, padding: '8px 10px',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="dlg-actions">
              {m.kind === 'pop' && m.alt && (
                <button className="btn ghost" style={{ marginRight: 'auto' }} onClick={() => { close(undefined); m.alt.go(); }}>
                  {m.alt.label}
                </button>
              )}
              {m.kind === 'confirm' && (
                <button className="btn ghost" onClick={() => close({ ok: false })}>Cancel</button>
              )}
              {m.kind === 'confirm' ? (
                <button className="btn dark" onClick={() => close({ ok: true, value: inputRef.current ? inputRef.current.value : undefined })}>
                  {m.okLabel || 'Confirm'}
                </button>
              ) : (
                <button className="btn dark" onClick={() => close(undefined)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}

/* ── mini tables used inside dashboard pop-ups ── */
export const MiniDonors = ({ list, profiles }) => (
  <div className="tablewrap">
    <table>
      <thead><tr><th>Code</th><th>Donor</th><th>Fund mode</th><th>Class</th><th>Status</th></tr></thead>
      <tbody>
        {list.length ? list.map((d) => {
          const fp = profiles.find((f) => f.donorId === d.id);
          return (
            <tr key={d.id}>
              <td>{d.code}</td><td><b>{d.name}</b></td>
              <td>{fp && fp.mode ? fp.mode : '—'}</td><td>{fp ? fp.cls : '—'}</td>
              <td><DonorStatusChip donor={d} /></td>
            </tr>
          );
        }) : <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>None.</td></tr>}
      </tbody>
    </table>
  </div>
);

export const MiniGrants = ({ list, amtLabel, amtOf, donors }) => (
  <div className="tablewrap">
    <table>
      <thead><tr><th>Agreement</th><th>Donor</th><th className="money">{amtLabel}</th><th>Status</th></tr></thead>
      <tbody>
        {list.length ? list.map((x) => (
          <tr key={x.id}>
            <td>{x.ref}</td>
            <td>{donors.find((d) => d.id === x.donorId).name}</td>
            <td className="money">{inr(amtOf(x))}</td>
            <td><GrantStatusChip status={x.status} /></td>
          </tr>
        )) : <tr><td colSpan="4" style={{ color: 'var(--muted)' }}>None.</td></tr>}
      </tbody>
    </table>
  </div>
);

/* ── page furniture ── */
export const PageHead = ({ title, sub, right }) => (
  <div className="pagehead">
    <div><h1>{title}</h1>{sub && <p className="sub">{sub}</p>}</div>
    {right}
  </div>
);

export const ProgrammeName = ({ id }) => (id ? `${P(id).code} — ${P(id).name}` : null);
