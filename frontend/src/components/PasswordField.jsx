import { useState } from "react";

export function PasswordField({ label, id, error, ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="za-field">
      <label htmlFor={id}>{label}</label>
      <div className="za-input-affix">
        <input
          id={id}
          name={id}
          type={isVisible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        <button
          type="button"
          className="za-affix-button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-pressed={isVisible}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p className="za-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
