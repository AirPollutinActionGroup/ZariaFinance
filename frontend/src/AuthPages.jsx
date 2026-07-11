import { useState } from "react";
import { signIn, signUp } from "./authService";
import { AuthFooter, AuthHeader } from "./components/AuthChrome";
import { SignInForm } from "./components/SignInForm";
import { SignUpForm } from "./components/SignUpForm";
import { AUTH_MODES } from "./constants";

export function AuthPages({ onAuthenticated }) {
  const [mode, setMode] = useState(AUTH_MODES.SIGN_IN);

  async function handleSignIn(values) {
    const result = await signIn(values);
    onAuthenticated?.(result.user);
    return result;
  }

  async function handleSignUp(values) {
    const result = await signUp(values);
    onAuthenticated?.(result.user);
    return result;
  }

  return (
    <div className="za-auth-shell">
      <div className="za-auth-left-rail" aria-hidden="true" />

      <div className="za-auth-main">
        <AuthHeader mode={mode} onModeChange={setMode} />

        <main className="za-auth-content">
          {mode === AUTH_MODES.SIGN_IN ? (
            <SignInForm
              onSubmit={handleSignIn}
              onSwitchToSignUp={() => setMode(AUTH_MODES.SIGN_UP)}
            />
          ) : (
            <SignUpForm
              onSubmit={handleSignUp}
              onSwitchToSignIn={() => setMode(AUTH_MODES.SIGN_IN)}
            />
          )}
        </main>

        <AuthFooter />
      </div>
    </div>
  );
}
