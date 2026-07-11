import { detailFieldSchema } from "./donorMappingData";
import { formatDateTime } from "./formatters";

function renderValue(donor, field) {
  const value = donor?.[field.key];

  if (field.type === "boolean") {
    return value ? "Yes" : "No";
  }

  if (field.type === "datetime") {
    return formatDateTime(value);
  }

  if (field.type === "email") {
    return value ? (
      <a className="drawer-link" href={`mailto:${value}`}>
        {value}
      </a>
    ) : (
      "-"
    );
  }

  if (field.type === "link") {
    return value ? (
      <a className="drawer-link" href={value} target="_blank" rel="noreferrer">
        Open MoU
      </a>
    ) : (
      "-"
    );
  }

  return value || "-";
}

export function DonorDetailDrawer({ donor, isOpen, onClose }) {
  return (
    <>
      <button
        className={`drawer-backdrop ${isOpen ? "open" : ""}`}
        type="button"
        aria-label="Close donor details"
        onClick={onClose}
      />
      <aside className={`drawer-panel ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <header className="drawer-header">
          <div>
            <p className="drawer-eyebrow">Donor Details</p>
            <h2>{donor?.donorName || "Select a donor"}</h2>
          </div>
          <button className="drawer-close" type="button" onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </header>

        {donor ? (
          <dl className="drawer-fields">
            {detailFieldSchema.map((field) => (
              <div key={field.key} className="drawer-field">
                <dt>{field.label}</dt>
                <dd>{renderValue(donor, field)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="drawer-empty">Select a row to view full donor profile.</p>
        )}
      </aside>
    </>
  );
}
