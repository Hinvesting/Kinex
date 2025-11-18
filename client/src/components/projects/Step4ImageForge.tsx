import { useParams } from "react-router-dom";
import { useState } from "react";
import { Scene } from "../../types/project";
import { callImageGenerationAI } from "../../lib/aiAdapter";
import { updateProjectApi } from "../../lib/projectsApi";

export default function Step4ImageForge({ scenes }: { scenes: Scene[] }) {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<Scene[]>(scenes || []);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onGenerate(idx: number) {
    setMessage(null);
    setLoadingIdx(idx);
    try {
      const s = list[idx];
      if (!s?.prompt) throw new Error("Missing prompt for this scene");
      const url = await callImageGenerationAI(s.prompt);
      const updated = list.map((sc, i) => (i === idx ? { ...sc, generatedImageUrl: url } : sc));
      setList(updated);
      if (id) await updateProjectApi(id, { scenes: updated });
      setMessage(`Generated image for Scene ${s.sceneNumber}`);
    } catch (err: any) {
      setMessage(err.message || "Failed to generate image");
    } finally {
      setLoadingIdx(null);
    }
  }

  return (
    <div>
      <h3>Step 4: Image Forge</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((s, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <strong>Scene {s.sceneNumber}</strong>
            <div style={{ whiteSpace: "pre-wrap", margin: "8px 0" }}>{s.prompt}</div>
            {s.generatedImageUrl ? (
              <img src={s.generatedImageUrl} alt={`Scene ${s.sceneNumber}`} style={{ maxWidth: "100%", borderRadius: 8 }} />
            ) : null}
            <button onClick={() => onGenerate(i)} disabled={loadingIdx === i}>
              {loadingIdx === i ? "Generating…" : "Generate"}
            </button>
          </div>
        ))}
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
