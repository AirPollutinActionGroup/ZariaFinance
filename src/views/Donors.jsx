/** Donor Register (list) + Donor detail — consolidated master data, tabular. */
import { useApp } from '../store.jsx';
import { P } from '../data.js';
import { gFig, inr, money, dtf } from '../lib.js';
import { Chip, DonorStatusChip, FundClassChip, GrantStatusChip, KV, PageHead, useModal, useToast } from '../ui.jsx';

export function DonorRegister() {
  const { db, go, donorQ, setDonorQ, donorStatusF, setDonorStatusF } = useApp();
  const toast = useToast();
  const list = db.donors.filter(
    (d) =>
      (!donorStatusF || d.status === donorStatusF) &&
      (!donorQ || `${d.name} ${d.code} ${d.type} ${d.source}`.toLowerCase().includes(donorQ.toLowerCase())),
  );
  return (
    <>
      <PageHead
        title="Donor Register"
        sub="One consolidated register — programme and fund-profile attributes folded in; click a donor for the full profile"
        right={<button className="btn dark" onClick={() => go('donor-new')}>+ Register donor</button>}
      />
      <div className="search">🔍<input placeholder="Search donors…" value={donorQ} onChange={(e) => setDonorQ(e.target.value)} aria-label="Search donors" /></div>
      {donorStatusF && (
        <div className="filterbar">
          Filtered by status: <Chip label={donorStatusF} tone={donorStatusF === 'Active' ? 'ok' : 'err'} />
          <button className="btn sm ghost" onClick={() => setDonorStatusF('')}>Clear filter</button>
        </div>
      )}
      <div className="card">
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Donor code</th><th>Donor name</th><th>Source</th><th>Donor type</th><th>Domicile</th><th>Fund mode</th><th>Fund class</th><th>FCRA</th><th>Programme tie</th><th>Status</th></tr>
            </thead>
            <tbody>
              {list.length ? list.map((d) => {
                const fp = db.profiles.find((f) => f.donorId === d.id);
                return (
                  <tr className="rowlink" key={d.id} onClick={() => go('donor', d.id)}>
                    <td>{d.code}</td>
                    <td><b>{d.name}</b></td>
                    <td>{d.source}</td>
                    <td>{d.type}</td>
                    <td>{d.domicile}</td>
                    <td>{fp && fp.mode ? <Chip label={fp.mode} tone={fp.mode === 'Restricted' ? 'warn' : 'mut'} /> : <span className="em">— not set</span>}</td>
                    <td><FundClassChip fp={fp} /></td>
                    <td>{d.fcra ? <Chip label="FCRA ✓" tone="warn" /> : d.status === 'Draft' ? <span className="em">tbc</span> : '—'}</td>
                    <td>{fp && fp.tied ? <Chip label={P(fp.prog).code} tone="warn" /> : '—'}</td>
                    <td><DonorStatusChip donor={d} /></td>
                  </tr>
                );
              }) : <tr><td colSpan="10" style={{ color: 'var(--muted)' }}>No donors match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="note">
        <b>Register rules:</b> the list carries only these ten columns; everything else about a donor — contact &amp;
        statutory details, purpose, geographies, utilisation &amp; disbursement rules, documents, audit dates and its
        grants — lives in the donor profile (click the row), captured once with no duplication. Domicile
        (Foreign/Domestic) is separate from fund mode (Restricted/Unrestricted); FCRA attaches to domicile. Press the{' '}
        <b>ⓘ</b> beside any fund class for its behaviour rules.
      </div>
    </>
  );
}

export function DonorDetail({ id }) {
  const { db, go, actions } = useApp();
  const modal = useModal();
  const toast = useToast();
  const d = db.donors.find((x) => x.id === id);
  if (!d) return <p>Not found</p>;
  const fp = db.profiles.find((f) => f.donorId === d.id);
  const geos = fp ? db.geos.filter((g) => g.fp === fp.id) : [];
  const ur = fp ? db.urules.filter((r) => r.fp === fp.id) : [];
  const dr = fp ? db.drules.find((r) => r.fp === fp.id) : null;
  const gs = db.grants.filter((g) => g.donorId === d.id);
  const ob = d.onboarding;

  const obChecks = ob ? [
    ['Fund mode confirmed (Restricted / Unrestricted)', ob.fundMode, 'fundMode'],
    ['Fund class confirmed (A / B / C)', ob.fundClass, 'fundClass'],
    ['PAN captured', ob.pan, 'pan'],
    ['Bank account reference mapped', ob.bankRef, 'bankRef'],
  ] : [];
  const fieldsDone = ob ? obChecks.every((c) => c[1]) : true;

  const CAPTURE_COPY = {
    fundMode: ['Confirm fund mode', 'Nimbus funds confirmed as Restricted (CSR, defined project).'],
    fundClass: ['Confirm fund class', 'Typology review resolves Nimbus to Class A — fully restricted.'],
    pan: ['Capture PAN', 'PAN AAECG1014K verified against the CSR registration.'],
    bankRef: ['Map bank account', 'Domestic receipts mapped to DOM-CA-1001.'],
  };
  const capture = async (key) => {
    const r = await modal.ask({ kind: 'confirm', title: CAPTURE_COPY[key][0], body: CAPTURE_COPY[key][1], okLabel: 'Capture' });
    if (r.ok) { actions.captureOnboarding(d.id, key); toast('Captured — gate re-evaluated'); }
  };
  const approve = async () => {
    const r = await modal.ask({ kind: 'confirm', title: 'Finance approval', body: `CFO approves activation of ${d.name}. All mandatory attributes are complete.`, okLabel: 'Approve' });
    if (r.ok) { actions.approveFinance(d.id); toast('Finance approval recorded'); }
  };
  const activate = async () => {
    const r = await modal.ask({ kind: 'confirm', title: 'Activate donor', body: `${d.name} becomes Active. Its blocked grant (₹1.00 Cr) becomes eligible for activation and re-enters the totals.`, okLabel: 'Activate' });
    if (r.ok) { actions.activateDonor(d.id); toast('Donor Active — grant unblocked; dashboard totals updated'); }
  };

  return (
    <>
      <button className="backlink" onClick={() => go('donors')}>← Donor Register</button>
      <PageHead title={d.name} sub={d.code}
        right={<div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>{fp && <FundClassChip fp={fp} />}<DonorStatusChip donor={d} /><button className="btn ghost sm" onClick={() => go('donor-edit', d.id)}>Edit</button></div>} />

      {ob && (
        <div className="card">
          <h2>Onboarding gate</h2>
          <p className="cardsub">“Activate” stays disabled until every mandatory attribute is captured; completion routes to Finance approval; only then Active; only then grants are allowed.</p>
          <div className="tablewrap">
            <table>
              <thead><tr><th>Requirement</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {obChecks.map(([label, done, key]) => (
                  <tr key={key}>
                    <td style={{ whiteSpace: 'normal' }}>{label}</td>
                    <td>{done ? <Chip label="Complete" tone="ok" /> : <Chip label="Missing" tone="err" />}</td>
                    <td>{done ? '—' : <button className="btn sm ghost" onClick={() => capture(key)}>Capture</button>}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ whiteSpace: 'normal' }}>Finance / CFO approval</td>
                  <td>{ob.financeApproved ? <Chip label="Approved" tone="ok" /> : <Chip label="Pending" tone="warn" />}</td>
                  <td>{ob.financeApproved ? '—' : (
                    <button className={`btn sm ${fieldsDone ? 'ok' : 'ghost'}`} disabled={!fieldsDone} onClick={approve}>
                      {fieldsDone ? 'Approve (CFO)' : 'Blocked — fields incomplete'}
                    </button>
                  )}</td>
                </tr>
                <tr>
                  <td style={{ whiteSpace: 'normal' }}><b>Activate donor</b> — unblocks this donor's grant and re-enters totals</td>
                  <td><DonorStatusChip donor={d} /></td>
                  <td><button className="btn sm dark" disabled={!ob.financeApproved} onClick={activate}>Activate</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <h2>Contact &amp; statutory</h2>
          <KV rows={[
            ['Contact person', d.contact],
            ['Email', d.email],
            ['Phone', d.phone],
            d.website ? ['Website', d.website] : null,
            d.registrationNumber ? ['Registration no.', d.registrationNumber] : null,
            ['Address', d.address],
            ['PAN', d.pan || <span className="em">missing</span>],
            ['Bank account ref', d.bankRef || <span className="em">missing</span>],
            ['Foreign fund source', d.fcra ? `${d.foreignType} · ${d.country} · designated FCRA a/c` : 'Not applicable (domestic)'],
            ['MoU', d.mou || 'Not on file'],
            ['Created / updated', `${dtf(d.createdAt)} · ${dtf(d.updatedAt)}`],
          ]} />
        </div>
        <div className="card">
          <h2>Fund profile &amp; programme</h2>
          {fp ? (
            <KV rows={[
              ['Purpose', fp.purpose],
              ['Programme', fp.prog ? `${P(fp.prog).code} — ${P(fp.prog).name}` : <i>untied, not yet tagged</i>],
              fp.prog && ['Programme description', <span style={{ color: 'var(--muted)' }}>{P(fp.prog).desc}</span>],
              ['Reporting frequency', fp.freq || '—'],
              ['Admin / overhead cap', fp.adminAllowed === null ? '—' : fp.adminAllowed ? `Yes${fp.overhead ? ` · ${fp.overhead}% cap` : ''}` : 'No'],
              ['Movement / explanation', `${fp.movement ? 'Allowed' : 'Blocked'}${fp.explain ? ' · explanation required' : ''}`],
              ['Geographies', geos.map((g) => g.geo).join(' · ') || '—'],
            ]} />
          ) : <div className="pad">No fund profile.</div>}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Utilisation rules</h2>
          {ur.length ? (
            <div className="tablewrap">
              <table>
                <thead><tr><th>Rule</th><th>Type</th><th className="money">Limit %</th><th>Description</th></tr></thead>
                <tbody>
                  {ur.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.type}</td><td className="money">{r.pct}%</td>
                      <td style={{ whiteSpace: 'normal', minWidth: 220, color: 'var(--muted)' }}>{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="pad" style={{ color: 'var(--muted)' }}>No quantitative caps — fully unrestricted.</div>}
        </div>
        <div className="card">
          <h2>Disbursement rule</h2>
          {dr ? (
            <KV rows={[
              ['Rule type', dr.type],
              ['Release trigger', dr.trigger],
              ['Min prior utilisation', dr.minUtil ? `${dr.minUtil}%` : '—'],
              ['Milestone / UC required', dr.milestone ? 'Yes' : 'No'],
              dr.ucType && ['UC type', dr.ucType],
              ['Description', <span style={{ color: 'var(--muted)' }}>{dr.desc}</span>],
            ]} />
          ) : <div className="pad">—</div>}
        </div>
      </div>

      <div className="card">
        <h2>Grant agreements</h2>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Agreement</th><th>Period</th><th className="money">Committed</th><th className="money">Received</th><th className="money">Utilised</th><th className="money">Available</th><th>Status</th></tr></thead>
            <tbody>
              {gs.length ? gs.map((x) => {
                const f = gFig(x, db.tranches);
                return (
                  <tr className="rowlink" key={x.id} onClick={() => go('grant', x.id)}>
                    <td>{x.ref}</td>
                    <td>{dtf(x.start)} → {dtf(x.end)}</td>
                    <td className="money">{inr(f.committedInr)}{x.ccy !== 'INR' && <span className="subcell">{money(x.amount, x.ccy)} · {x.ccy}</span>}</td>
                    <td className="money">{inr(f.receivedInr)}</td>
                    <td className="money">{inr(f.utilisedInr)}</td>
                    <td className="money">{x.status === 'Blocked' ? <span className="em">blocked</span> : inr(f.availableInr)}</td>
                    <td><GrantStatusChip status={x.status} /></td>
                  </tr>
                );
              }) : <tr><td colSpan="7" style={{ color: 'var(--muted)' }}>No grants.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
