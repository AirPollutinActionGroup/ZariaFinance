const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const ROLES_URL = `${API_BASE_URL}/api/roles`;

function normalizeRoles(rawRoles) {
  if (!Array.isArray(rawRoles)) {
    return [];
  }

  return rawRoles
    .map((role) => {
      const value = role?.value || role?.name || role?.roleName || role?.id;
      const label = role?.label || role?.name || role?.roleName || role?.value || role?.id;

      if (!value && !label) {
        return null;
      }

      return {
        value: String(value ?? label),
        label: String(label ?? value)
      };
    })
    .filter(Boolean);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.detail || "Request failed.";
    throw new Error(message);
  }

  return payload;
}

export async function signIn(credentials) {
  const payload = await requestJson(`${API_BASE_URL}/api/userLogin`, {
    method: "POST",
    body: JSON.stringify({
      username: credentials.username?.trim() || credentials.email?.trim(),
      password: credentials.password
    })
  });

  const displayName = [payload?.firstName, payload?.lastName].filter(Boolean).join(" ") || payload?.username || payload?.emailId;

  return {
    message: `Signed in as ${payload?.username || displayName || "user"}.`,
    user: {
      id: payload?.id,
      name: displayName || "Zariya User",
      username: payload?.username,
      email: payload?.emailId,
      ...payload
    }
  };
}

export async function signUp(profile) {
  const payload = await requestJson(`${API_BASE_URL}/api/userRegister`, {
    method: "POST",
    body: JSON.stringify({
      firstName: profile.firstName,
      lastName: profile.lastName,
      emailId: profile.email,
      mobileNo: profile.mobile,
      username: profile.username,
      password: profile.password
    })
  });

  return {
    message: `Account created for ${payload?.username || profile.username}.`,
    user: {
      id: payload?.id,
      name: `${profile.firstName} ${profile.lastName}`.trim() || payload?.username || profile.username,
      username: payload?.username,
      email: payload?.emailId,
      ...payload
    }
  };
}

export async function fetchRoles() {
  const response = await fetch(ROLES_URL, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Unable to load roles (${response.status})`);
  }

  const roles = await response.json();
  return normalizeRoles(roles);
}
