/** Grant Agreements (list) + Grant detail — tabular; CCY·FX-lock and Approved-by live in the detail. */
import { useApp } from '../store.jsx';
import { P } from '../data.js';
import { gFig, priorUtilPct, druleOf, inr, money, dtf } from '../lib.js';
import { Chip, DonorStatusChip, FundClassChip, GrantStatusChip, KV, PageHead, useModal, useToast } from '../ui.jsx';

export function GrantList() {
  const { db, go, grantQ, setGrantQ, grantStatusF, setGrantStatusF } = useApp();
  const toast = useToast();
  const list = db.grants.filter(
    (g) =>
      (!grantStatusF || g.status === grantStatusF) &&
      (!grantQ || `${g.name} ${g.ref} ${db.donors.find((d) => d.id === g.donorId).name}`.toLowerCase().includes(grantQ.toLowerCase())),
  );
  return (
    <>
      <PageHead
        title="Grant Agreements"
        sub="Signed and pipeline agreements — committed, received, utilised and available per grant"
        right={<button className="btn dark" onClick={() => toast('Grant creation requires an Active donor with a confirmed fund profile')}>+ New grant</button>}
      />
      <div className="search">🔍<input placeholder="Search grants…" value={grantQ} onChange={(e) => setGrantQ(e.target.value)} aria-label="Search grants" /></div>
      {grantStatusF && (
        <div className="filterbar">
          Filtered by status: <GrantStatusChip status={grantStatusF} />
          <button className="btn sm ghost" onClick={() => setGrantStatusF('')}>Clear filter</button>
        </div>
      )}
      <div className="card">
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Agreement ref</th><th>Donor</th><th>Programme · tie</th><th className="money">Committed</th><th className="money">Received</th><th className="money">Utilised</th><th className="money">Available</th><th>Mode / class</th><th>Status</th></tr>
            </thead>
            <tbody>
              {list.length ? list.map((x) => {
                const f = gFig(x, db.tranches);
                const d = db.donors.find((dd) => dd.id === x.donorId);
                const fp = db.profiles.find((p) => p.id === x.fp);
                return (
                  <tr className="rowlink" key={x.id} onClick={() => go('grant', x.id)}>
                    <td><b>{x.ref}</b><span className="subcell">{d.name}</span></td>
                    <td>{d.name}{d.status !== 'Active' && <> <Chip label="Draft donor" tone="err" /></>}</td>
                    <td>
                      {fp.prog ? P(fp.prog).name : 'Core / unrestricted'}
                      <span className="subcell">{fp.tied ? <span style={{ color: 'var(--warn)' }}>tied</span> : fp.mode === 'Restricted' ? 'defined project' : 'not tied'}</span>
                    </td>
                    <td className="money">{inr(f.committedInr)}{x.ccy !== 'INR' && <span className="subcell">{money(x.amount, x.ccy)} · {x.ccy}</span>}</td>
                    <td className="money">{inr(f.receivedInr)}</td>
                    <td className="money">{inr(f.utilisedInr)}</td>
                    <td className="money">{x.status === 'Blocked' ? <span className="em">blocked</span> : inr(f.availableInr)}</td>
                    <td>
                      {fp.mode ? (
                        <>
                          <span style={{ fontSize: '10.5px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                            {fp.mode} · {fp.cls.split('·')[0]}
                          </span>{' '}
                          <FundClassChip fp={fp} />
                        </>
                      ) : <span className="em">DONOR DRAFT</span>}
                    </td>
                    <td><GrantStatusChip status={x.status} /></td>
                  </tr>
                );
              }) : <tr><td colSpan="9" style={{ color: 'var(--muted)' }}>No grants match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="note">
        <b>Register rules:</b> distinct agreement reference (never the donor name) · amounts shown in reporting INR
        (currency and FX-locked rate live inside each agreement's detail) · a grant whose donor is Draft is{' '}
        <b>Blocked</b> and its commitment is excluded from every total (system rule).
      </div>
    </>
  );
}

export function GrantDetail({ id }) {
  const { db, go, actions } = useApp();
  const modal = useModal();
  const toast = useToast();
  const x = db.grants.find((g) => g.id === id);
  if (!x) return <p>Not found</p>;
  const d = db.donors.find((dd) => dd.id === x.donorId);
  const fp = db.profiles.find((p) => p.id === x.fp);
  const dr = druleOf(x, db.drules);
  const f = gFig(x, db.tranches);
  const pend = f.trs.find((t) => t.status === 'Expected');
  const upct = priorUtilPct(x, db.tranches);
  const gateOk = pend && pend.gate ? upct >= pend.gate : true;
  const denom = f.committedInr || 1;

  const recordUtilisation = async () => {
    const room = f.receivedInr - x.utilisedInr;
    if (room <= 0) { toast('Nothing left to utilise — all received funds are spent'); return; }
    const r = await modal.ask({
      kind: 'confirm',
      title: 'Record utilisation',
      body: <>Enter the amount spent against this grant's received funds (user-defined; in production this posts automatically from the Actuals module). Unspent received: <b style={{ color: 'var(--ink)' }}>{inr(room)}</b>.</>,
      okLabel: 'Record',
      input: { type: 'number', max: Math.floor(room), placeholder: 'Amount in ₹' },
    });
    if (!r.ok) return;
    const raw = Number(r.value || 0);
    if (!raw || raw <= 0) { toast('No amount entered — nothing recorded'); return; }
    const add = Math.min(room, raw);
    actions.recordUtilisation(x.id, add);
    toast(`Recorded ${inr(add)} utilisation`);
  };

  const releaseTranche = async () => {
    if (!pend) return;
    if (pend.gate && upct < pend.gate) {
      await modal.ask({
        kind: 'info',
        title: 'Release blocked by disbursement rule',
        body: <>Tranche {pend.no} requires ≥{pend.gate}% utilisation of the prior tranche{dr && dr.milestone ? ' plus an accepted milestone / UC' : ''}. Current utilisation: <b style={{ color: 'var(--ink)' }}>{Math.round(upct)}%</b>. Record more utilisation first.</>,
      });
      return;
    }
    const r = await modal.ask({
      kind: 'confirm',
      title: `Release tranche ${pend.no}`,
      body: <>{pend.cond}. Receipt of <b style={{ color: 'var(--ink)' }}>{money(pend.exp, x.ccy)}</b>{x.ccy !== 'INR' ? ` (= ${inr(pend.exp * x.fx)} at the locked rate)` : ''} will be recognised{d.fcra ? ' into the designated FCRA account' : ''}.</>,
      okLabel: 'Record receipt',
    });
    if (r.ok) { actions.releaseTranche(x.id); toast(`Tranche ${pend.no} received — chain updated`); }
  };

  return (
    <>
      <button className="backlink" onClick={() => go('grants')}>← Grant Agreements</button>
      <PageHead title={x.ref} sub={x.name} right={<GrantStatusChip status={x.status} />} />

      {x.status === 'Blocked' && (
        <div className="exc err">
          <div>
            <b>Blocked — donor record is Draft</b>
            <p>{d.name} has not completed onboarding, so this agreement cannot become Active and holds zero committed amount in the totals. Complete the donor gate to unblock.</p>
          </div>
          <button className="btn sm ghost" style={{ flex: 'none', marginLeft: 'auto' }} onClick={() => go('donor', d.id)}>Open donor →</button>
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <h2>Agreement terms</h2>
          <KV rows={[
            ['Donor', `${d.name} (${d.code})`],
            ['Programme', fp.prog ? `${P(fp.prog).code} — ${P(fp.prog).name}` : 'Core / unrestricted'],
            ['Period', `${dtf(x.start)} → ${dtf(x.end)}`],
            ['Currency (CCY)', x.ccy],
            ['FX-locked rate (at signing)', x.fx !== 1 ? `₹${x.fx.toFixed(2)} per ${x.ccy}` : '— (INR grant)'],
            ['Total grant amount', money(x.amount, x.ccy)],
            ['Reporting amount (INR)', inr(f.committedInr)],
            ['Approved by', x.approved],
            ['Status', <GrantStatusChip status={x.status} />],
          ]} />
        </div>
        <div className="card">
          <h2>Funding position</h2>
          <div className="tablewrap">
            <table>
              <thead><tr><th>Stage</th><th className="money">Amount (INR)</th><th>Basis</th></tr></thead>
              <tbody>
                <tr><td>Committed</td><td className="money">{inr(f.committedInr)}</td><td style={{ whiteSpace: 'normal', color: 'var(--muted)' }}>contracted / signed (receivable)</td></tr>
                <tr><td>Received</td><td className="money">{inr(f.receivedInr)}</td><td style={{ whiteSpace: 'normal', color: 'var(--muted)' }}>{f.trs.filter((t) => t.status === 'Received').length} of {f.trs.length || 0} tranches recognised</td></tr>
                <tr><td>Utilised</td><td className="money">{inr(f.utilisedInr)}</td><td style={{ whiteSpace: 'normal', color: 'var(--muted)' }}>{Math.round((100 * f.utilisedInr) / denom)}% of committed · spent against budget lines</td></tr>
                <tr><td><b>Available (realised)</b></td><td className="money" style={{ color: 'var(--ok)' }}><b>{x.status === 'Blocked' ? '—' : inr(f.availableInr)}</b></td><td style={{ whiteSpace: 'normal', color: 'var(--muted)' }}>received − utilised · spendable now</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Inherited fund profile</h2>
          <KV rows={[
            ['Fund class', <FundClassChip fp={fp} />],
            ['Fund mode', fp.mode || <span className="em">unconfirmed (donor draft)</span>],
            ['FCRA', d.fcra ? `Applicable — receipts into ${d.bankRef}` : 'Not applicable'],
            ['Purpose', fp.purpose],
            ['Overhead cap', fp.overhead ? `${fp.overhead}%` : '—'],
            ['Reporting frequency', fp.freq || '—'],
          ]} />
        </div>
        <div className="card">
          <h2>Disbursement rule</h2>
          <KV rows={[
            ['Type', dr ? dr.type : '—'],
            ['Trigger', dr ? dr.trigger : '—'],
            ['Gate', dr && dr.minUtil ? `≥${dr.minUtil}% prior-tranche utilisation${dr.milestone ? ' + milestone / UC' : ''}` : 'Unconditional'],
            dr && dr.type === 'Tranche-on-UC' && [
              'UC type (per donor requirement)',
              <select
                value={dr.ucType || 'Management UC'}
                onChange={(e) => { actions.setUcType(dr.id, e.target.value); toast(`UC type set to ${e.target.value} — this certificate now gates each tranche release`); }}
                style={{ font: 'inherit', fontSize: '12.5px', padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 7, background: 'var(--card)', color: 'var(--ink)' }}
              >
                <option>Management UC</option>
                <option>Audit UC</option>
              </select>,
            ],
          ]} />
          {pend && pend.gate ? (
            <div className="pad" style={{ paddingTop: 12 }}>
              <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--muted)' }}>
                Gate check — utilisation of last received tranche
              </div>
              <div className="meter" role="img" aria-label={`${Math.round(upct)}% utilised of ${pend.gate}% required`}>
                <i style={{ width: `${Math.min(100, upct)}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--muted)', marginTop: 3 }}>
                <span><b style={{ color: gateOk ? 'var(--ok)' : 'var(--err)' }}>{Math.round(upct)}%</b> utilised</span>
                <span>gate {pend.gate}%</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button className="btn sm ghost" onClick={recordUtilisation}>Record utilisation…</button>
                <button className={`btn sm ${gateOk ? 'ok' : 'ghost'}`} disabled={x.status === 'Blocked'} onClick={releaseTranche}>Release tranche {pend.no}</button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 7 }}>
                Utilisation normally flows in from the Actuals module; manual entry here is user-defined (any amount up
                to unspent received funds). The release threshold ({pend.gate}%) comes from this donor's disbursement rule.
              </div>
            </div>
          ) : pend ? (
            <div className="pad" style={{ paddingTop: 12 }}>
              <button className="btn sm ok" onClick={releaseTranche}>Record receipt — tranche {pend.no}</button>
            </div>
          ) : (
            <div className="pad" style={{ paddingTop: 12, color: 'var(--muted)', fontSize: 12 }}>All scheduled tranches received.</div>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Tranche schedule</h2>
        <div className="tablewrap">
          <table>
            <thead><tr><th>#</th><th className="money">Expected</th><th>Expected date</th><th className="money">Actual</th><th>Actual date</th><th>Release condition</th><th>Gate</th><th>Status</th></tr></thead>
            <tbody>
              {f.trs.length ? f.trs.map((t) => (
                <tr key={t.id}>
                  <td>{t.no}</td>
                  <td className="money">{money(t.exp, x.ccy)}</td>
                  <td>{dtf(t.expDate)}</td>
                  <td className="money">{t.act ? money(t.act, x.ccy) : '—'}</td>
                  <td>{dtf(t.actDate)}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 240, color: 'var(--muted)' }}>{t.cond}</td>
                  <td>{t.gate ? `${t.gate}%` : '—'}</td>
                  <td>{t.status === 'Received' ? <Chip label="Received" tone="ok" /> : <Chip label="Expected" tone="warn" />}</td>
                </tr>
              )) : <tr><td colSpan="8" style={{ color: 'var(--muted)' }}>No tranche schedule (blocked pending donor onboarding).</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
