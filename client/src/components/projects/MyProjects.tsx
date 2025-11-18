import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjectsByUserApi } from "../../lib/projectsApi";
import { Project } from "../../types/project";

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { projects } = await getProjectsByUserApi();
        setProjects(projects);
      } catch (e: any) {
        setError(e.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading projects…</p>;
  if (error) return <p className="message">{error}</p>;

  return (
    <section className="card">
      <h2>My Projects</h2>
      {projects.length === 0 ? (
        <p className="message">No projects yet. Create one from "New Project".</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <Link to={`/project/${p.id}`}>{p.projectName}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
