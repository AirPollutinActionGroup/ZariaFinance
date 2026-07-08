import { AUTH_MODES } from "../constants";

export function AuthHeader({ mode, onModeChange }) {
  return (
    <header className="za-auth-header">
      <div className="za-auth-brand">
        <div className="za-auth-logo" aria-hidden="true">
          Z
        </div>
        <div>
          <h1>Zariya</h1>
          <p>Secure donor operations portal</p>
        </div>
      </div>

      <div className="za-auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          className={mode === AUTH_MODES.SIGN_IN ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={mode === AUTH_MODES.SIGN_IN}
          onClick={() => onModeChange(AUTH_MODES.SIGN_IN)}
        >
          Sign in
        </button>
        <button
          className={mode === AUTH_MODES.SIGN_UP ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={mode === AUTH_MODES.SIGN_UP}
          onClick={() => onModeChange(AUTH_MODES.SIGN_UP)}
        >
          Sign up
        </button>
      </div>
    </header>
  );
}

export function AuthFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="za-auth-footer">
      <p>&copy; {year} Zariya. All rights reserved.</p>
    </footer>
  );
}
