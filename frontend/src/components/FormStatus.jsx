export function FormStatus({ status }) {
  return (
    <div className="za-status-region" role="status" aria-live="polite">
      {status ? (
        <p className={`za-status-message za-status-${status.type}`}>{status.message}</p>
      ) : null}
    </div>
  );
}
