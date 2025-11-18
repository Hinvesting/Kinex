import { useState } from "react";
import { apiRegister } from "../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { token, user } = await apiRegister({ name: name || undefined, email, password });
      localStorage.setItem("token", token);
      setMessage(`Registered as ${user?.name || user?.email}`);
    } catch (err: any) {
      setMessage(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
          />
        </label>
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
        <label>
          Confirm Password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
