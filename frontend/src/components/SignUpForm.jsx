import { ROLE_OPTIONS, SIGN_UP_INITIAL_VALUES } from "../constants";
import { useAuthForm } from "../hooks/useAuthForm";
import { useRoles } from "../hooks/useRoles";
import { validateSignUp } from "../validation";
import { FormStatus } from "./FormStatus";
import { PasswordField } from "./PasswordField";
import { SelectField } from "./SelectField";
import { TextField } from "./TextField";

export function SignUpForm({ onSubmit, onSwitchToSignIn }) {
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const { values, status, isSubmitting, handleChange, handleBlur, errorFor, handleSubmit } =
    useAuthForm({
      initialValues: SIGN_UP_INITIAL_VALUES,
      validate: validateSignUp,
      onSubmit
    });

  return (
    <form className="za-auth-form za-auth-form-wide" onSubmit={handleSubmit} noValidate>
      <div className="za-form-heading">
        <h2>Register user</h2>
        <p>Create a new account</p>
      </div>

      <div className="za-grid">
        <TextField
          label="First name"
          id="firstName"
          autoComplete="given-name"
          placeholder="Enter first name"
          value={values.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("firstName")}
        />
        <TextField
          label="Last name"
          id="lastName"
          autoComplete="family-name"
          placeholder="Enter last name"
          value={values.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("lastName")}
        />
        <TextField
          label="Email ID"
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Enter email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("email")}
        />
        <TextField
          label="Mobile no"
          id="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Enter mobile number"
          value={values.mobile}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("mobile")}
        />
        <TextField
          label="Username"
          id="username"
          autoComplete="username"
          placeholder="Choose username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("username")}
        />
        <SelectField
          label="Role"
          id="role"
          placeholder={rolesLoading ? "Loading roles..." : "Select role"}
          options={(roles.length ? roles : ROLE_OPTIONS).map((role) => ({
            value: role.value ?? role.name,
            label: role.label ?? role.name
          }))}
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("role")}
          disabled={rolesLoading || Boolean(rolesError)}
        />
        {rolesError ? <p className="za-field-error">{rolesError}</p> : null}
        <PasswordField
          label="Password"
          id="password"
          autoComplete="new-password"
          placeholder="Enter password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("password")}
        />
        <PasswordField
          label="Confirm password"
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorFor("confirmPassword")}
        />
      </div>

      <div className="za-form-actions">
        <p className="za-switch-text">
          Already have an account?{" "}
          <button type="button" className="za-link-button" onClick={onSwitchToSignIn}>
            Login
          </button>
        </p>
        <button type="submit" className="za-primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </div>

      <FormStatus status={status} />
    </form>
  );
}
