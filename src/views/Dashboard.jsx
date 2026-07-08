/** Dashboard — every clickable opens an in-place pop-up; nothing navigates away. */
import { useApp } from '../store.jsx';
import { gFig, totals, inr, statusClash } from '../lib.js';
import { P, FEEDBACK } from '../data.js';
import { useModal, MiniDonors, MiniGrants, GrantStatusChip, DonorStatusChip, KV, PageHead } from '../ui.jsx';
import { dtf, money } from '../lib.js';

const STAGES = {
  committed: { t: 'Committed — contracted / signed (receivable)', d: 'Money donors have contractually promised across signed agreements. A commitment is a promise, not income.', col: 'Committed (INR)', of: (f) => f.committedInr, filter: (f) => true },
  received: { t: 'Received — cash in bank, income recognised', d: "Tranches actually received at each grant's FX-locked rate.", col: 'Received (INR)', of: (f) => f.receivedInr, filter: (f) => f.receivedInr > 0 },
  utilised: { t: 'Utilised — spent against budget lines', d: 'Spend recorded against received funds (posts from Actuals in production).', col: 'Utilised (INR)', of: (f) => f.utilisedInr, filter: (f) => f.utilisedInr > 0 },
  available: { t: 'Available — received − utilised', d: 'The realised, spendable balance per grant right now.', col: 'Available (INR)', of: (f) => f.availableInr, filter: (f) => f.availableInr > 0 },
  open: { t: 'Open / outstanding — committed, not yet received', d: 'The receivable pipeline still expected from donors.', col: 'Outstanding (INR)', of: (f) => f.outstandingInr, filter: (f) => f.outstandingInr > 0.5 },
};

export function Dashboard() {
  const { db, go, setDonorStatusF, setGrantStatusF, setDonorQ, setGrantQ } = useApp();
  const modal = useModal();
  const { donors, grants, tranches, profiles } = db;

  const t = totals(grants, tranches);
  const activeDonors = donors.filter((d) => d.status === 'Active').length;
  const draftDonors = donors.filter((d) => d.status === 'Draft');
  const gc = {
    active: grants.filter((x) => x.status === 'Active').length,
    closed: grants.filter((x) => x.status === 'Closed').length,
    blocked: grants.filter((x) => x.status === 'Blocked').length,
  };
  const clash = statusClash(grants, donors);
  const denom = t.committed + t.blocked;
  const seg = (v) => (denom ? (100 * v) / denom : 0);
  const recent = grants.filter((x) => x.status !== 'Closed').slice(0, 6);

  const popDonors = (filter) => {
    const list = filter === 'all' ? donors : donors.filter((d) => d.status === filter);
    modal.ask({
      kind: 'pop',
      title: filter === 'all' ? `All donors (${list.length})` : `${filter} donors (${list.length})`,
      body: <MiniDonors list={list} profiles={profiles} />,
      alt: { label: 'Open Donor Register →', go: () => { setDonorStatusF(filter === 'all' ? '' : filter); setDonorQ(''); go('donors'); } },
    });
  };
  const popGrants = (filter) => {
    const list = filter === 'all' ? grants : grants.filter((g) => g.status === filter);
    modal.ask({
      kind: 'pop',
      title: filter === 'all' ? `All grant agreements (${list.length})` : `${filter} grant agreements (${list.length})`,
      body: <MiniGrants list={list} donors={donors} amtLabel="Committed (INR)" amtOf={(x) => gFig(x, tranches).committedInr} />,
      alt: { label: 'Open Grant Agreements →', go: () => { setGrantStatusF(filter === 'all' ? '' : filter); setGrantQ(''); go('grants'); } },
    });
  };
  const popStage = (stage) => {
    const cfg = stage === 'blocked'
      ? { t: 'Blocked — draft donor', d: 'Commitments held against donors that have not completed onboarding; excluded from every total until the donor is Active.', col: 'Committed (INR)', of: (f) => f.committedInr, list: grants.filter((g) => g.status === 'Blocked') }
      : { ...STAGES[stage], list: grants.filter((g) => g.status !== 'Blocked').filter((g) => STAGES[stage].filter(gFig(g, tranches))) };
    const total = cfg.list.reduce((s, x) => s + cfg.of(gFig(x, tranches)), 0);
    modal.ask({
      kind: 'pop',
      title: cfg.t,
      body: (
        <>
          <p style={{ margin: '0 0 10px' }}>{cfg.d} Total: <b style={{ color: 'var(--ink)' }}>{inr(total)}</b>.</p>
          <MiniGrants list={cfg.list} donors={donors} amtLabel={cfg.col} amtOf={(x) => cfg.of(gFig(x, tranches))} />
        </>
      ),
      alt: { label: 'Open Grant Agreements →', go: () => { setGrantStatusF(''); setGrantQ(''); go('grants'); } },
    });
  };
  const popGrantSummary = (x) => {
    const f = gFig(x, tranches);
    const d = donors.find((dd) => dd.id === x.donorId);
    const fp = profiles.find((p) => p.id === x.fp);
    modal.ask({
      kind: 'pop',
      title: x.ref,
      body: (
        <KV rows={[
          ['Donor', `${d.name} (${d.code})`],
          ['Programme', fp.prog ? P(fp.prog).code : 'Core / unrestricted'],
          ['Period', `${dtf(x.start)} → ${dtf(x.end)}`],
          ['Committed', `${inr(f.committedInr)}${x.ccy !== 'INR' ? ` (${money(x.amount, x.ccy)} @ ₹${x.fx.toFixed(2)})` : ''}`],
          ['Received', inr(f.receivedInr)],
          ['Utilised', inr(f.utilisedInr)],
          ['Available (realised)', x.status === 'Blocked' ? '—' : inr(f.availableInr)],
          ['Status', <GrantStatusChip status={x.status} />],
        ]} />
      ),
      alt: { label: 'Open full agreement →', go: () => go('grant', x.id) },
    });
  };

  const Link = ({ onClick, children, style }) => (
    <span className="linkish" role="button" tabIndex={0} style={style}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
      {children}
    </span>
  );

  return (
    <>
      <PageHead title="Dashboard" sub="Live donor-module position · click any number, status or chain stage for a quick look — nothing leaves this page" />

      {clash && FEEDBACK.filter((f) => f.no === 1).map((f) => (
        <div className="exc err" key={f.no}>
          <div>
            <b>Exception · {f.cat} ({f.pri})</b>
            <p>{f.issue} <u>System rule:</u> {f.validation}.</p>
          </div>
          <button className="btn sm ghost" style={{ flex: 'none', marginLeft: 'auto' }} onClick={() => popGrants('Blocked')}>View blocked grant</button>
        </div>
      ))}

      <div className="kpis">
        <div className="kpi">
          <div className="lab">Donors</div>
          <div className="val"><Link onClick={() => popDonors('all')}>{donors.length}</Link></div>
          <div className="hint">
            <span className="dot" style={{ background: 'var(--ok)' }} />
            <b><Link onClick={() => popDonors('Active')}>{activeDonors} active</Link></b>
            {draftDonors.length > 0 && <> · <Link onClick={() => popDonors('Draft')}>{draftDonors.length} draft</Link> <span style={{ color: 'var(--err)' }}>(blocking {inr(t.blocked)})</span></>}
          </div>
        </div>
        <div className="kpi">
          <div className="lab">Grant agreements</div>
          <div className="val"><Link onClick={() => popGrants('all')}>{grants.length}</Link></div>
          <div className="hint">
            <span className="dot" style={{ background: 'var(--ok)' }} />
            <Link onClick={() => popGrants('Active')}>{gc.active} active</Link> · <Link onClick={() => popGrants('Closed')}>{gc.closed} closed</Link>
            {gc.blocked > 0 && <> · <Link style={{ color: 'var(--err)' }} onClick={() => popGrants('Blocked')}>{gc.blocked} blocked</Link></>}
          </div>
        </div>
        <div className="kpi">
          <div className="lab">Funding committed (receivable)</div>
          <div className="val"><Link onClick={() => popStage('committed')}>{inr(t.committed)}</Link></div>
          <div className="hint"><Link onClick={() => popStage('open')}>outstanding pipeline</Link> · not yet income</div>
        </div>
        <div className="kpi">
          <div className="lab">Available (unspent, realised)</div>
          <div className="val" style={{ color: 'var(--ok)' }}><Link onClick={() => popStage('available')}>{inr(t.available)}</Link></div>
          <div className="hint">received − utilised · <Link onClick={() => popStage('utilised')}>see utilisation</Link></div>
        </div>
      </div>

      <div className="card">
        <h2>The funding chain</h2>
        <p className="cardsub">Every grant moves through four states. A commitment is a promise, not income; only received money can be utilised.</p>
        <div className="chain">
          {[
            ['committed', 'Committed', inr(t.committed), 'contracted / signed (receivable)', null],
            ['received', 'Received', inr(t.received), 'cash in bank → income recognised', null],
            ['utilised', 'Utilised', inr(t.utilised), 'spent against budget lines', null],
            ['available', 'Available', inr(t.available), 'received − utilised', 'var(--ok)'],
          ].map(([key, lab, val, des, color]) => (
            <div className="step clk" key={key} role="button" tabIndex={0}
              onClick={() => popStage(key)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); popStage(key); } }}>
              <div className="lab">{lab}</div>
              <div className="val" style={color ? { color } : undefined}>{val}</div>
              <div className="des">{des}</div>
            </div>
          ))}
        </div>
        <div className="chainbar" role="img" aria-label={`Received ${inr(t.received)}, open ${inr(t.open)}, blocked ${inr(t.blocked)}`}>
          <i style={{ width: `${seg(t.received)}%`, background: 'var(--chain-recv)' }} />
          <i style={{ width: `${seg(t.open)}%`, background: 'var(--chain-open)' }} />
          <i style={{ width: `${seg(t.blocked)}%`, background: 'var(--chain-block)' }} />
        </div>
        <div className="legend">
          <Link onClick={() => popStage('received')}><span className="dot" style={{ background: 'var(--chain-recv)' }} /><b>Received {inr(t.received)}</b> ({Math.round(seg(t.received))}%)</Link>
          <Link onClick={() => popStage('open')}><span className="dot" style={{ background: 'var(--chain-open)' }} />Open / outstanding <b>{inr(t.open)}</b></Link>
          {t.blocked > 0 && <Link onClick={() => popStage('blocked')}><span className="dot" style={{ background: 'var(--chain-block)' }} />Blocked (draft donor) <b>{inr(t.blocked)}</b> — excluded from open</Link>}
        </div>
        <div className="duo" style={{ gridTemplateColumns: '1fr' }}>
          <div className="box"><b>Funding committed (receivable) — income side.</b> Money donors have contractually promised. Sits in the trading / committed layer as pipeline; becomes income only when received.</div>
        </div>
      </div>

      <div className="card">
        <h2>Recent grant agreements</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Agreement</th><th>Donor</th><th>Programme</th><th className="money">Committed</th><th className="money">Received</th><th className="money">Available</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recent.map((x) => {
                const f = gFig(x, tranches);
                const d = donors.find((dd) => dd.id === x.donorId);
                const fp = profiles.find((p) => p.id === x.fp);
                return (
                  <tr className="rowlink" key={x.id} onClick={() => popGrantSummary(x)}>
                    <td>{x.ref}<span className="subcell">{x.name.split(' : ')[0].split(' — ')[0]}</span></td>
                    <td>{d.name}{d.status !== 'Active' && <> <DonorStatusChip donor={d} /></>}</td>
                    <td>{fp.prog ? P(fp.prog).code : <span className="emq">untied</span>}</td>
                    <td className="money">{inr(f.committedInr)}</td>
                    <td className="money">{inr(f.receivedInr)}</td>
                    <td className="money">{x.status === 'Blocked' ? <span className="em">blocked</span> : inr(f.availableInr)}</td>
                    <td><GrantStatusChip status={x.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
