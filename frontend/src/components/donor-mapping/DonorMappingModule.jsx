import { useEffect, useMemo, useState } from "react";
import { DonorDetailDrawer } from "./DonorDetailDrawer";
import { donorRecords } from "./donorMappingData";
import { formatCompactCroreFromLakhs, formatLakhs } from "./formatters";
import { RoleList } from "../RoleList";

function StatCard({ label, value, dark = false }) {
  return (
    <article className={`stat-card ${dark ? "stat-card-dark" : ""}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

function SideNav() {
  const budgetItems = ["Budget", "Forecast", "Actuals", "Variance"];
  const controlItems = ["Committed (Trading)", "Unassigned Funding", "Donor Mapping"];
  const insightItems = ["Optimiser", "Reports"];

  return (
    <aside className="dm-sidebar">
      <div className="dm-brand">
        <div className="dm-logo">Z</div>
        <div>
          <h1>Zariya</h1>
          <p>Budget · Trade · Report</p>
        </div>
      </div>

      <nav aria-label="Primary">
        <p className="dm-nav-heading">Dashboard</p>

        <p className="dm-nav-group">Core Layers</p>
        {budgetItems.map((item) => (
          <button key={item} className="dm-nav-item" type="button">
            {item}
          </button>
        ))}

        <p className="dm-nav-group">Control</p>
        {controlItems.map((item) => (
          <button
            key={item}
            className={`dm-nav-item ${item === "Donor Mapping" ? "active" : ""}`}
            type="button"
          >
            {item}
          </button>
        ))}

        <p className="dm-nav-group">Insight</p>
        {insightItems.map((item) => (
          <button key={item} className="dm-nav-item" type="button">
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function getInitials(name) {
  if (!name) {
    return "ZU";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "ZU";
}

function TopBar({ searchValue, onSearchChange, user, onSignOut }) {
  const displayName = user?.name || "Zariya User";
  const subtitle = user?.email || "A-PAG";

  return (
    <header className="dm-topbar">
      <input
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        className="dm-search"
        placeholder="Search donor name, donor code, source..."
        aria-label="Search donors"
      />
      <div className="dm-topbar-right">
        <div className="dm-user">
          <span className="dm-avatar">{getInitials(displayName)}</span>
          <div>
            <p className="dm-user-name">{displayName}</p>
            <p className="dm-user-subtitle">{subtitle}</p>
          </div>
        </div>
        {onSignOut ? (
          <button type="button" className="dm-signout" onClick={onSignOut}>
            Sign out
          </button>
        ) : null}
      </div>
    </header>
  );
}

function Allocation({ ratio }) {
  const normalized = Math.max(0, Math.min(100, ratio));
  const className = normalized < 80 ? "low" : "good";

  return (
    <div className="allocation-cell">
      <div className="allocation-track">
        <div className={`allocation-fill ${className}`} style={{ width: `${normalized}%` }} />
      </div>
      <span className={`allocation-label ${className}`}>{normalized.toFixed(0)}%</span>
    </div>
  );
}

function DomicilePill({ donor }) {
  if (donor.fcraApplicable) {
    return <span className="pill pill-foreign">Foreign · FCRA</span>;
  }

  return <span className="pill pill-domestic">Domestic</span>;
}

function FundTypePill({ fundType }) {
  return <span className="pill pill-fund">{fundType}</span>;
}

function DonorTable({ donors, selectedId, onSelect }) {
  return (
    <section className="dm-register-card">
      <div className="dm-card-header">
        <h2>Donor Register</h2>
        <p>Click on any donor row to open the right-side detail drawer.</p>
      </div>

      <div className="dm-table-wrap">
        <table className="dm-table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Domicile</th>
              <th>Fund Type</th>
              <th>Committed</th>
              <th>Received</th>
              <th>Allocation</th>
            </tr>
          </thead>
          <tbody>
            {donors.length === 0 ? (
              <tr>
                <td colSpan={6} className="dm-empty-table">
                  No donors matched the current search filter.
                </td>
              </tr>
            ) : (
              donors.map((donor) => {
              const allocation = donor.committedLakhs
                ? (donor.receivedLakhs / donor.committedLakhs) * 100
                : 0;

              return (
                <tr
                  key={donor.donorId}
                  className={selectedId === donor.donorId ? "selected" : ""}
                  onClick={() => onSelect(donor)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      onSelect(donor);
                    }
                  }}
                >
                  <td>
                    <p className="donor-name">{donor.donorName}</p>
                    <p className="donor-code">{donor.donorCode}</p>
                  </td>
                  <td>
                    <DomicilePill donor={donor} />
                  </td>
                  <td>
                    <FundTypePill fundType={donor.fundType} />
                  </td>
                  <td>{formatLakhs(donor.committedLakhs)}</td>
                  <td>{formatLakhs(donor.receivedLakhs)}</td>
                  <td>
                    <Allocation ratio={allocation} />
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DonorMappingModule({ user, onSignOut }) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState(null);

  const filteredDonors = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return donorRecords;
    }

    return donorRecords.filter((donor) =>
      [donor.donorName, donor.donorCode, donor.donorSource, donor.contactPerson]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchValue]);

  const selectedDonor =
    donorRecords.find((donor) => donor.donorId === selectedDonorId) || null;

  const summary = useMemo(() => {
    const donors = donorRecords.length;
    const totalCommittedLakhs = donorRecords.reduce((sum, item) => sum + item.committedLakhs, 0);
    const receivedLakhs = donorRecords.reduce((sum, item) => sum + item.receivedLakhs, 0);
    const pipelineGapLakhs = Math.max(totalCommittedLakhs - receivedLakhs, 0);

    return {
      donors,
      totalCommittedLakhs,
      receivedLakhs,
      pipelineGapLakhs
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedDonorId(null);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="dm-shell">
      <SideNav />
      <div className="dm-main-area">
        <TopBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          user={user}
          onSignOut={onSignOut}
        />

        <main className="dm-content">
          <section className="dm-title-row">
            <h2>Donor Agreements &amp; Mapping</h2>
            <p>Funding sources ↔ Budget lines · 100% mapping integrity required</p>
          </section>

          <section className="dm-stat-grid">
            <StatCard label="Donors" value={summary.donors} />
            <StatCard label="Total committed" value={formatCompactCroreFromLakhs(summary.totalCommittedLakhs)} />
            <StatCard label="Received YTD" value={formatCompactCroreFromLakhs(summary.receivedLakhs)} />
            <StatCard
              label="Pipeline gap"
              value={formatCompactCroreFromLakhs(summary.pipelineGapLakhs)}
              dark
            />
          </section>

          <RoleList />

          <DonorTable
            donors={filteredDonors}
            selectedId={selectedDonor?.donorId}
            onSelect={(donor) => setSelectedDonorId(donor.donorId)}
          />
        </main>
      </div>

      <DonorDetailDrawer
        donor={selectedDonor}
        isOpen={Boolean(selectedDonor)}
        onClose={() => setSelectedDonorId(null)}
      />
    </div>
  );
}
