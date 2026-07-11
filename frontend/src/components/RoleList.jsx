import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function RoleList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRoles() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/roles`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`Unable to load roles (${response.status})`);
        }

        const data = await response.json();
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roles.");
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  return (
    <section className="dm-register-card">
      <div className="dm-card-header">
        <h2>Role list</h2>
        <p>Loaded from the backend role API.</p>
      </div>

      {loading ? (
        <div className="dm-empty-table">Loading roles...</div>
      ) : error ? (
        <div className="dm-empty-table">{error}</div>
      ) : roles.length === 0 ? (
        <div className="dm-empty-table">No roles found.</div>
      ) : (
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
