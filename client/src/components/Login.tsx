import { useState } from "react";
import { apiLogin, apiMe } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { token, user } = await apiLogin({ email, password });
      localStorage.setItem("token", token);
      setMessage(`Welcome back, ${user?.name || user?.email}!`);
      // Optional: call /me to verify token
      await apiMe(token);
    } catch (err: any) {
      setMessage(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
