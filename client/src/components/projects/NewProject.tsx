import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProjectApi } from "../../lib/projectsApi";

export default function NewProject() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { project } = await createProjectApi({ projectName, originalText: originalText || undefined });
      navigate(`/project/${project.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>New Project</h2>
      <form onSubmit={onSubmit}>
        <label>
          Project Name
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
        </label>
        <label>
          Original Text (optional)
          <textarea value={originalText} onChange={(e) => setOriginalText(e.target.value)} rows={10} />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Creating…" : "Create"}</button>
      </form>
      {error && <p className="message">{error}</p>}
    </section>
  );
}
