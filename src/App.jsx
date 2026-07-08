/** Shell: rail navigation, top bar, routed view. */
import { AppProvider, useApp } from './store.jsx';
import { ModalProvider, ToastProvider } from './ui.jsx';
import { Dashboard } from './views/Dashboard.jsx';
import { DonorRegister, DonorDetail } from './views/Donors.jsx';
import { GrantList, GrantDetail } from './views/Grants.jsx';
import { useState } from 'react';

const NAV = [
  { label: 'Overview', items: [{ key: 'dashboard', idx: '00', label: 'Dashboard' }] },
  { label: 'Donor module', items: [
    { key: 'donors', idx: '01', label: 'Donor Register' },
    { key: 'grants', idx: '02', label: 'Grant Agreements' },
  ] },
];

function Shell() {
  const { route, go } = useApp();
  const [railOpen, setRailOpen] = useState(false);
  const current = (key) =>
    route.name === key ||
    (key === 'donors' && route.name === 'donor') ||
    (key === 'grants' && route.name === 'grant');

  return (
    <div className="frame">
      <aside className={`rail ${railOpen ? 'open' : ''}`}>
        <div className="brand"><h2>Zariya</h2><small>Donor Module · Master</small></div>
        <nav aria-label="Sections">
          {NAV.map((sec) => (
            <div key={sec.label}>
              <div className="navlabel">{sec.label}</div>
              <ul className="nav">
                {sec.items.map((it) => (
                  <li key={it.key}>
                    <button aria-current={current(it.key)} onClick={() => { go(it.key); setRailOpen(false); }}>
                      <span className="idx">{it.idx}</span><span>{it.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="railfoot">Donor Module v6 · Preview<br />A-PAG · TCF</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="burger" aria-label="Toggle navigation" onClick={() => setRailOpen((v) => !v)}>☰</button>
          <span className="demo-tag">Design preview · data from “Donor Module Master Workbook” (illustrative)</span>
          <div className="avatar">FO</div>
          <div className="who"><b>Accounts / Finance Officer</b><span>full edit · approver</span></div>
        </header>
        <main className="content" aria-live="polite">
          {route.name === 'dashboard' && <Dashboard />}
          {route.name === 'donors' && <DonorRegister />}
          {route.name === 'donor' && <DonorDetail id={route.id} />}
          {route.name === 'grants' && <GrantList />}
          {route.name === 'grant' && <GrantDetail id={route.id} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ModalProvider>
        <AppProvider>
          <Shell />
        </AppProvider>
      </ModalProvider>
    </ToastProvider>
  );
}
