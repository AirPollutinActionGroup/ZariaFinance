export function TextField({ label, id, type = "text", error, ...inputProps }) {
  const errorId = `${id}-error`;

  return (
    <div className="za-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error ? (
        <p className="za-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
