export function SelectField({ label, id, error, options, placeholder = "Select an option", ...selectProps }) {
  const errorId = `${id}-error`;

  return (
    <div className="za-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="za-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
