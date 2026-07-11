import { SIGN_IN_INITIAL_VALUES } from "../constants";
import { useAuthForm } from "../hooks/useAuthForm";
import { validateSignIn } from "../validation";
import { FormStatus } from "./FormStatus";
import { PasswordField } from "./PasswordField";
import { TextField } from "./TextField";

export function SignInForm({ onSubmit, onSwitchToSignUp }) {
  const { values, status, isSubmitting, handleChange, handleBlur, errorFor, handleSubmit } =
    useAuthForm({
      initialValues: SIGN_IN_INITIAL_VALUES,
      validate: validateSignIn,
      onSubmit
    });

  return (
    <form className="za-auth-form" onSubmit={handleSubmit} noValidate>
      <div className="za-form-heading">
        <h2>Welcome back</h2>
        <p>Sign in to your account</p>
      </div>

      <TextField
        label="Username"
        id="username"
        autoComplete="username"
        placeholder="Enter your username"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errorFor("username")}
      />

      <PasswordField
        label="Password"
        id="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errorFor("password")}
      />

      <div className="za-form-row">
        <label className="za-checkbox">
          <input
            type="checkbox"
            name="rememberMe"
            checked={values.rememberMe}
            onChange={handleChange}
          />
          <span>Remember me</span>
        </label>
        <button type="button" className="za-link-button">
          Forgot password?
        </button>
      </div>

      <button type="submit" className="za-primary-button" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <p className="za-switch-text">
        Don&apos;t have an account?{" "}
        <button type="button" className="za-link-button" onClick={onSwitchToSignUp}>
          Register
        </button>
      </p>

      <FormStatus status={status} />
    </form>
  );
}
