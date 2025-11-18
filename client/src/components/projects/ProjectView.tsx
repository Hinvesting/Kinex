import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectApi, updateProjectApi } from "../../lib/projectsApi";
import { Project, Character, Scene } from "../../types/project";
import Step1IntelligentIngest from "./Step1IntelligentIngest";
import Step2CharacterLookbook from "./Step2CharacterLookbook";
import Step3PromptAtelier from "./Step3PromptAtelier";
import Step4ImageForge from "./Step4ImageForge";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { project } = await getProjectApi(id);
        setProject(project);
      } catch (e: any) {
        setError(e.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function save(update: Partial<Project>) {
    if (!id) return;
    const { project } = await updateProjectApi(id, update);
    setProject(project);
  }

  const steps = useMemo(() => (
    [
      { n: 1, title: "Intelligent Ingest" },
      { n: 2, title: "Character Lookbook" },
      { n: 3, title: "Prompt Atelier" },
      { n: 4, title: "Image Forge" },
    ] as const
  ), []);

  if (loading) return <p>Loading project…</p>;
  if (error) return <p className="message">{error}</p>;
  if (!project) return <p className="message">Project not found</p>;

  return (
    <section className="card">
      <h2>{project.projectName}</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {steps.map((s) => (
          <button key={s.n} onClick={() => setStep(s.n as any)} style={{ opacity: step === s.n ? 1 : 0.7 }}>{s.n}. {s.title}</button>
        ))}
      </div>

      {step === 1 && (
        <Step1IntelligentIngest
          originalText={project.originalText || ""}
          script={project.script || ""}
          onSave={async (originalText, script) => save({ originalText, script })}
        />
      )}

      {step === 2 && (
        <Step2CharacterLookbook
          script={project.script || project.originalText || ""}
          characters={project.characters || []}
          onSave={async (characters: Character[]) => save({ characters })}
        />
      )}

      {step === 3 && (
        <Step3PromptAtelier
          script={project.script || project.originalText || ""}
          scenes={project.scenes || []}
          onSave={async (scenes: Scene[]) => save({ scenes })}
        />
      )}

      {step === 4 && (
        <Step4ImageForge
          scenes={project.scenes || []}
        />
      )}
    </section>
  );
}
