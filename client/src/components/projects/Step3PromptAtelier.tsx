import { useEffect, useMemo, useState } from "react";
import { callGenerativeAI } from "../../lib/aiAdapter";
import { Scene } from "../../types/project";

const STYLES = ["Cinematic", "Anime", "Noir", "Fantasy"] as const;

function extractSceneBlocks(script: string): string[] {
  const lines = script.split(/\r?\n/);
  const indices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^(INT\.|EXT\.)\b/.test(lines[i].trim())) indices.push(i);
  }
  if (!indices.length) return [script];
  const blocks: string[] = [];
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i];
    const end = i + 1 < indices.length ? indices[i + 1] : lines.length;
    blocks.push(lines.slice(start, end).join("\n"));
  }
  return blocks;
}

export default function Step3PromptAtelier({ script, scenes, onSave }: { script: string; scenes: Scene[]; onSave: (scenes: Scene[]) => Promise<void> }) {
  const blocks = useMemo(() => extractSceneBlocks(script), [script]);
  const [style, setStyle] = useState<typeof STYLES[number]>("Cinematic");
  const [list, setList] = useState<Scene[]>(() => scenes?.length ? scenes : blocks.map((b, i) => ({ sceneNumber: i + 1, prompt: scenes?.[i]?.prompt || "" })));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!scenes?.length && blocks.length) {
      setList(blocks.map((_, i) => ({ sceneNumber: i + 1, prompt: "" })));
    }
  }, [blocks, scenes]);

  function updatePrompt(i: number, prompt: string) {
    setList((prev) => prev.map((s, idx) => (idx === i ? { ...s, prompt } : s)));
  }

  async function generateAll() {
    setLoading(true);
    setMessage(null);
    try {
      const updated: Scene[] = [];
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const styleKeywords = style === "Cinematic" ? "cinematic lighting, depth of field, film still" :
          style === "Anime" ? "anime style, vibrant colors, detailed line art" :
          style === "Noir" ? "high contrast, moody shadows, noir style" :
          "high fantasy, epic scale, mystical lighting";
        const prompt = await callGenerativeAI(`Create a concise image generation prompt for this scene in ${style} style adding keywords (${styleKeywords}). Return one line.\n\nScene:\n${block}`);
        updated.push({ sceneNumber: i + 1, prompt });
      }
      setList(updated);
      await onSave(updated);
      setMessage("Scene prompts saved.");
    } catch (err: any) {
      setMessage(err.message || "Failed to generate scene prompts");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    await onSave(list);
    setMessage("Saved.");
  }

  return (
    <div>
      <h3>Step 3: Prompt Atelier</h3>
      <label>
        Global Style
        <select value={style} onChange={(e) => setStyle(e.target.value as any)}>
          {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {list.map((s, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <strong>Scene {s.sceneNumber}</strong>
            <label>
              Prompt
              <textarea rows={2} value={s.prompt || ""} onChange={(e) => updatePrompt(i, e.target.value)} />
            </label>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={generateAll} disabled={loading}>{loading ? "Generating…" : "Generate All"}</button>
        <button onClick={save} disabled={loading}>Save</button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
