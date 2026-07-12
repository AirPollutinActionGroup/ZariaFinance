/** Create & edit forms for donors and grant agreements.
 * Complete against the workbook + backend DTOs: donor identity, domicile/
 * compliance, contact, fund profile, geographies, utilisation rules and the
 * disbursement rule; grant agreement terms plus the tranche schedule.
 * Drives the store's create/update actions (API POST/PUT when a backend is
 * present, local state otherwise). No existing UI element changed. */
import { useMemo, useState } from 'react';
import { useApp } from '../store.jsx';
import { PROGRAMMES } from '../data.js';
import { PageHead, FundClassChip, Chip, useToast } from '../ui.jsx';

/* ── field primitives ── */
function Field({ label, required, error, hint, full, children }) {
  return (
    <div className={`fld ${full ? 'full' : ''} ${error ? 'invalid' : ''}`}>
      <label>{label}{required ? <b> *</b> : null}</label>
      {children}
      <div className="msg">{error || ''}</div>
      {hint && !error ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
const Text = (p) => <input type={p.type || 'text'} value={p.value} placeholder={p.placeholder}
  onChange={(e) => p.onChange(e.target.value)} disabled={p.disabled} />;
const Area = (p) => <textarea rows={p.rows || 2} value={p.value} placeholder={p.placeholder}
  onChange={(e) => p.onChange(e.target.value)} />;
function Select({ value, onChange, options, placeholder, disabled }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      {placeholder != null && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
const Check = ({ label, checked, onChange }) => (
  <label className="row" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: 'var(--ink)', fontSize: 13 }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
  </label>
);
const opts = (arr) => arr.map((v) => ({ value: v, label: v }));

/** Repeatable-row editor for one-to-many collections. */
function RowList({ items, onChange, blank, addLabel, emptyText, columns }) {
  const add = () => onChange([...items, { ...blank }]);
  const upd = (i, patch) => onChange(items.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const del = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="rowlist">
      {items.length === 0 && <div className="empty-row">{emptyText}</div>}
      {items.map((row, i) => (
        <div className="rowlist-row" key={i}>
          {columns.map((c) => (
            <div className={`cell ${c.grow ? 'grow' : ''}`} key={c.key} style={c.width ? { flex: `0 0 ${c.width}` } : undefined}>
              {i === 0 && <span>{c.label}</span>}
              {c.render(row, (v) => upd(i, { [c.key]: v }))}
            </div>
          ))}
          <button type="button" className="rowdel" onClick={() => del(i)} aria-label="Remove row">✕</button>
        </div>
      ))}
      <button type="button" className="btn ghost sm rowadd" onClick={add}>+ {addLabel}</button>
    </div>
  );
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const clean = (v) => (v && v !== '—' ? v : '');

/* ═══════════════ Donor create / edit ═══════════════ */
export function DonorForm({ id }) {
  const { db, go, actions } = useApp();
  const toast = useToast();
  const editing = Boolean(id);
  const donor = editing ? db.donors.find((d) => d.id === id) : null;
  const fp = editing ? db.profiles.find((f) => f.donorId === id) : null;
  const existingDr = fp ? db.drules.find((r) => r.fp === fp.id) : null;

  const [f, setF] = useState(() => ({
    code: donor ? donor.code : '',
    name: donor ? donor.name : '',
    source: donor ? clean(donor.source) : '',
    type: donor ? clean(donor.type) : '',
    domicile: donor ? donor.domicile : 'Domestic',
    foreignType: donor && donor.foreignType !== 'Domestic / NA' ? donor.foreignType : '',
    country: donor ? clean(donor.country) : '',
    website: donor ? clean(donor.website) : '',
    registrationNumber: donor ? clean(donor.registrationNumber) : '',
    contact: donor ? clean(donor.contact) : '',
    email: donor ? clean(donor.email) : '',
    phone: donor ? clean(donor.phone) : '',
    address: donor ? clean(donor.address) : '',
    postalCode: donor ? clean(donor.postalCode) : '',
    pan: donor ? clean(donor.pan) : '',
    bankRef: donor ? clean(donor.bankRef) : '',
    mou: donor ? clean(donor.mou) : '',
    fundMode: fp && fp.mode ? fp.mode : '',
    fundClass: fp && fp.cls && fp.cls !== 'pending' ? fp.cls[0] : '',
    purpose: fp ? clean(fp.purpose) : '',
    tied: fp ? Boolean(fp.tied) : false,
    progId: fp && fp.prog ? fp.prog : '',
    freq: fp && fp.freq ? fp.freq : '',
    adminAllowed: fp ? fp.adminAllowed !== false : true,
    overhead: fp && fp.overhead ? String(fp.overhead) : '',
    movement: fp ? Boolean(fp.movement) : false,
    explain: fp ? Boolean(fp.explain) : false,
    geos: fp ? db.geos.filter((g) => g.fp === fp.id).map((g) => ({ geo: g.geo })) : [],
    urules: fp ? db.urules.filter((r) => r.fp === fp.id).map((r) => ({ type: r.type, pct: String(r.pct), desc: r.desc })) : [],
    drule: existingDr
      ? { type: existingDr.type, ucType: existingDr.ucType || 'Management UC', trigger: existingDr.trigger || '', minUtil: existingDr.minUtil == null ? '' : String(existingDr.minUtil), milestone: Boolean(existingDr.milestone), desc: existingDr.desc || '' }
      : { type: '', ucType: 'Management UC', trigger: '', minUtil: '', milestone: false, desc: '' },
  }));
  const [errs, setErrs] = useState({});
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const setDr = (k) => (v) => setF((s) => ({ ...s, drule: { ...s.drule, [k]: v } }));
  const foreign = f.domicile === 'Foreign';
  const progOptions = useMemo(() => PROGRAMMES.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })), []);

  const submit = () => {
    const e = {};
    if (!f.code.trim()) e.code = 'Donor code is required';
    if (!f.name.trim()) e.name = 'Donor name is required';
    if (!f.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
    setErrs(e);
    if (Object.keys(e).length) { toast('Please fix the highlighted fields'); return; }
    if (editing) { actions.updateDonor(id, f); toast('Donor updated'); go('donor', id); }
    else { actions.createDonor(f); toast('Donor registered'); go('donors'); }
  };

  return (
    <>
      <button className="backlink" onClick={() => go(editing ? 'donor' : 'donors', id)}>← {editing ? 'Back to donor' : 'Donor Register'}</button>
      <PageHead title={editing ? `Edit — ${donor.name}` : 'Register a donor'}
        sub={editing ? donor.code : 'Capture the donor identity, compliance, contact, fund profile and rules'} />

      <div className="card">
        <h2>Identity</h2>
        <div className="fgrid">
          <Field label="Donor code" required error={errs.code} hint="Unique reference, e.g. DNR-CD-015">
            <Text value={f.code} onChange={set('code')} placeholder="DNR-CD-015" />
          </Field>
          <Field label="Donor name" required error={errs.name}>
            <Text value={f.name} onChange={set('name')} placeholder="Organisation or individual name" />
          </Field>
          <Field label="Source">
            <Select value={f.source} onChange={set('source')} placeholder="— Select source —"
              options={opts(['CSR', 'Individual', 'Sponsorship', 'Untied · UC-based', 'Pre-defined · UC-based', 'Grant', 'Other'])} />
          </Field>
          <Field label="Donor type">
            <Select value={f.type} onChange={set('type')} placeholder="— Select type —"
              options={opts(['Corporate CSR', 'Corporate Sponsor', 'Foundation', 'Individual', 'Philanthropy', 'Trust', 'Other'])} />
          </Field>
          <Field label="Website"><Text value={f.website} onChange={set('website')} placeholder="https://…" /></Field>
          <Field label="Registration number" hint="CIN / society / trust registration">
            <Text value={f.registrationNumber} onChange={set('registrationNumber')} />
          </Field>
        </div>
      </div>

      <div className="card">
        <h2>Domicile &amp; compliance</h2>
        <div className="fgrid">
          <Field label="Domicile" hint="Drives FCRA treatment and FX handling">
            <Select value={f.domicile} onChange={set('domicile')} options={opts(['Domestic', 'Foreign'])} />
          </Field>
          <Field label="FCRA applicable">
            <div className="row" style={{ minHeight: 36 }}>
              {foreign ? <Chip label="FCRA ✓ (foreign donor)" tone="warn" /> : <span style={{ color: 'var(--muted)', fontSize: 13 }}>Not applicable (domestic)</span>}
            </div>
          </Field>
          {foreign && (
            <Field label="Foreign fund source type">
              <Select value={f.foreignType} onChange={set('foreignType')} placeholder="— Select —"
                options={opts(['Foreign — Government', 'Foreign — Private', 'Foreign Foundation', 'Foreign — Corporate Philanthropy'])} />
            </Field>
          )}
          {foreign && <Field label="Foreign country"><Text value={f.country} onChange={set('country')} placeholder="e.g. USA" /></Field>}
          <Field label="PAN" hint="Statutory identifier for 80G / TDS"><Text value={f.pan} onChange={set('pan')} placeholder="AAECG1234K" /></Field>
          <Field label="Bank account ref" hint={foreign ? 'Must be the designated FCRA account' : 'Receiving account reference'}>
            <Text value={f.bankRef} onChange={set('bankRef')} placeholder={foreign ? 'FCRA-DESIG-…' : 'DOM-CA-…'} />
          </Field>
        </div>
      </div>

      <div className="card">
        <h2>Contact</h2>
        <div className="fgrid">
          <Field label="Contact person"><Text value={f.contact} onChange={set('contact')} /></Field>
          <Field label="Email" required error={errs.email}><Text type="email" value={f.email} onChange={set('email')} placeholder="name@example.org" /></Field>
          <Field label="Phone"><Text value={f.phone} onChange={set('phone')} placeholder="90000 00000" /></Field>
          <Field label="Postal code"><Text value={f.postalCode} onChange={set('postalCode')} /></Field>
          <Field label="Address" full><Area value={f.address} onChange={set('address')} placeholder="Street, city, state" /></Field>
          <Field label="MoU (file / link)" full hint="Reference to the signed MoU document"><Text value={f.mou} onChange={set('mou')} placeholder="MoU_Donor.pdf" /></Field>
        </div>
      </div>

      <div className="card">
        <h2>Fund profile</h2>
        <p className="cardsub">These attributes govern how the donor's money may move and be reported. A donor becomes <b>Active</b> only when fund mode, fund class, PAN and bank reference are all set — otherwise it stays <b>Draft</b> and passes through the onboarding gate.</p>
        <div className="fgrid">
          <Field label="Fund mode"><Select value={f.fundMode} onChange={set('fundMode')} placeholder="— not set —" options={opts(['Restricted', 'Unrestricted'])} /></Field>
          <Field label="Fund class">
            <Select value={f.fundClass} onChange={set('fundClass')} placeholder="— pending —"
              options={[{ value: 'A', label: 'Class A — fully restricted' }, { value: 'B', label: 'Class B — unrestricted with explanation' }, { value: 'C', label: 'Class C — fully unrestricted' }]} />
          </Field>
          <Field label="Purpose" full><Text value={f.purpose} onChange={set('purpose')} placeholder="e.g. Clean Air Action (defined project only)" /></Field>
          <Field label="Programme"><Select value={f.progId} onChange={set('progId')} placeholder="— untied —" options={progOptions} /></Field>
          <Field label="Reporting frequency"><Select value={f.freq} onChange={set('freq')} placeholder="— Select —" options={opts(['Quarterly', 'Half-yearly', 'Annual'])} /></Field>
          <Field label="Overhead cap %" hint="Admin recovery limit, if any"><Text type="number" value={f.overhead} onChange={set('overhead')} placeholder="5" /></Field>
          <Field label="Flags">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
              <Check label="Programme-tied" checked={f.tied} onChange={set('tied')} />
              <Check label="Admin / overhead allowed" checked={f.adminAllowed} onChange={set('adminAllowed')} />
              <Check label="Budget-line movement allowed" checked={f.movement} onChange={set('movement')} />
              <Check label="Explanation required on movement" checked={f.explain} onChange={set('explain')} />
            </div>
          </Field>
        </div>
      </div>

      <div className="card">
        <h2>Geographies</h2>
        <p className="cardsub">Where this fund profile may be spent (one profile, many geographies).</p>
        <RowList
          items={f.geos} onChange={set('geos')} blank={{ geo: '' }} addLabel="Add geography"
          emptyText="No geographies added — add the states / regions this fund may cover."
          columns={[{ key: 'geo', label: 'Geography', grow: true, render: (r, on) => <input value={r.geo} placeholder="e.g. Delhi NCR" onChange={(e) => on(e.target.value)} /> }]} />
      </div>

      <div className="card">
        <h2>Utilisation rules</h2>
        <p className="cardsub">Quantitative caps and exclusions (overhead cap, fundraising exclusion, minimum direct spend…).</p>
        <RowList
          items={f.urules} onChange={set('urules')} blank={{ type: '', pct: '', desc: '' }} addLabel="Add rule"
          emptyText="No utilisation rules — add caps or exclusions if the donor imposes any."
          columns={[
            { key: 'type', label: 'Rule type', width: '220px', render: (r, on) => (
              <select value={r.type} onChange={(e) => on(e.target.value)}>
                <option value="">— Select —</option>
                {['Admin / Overhead cap', 'Fundraising cost exclusion', 'Minimum direct spend', 'Other'].map((o) => <option key={o}>{o}</option>)}
              </select>) },
            { key: 'pct', label: 'Limit %', width: '90px', render: (r, on) => <input type="number" value={r.pct} placeholder="5" onChange={(e) => on(e.target.value)} /> },
            { key: 'desc', label: 'Description', grow: true, render: (r, on) => <input value={r.desc} placeholder="Rule detail" onChange={(e) => on(e.target.value)} /> },
          ]} />
      </div>

      <div className="card">
        <h2>Disbursement rule</h2>
        <p className="cardsub">How money is released for this fund profile.</p>
        <div className="fgrid">
          <Field label="Rule type">
            <Select value={f.drule.type} onChange={setDr('type')} placeholder="— Select —"
              options={opts(['Tranche-on-UC', 'Tranche-on-report', 'Lump-sum / on-receipt', 'Hold'])} />
          </Field>
          {f.drule.type === 'Tranche-on-UC' && (
            <Field label="UC type" hint="Which certificate gates each tranche">
              <Select value={f.drule.ucType} onChange={setDr('ucType')} options={opts(['Management UC', 'Audit UC'])} />
            </Field>
          )}
          <Field label="Release trigger"><Text value={f.drule.trigger} onChange={setDr('trigger')} placeholder="e.g. Milestone + utilisation gate" /></Field>
          <Field label="Min prior utilisation %" hint="Threshold before the next tranche releases"><Text type="number" value={f.drule.minUtil} onChange={setDr('minUtil')} placeholder="75" /></Field>
          <Field label="Milestone / UC required">
            <div className="rowcheck" style={{ paddingTop: 8 }}><Check label="Milestone / UC must be accepted" checked={f.drule.milestone} onChange={setDr('milestone')} /></div>
          </Field>
          <Field label="Description" full><Text value={f.drule.desc} onChange={setDr('desc')} placeholder="Plain-language release condition" /></Field>
        </div>
        <div className="formfoot">
          <span className="spacer">{editing ? 'Changes are saved to this donor record.' : 'A new donor is created in the register.'}</span>
          <button className="btn ghost" onClick={() => go(editing ? 'donor' : 'donors', id)}>Cancel</button>
          <button className="btn dark" onClick={submit}>{editing ? 'Save changes' : 'Register donor'}</button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════ Grant create / edit ═══════════════ */
export function GrantForm({ id }) {
  const { db, go, actions } = useApp();
  const toast = useToast();
  const editing = Boolean(id);
  const grant = editing ? db.grants.find((g) => g.id === id) : null;

  const donorOptions = useMemo(() => {
    const list = db.donors.filter((d) => d.status === 'Active');
    if (grant && !list.some((d) => d.id === grant.donorId)) {
      const cur = db.donors.find((d) => d.id === grant.donorId);
      if (cur) list.unshift(cur);
    }
    return list.map((d) => ({ value: d.id, label: `${d.name} (${d.code})${d.status !== 'Active' ? ' — Draft' : ''}` }));
  }, [db.donors, grant]);
  const progOptions = useMemo(() => PROGRAMMES.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })), []);
  const profOf = (donorId) => db.profiles.find((p) => p.donorId === donorId);

  const [f, setF] = useState(() => {
    const donorId = grant ? grant.donorId : (donorOptions[0] ? donorOptions[0].value : '');
    return {
      ref: grant ? grant.ref : '',
      donorId,
      name: grant ? grant.name : '',
      progId: grant ? (profOf(grant.donorId)?.prog || '') : (profOf(donorId)?.prog || ''),
      agreementDate: grant ? (grant.agreementDate || '') : '',
      start: grant ? grant.start : '',
      end: grant ? grant.end : '',
      ccy: grant ? grant.ccy : 'INR',
      fx: grant ? String(grant.fx) : '1',
      amount: grant ? String(grant.amount) : '',
      approved: grant && grant.approved !== '—' ? grant.approved : '',
      description: grant ? (grant.description || '') : '',
      docPath: grant ? (grant.docPath || '') : '',
      tranches: grant
        ? db.tranches.filter((t) => t.gid === grant.id).map((t) => ({
            no: String(t.no), exp: String(t.exp), expDate: t.expDate || '',
            cond: t.cond || '', gate: t.gate == null ? '' : String(t.gate), received: t.status === 'Received',
          }))
        : [],
    };
  });
  const [errs, setErrs] = useState({});
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const setDonor = (donorId) => setF((s) => ({ ...s, donorId, progId: profOf(donorId)?.prog || s.progId }));

  const donor = db.donors.find((d) => d.id === f.donorId);
  const fp = profOf(f.donorId);
  const inr = f.ccy === 'INR';

  const submit = () => {
    const e = {};
    if (!f.ref.trim()) e.ref = 'Agreement reference is required';
    if (!f.donorId) e.donorId = 'Select a donor';
    if (!f.name.trim()) e.name = 'Agreement name is required';
    if (!f.start) e.start = 'Start date is required';
    if (!f.end) e.end = 'End date is required';
    else if (f.start && f.end < f.start) e.end = 'End date must be after the start date';
    if (!f.amount || Number(f.amount) <= 0) e.amount = 'Enter an amount greater than 0';
    if (!inr && (!f.fx || Number(f.fx) <= 0)) e.fx = 'FX rate is required for foreign currency';
    setErrs(e);
    if (Object.keys(e).length) { toast('Please fix the highlighted fields'); return; }
    if (editing) { actions.updateGrant(id, f); toast('Grant updated'); go('grant', id); }
    else { actions.createGrant(f); toast('Grant created'); go('grants'); }
  };

  return (
    <>
      <button className="backlink" onClick={() => go(editing ? 'grant' : 'grants', id)}>← {editing ? 'Back to agreement' : 'Grant Agreements'}</button>
      <PageHead title={editing ? `Edit — ${grant.ref}` : 'New grant agreement'}
        sub={editing ? grant.name : 'Record a signed agreement against an active donor'} />

      <div className="card">
        <h2>Agreement</h2>
        <div className="fgrid">
          <Field label="Agreement reference" required error={errs.ref} hint="e.g. ZRY/GA/2026/015"><Text value={f.ref} onChange={set('ref')} placeholder="ZRY/GA/2026/015" /></Field>
          <Field label="Donor" required error={errs.donorId}><Select value={f.donorId} onChange={setDonor} placeholder="— Select donor —" options={donorOptions} /></Field>
          <Field label="Agreement name" required error={errs.name} full><Text value={f.name} onChange={set('name')} placeholder="Donor : Programme FY" /></Field>
          <Field label="Programme" hint="Inherited from the donor; adjust if tied differently"><Select value={f.progId} onChange={set('progId')} placeholder="— Core / unrestricted —" options={progOptions} /></Field>
          <Field label="Inherited fund class">
            <div className="row" style={{ minHeight: 36 }}>{fp ? <FundClassChip fp={fp} /> : <span style={{ color: 'var(--muted)', fontSize: 13 }}>—</span>}</div>
          </Field>
        </div>
        {donor && donor.status !== 'Active' && (
          <div className="note" style={{ margin: '0 20px 16px' }}>
            <b>Heads-up:</b> {donor.name} is <b>Draft</b>. This agreement will be created as <b>Blocked</b> and excluded from every total until the donor is activated (system rule).
          </div>
        )}
      </div>

      <div className="card">
        <h2>Term &amp; value</h2>
        <div className="fgrid">
          <Field label="Agreement (signing) date" hint="Date the agreement was signed"><Text type="date" value={f.agreementDate} onChange={set('agreementDate')} /></Field>
          <Field label="Start date" required error={errs.start}><Text type="date" value={f.start} onChange={set('start')} /></Field>
          <Field label="End date" required error={errs.end}><Text type="date" value={f.end} onChange={set('end')} /></Field>
          <Field label="Currency"><Select value={f.ccy} onChange={(v) => setF((s) => ({ ...s, ccy: v, fx: v === 'INR' ? '1' : s.fx }))} options={opts(['INR', 'USD', 'GBP', 'EUR'])} /></Field>
          <Field label="FX-locked rate" error={errs.fx} hint={inr ? 'INR grant — rate fixed at 1' : 'Rate locked at signing (₹ per unit)'}><Text type="number" value={inr ? '1' : f.fx} onChange={set('fx')} disabled={inr} /></Field>
          <Field label={`Total grant amount (${f.ccy})`} required error={errs.amount}><Text type="number" value={f.amount} onChange={set('amount')} placeholder="5000000" /></Field>
          <Field label="Approved by" hint="e.g. CFO · 20 Mar or CEO+Board · 18 Mar"><Text value={f.approved} onChange={set('approved')} placeholder="CFO · 20 Mar" /></Field>
          <Field label="Description" full><Area value={f.description} onChange={set('description')} placeholder="Scope / notes on the agreement" /></Field>
          <Field label="Agreement document" full hint="Reference to the signed PDF"><Text value={f.docPath} onChange={set('docPath')} placeholder="ZRY_GA_2026_015.pdf" /></Field>
        </div>
      </div>

      <div className="card">
        <h2>Tranche schedule</h2>
        <p className="cardsub">Scheduled receipts under this grant. Leave empty to add tranches later from the agreement page. Amounts are in the grant currency ({f.ccy}).</p>
        <RowList
          items={f.tranches} onChange={set('tranches')}
          blank={{ no: String(f.tranches.length + 1), exp: '', expDate: '', cond: '', gate: '', received: false }}
          addLabel="Add tranche"
          emptyText="No tranches scheduled yet."
          columns={[
            { key: 'no', label: '#', width: '52px', render: (r, on) => <input type="number" value={r.no} onChange={(e) => on(e.target.value)} /> },
            { key: 'exp', label: 'Expected amount', width: '140px', render: (r, on) => <input type="number" value={r.exp} placeholder="1000000" onChange={(e) => on(e.target.value)} /> },
            { key: 'expDate', label: 'Expected date', width: '150px', render: (r, on) => <input type="date" value={r.expDate} onChange={(e) => on(e.target.value)} /> },
            { key: 'gate', label: 'Gate %', width: '80px', render: (r, on) => <input type="number" value={r.gate} placeholder="75" onChange={(e) => on(e.target.value)} /> },
            { key: 'cond', label: 'Release condition', grow: true, render: (r, on) => <input value={r.cond} placeholder="e.g. ≥75% prior utilised + UC" onChange={(e) => on(e.target.value)} /> },
            { key: 'received', label: 'Received', width: '80px', render: (r, on) => <input type="checkbox" checked={r.received} onChange={(e) => on(e.target.checked)} style={{ width: 'auto' }} /> },
          ]} />
        <div className="formfoot">
          <span className="spacer">{editing ? 'Changes are saved to this agreement.' : 'A new agreement is added to the register.'}</span>
          <button className="btn ghost" onClick={() => go(editing ? 'grant' : 'grants', id)}>Cancel</button>
          <button className="btn dark" onClick={submit}>{editing ? 'Save changes' : 'Create grant'}</button>
        </div>
      </div>
    </>
  );
}
