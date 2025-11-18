import { useEffect, useMemo, useRef, useState } from "react";
import { callGenerativeAI } from "../../lib/aiAdapter";
import { Character } from "../../types/project";
import { getSignedUploadUrl } from "../../lib/uploadsApi";
import { useParams } from "react-router-dom";
import { updateProjectApi } from "../../lib/projectsApi";

function extractCharacters(script: string): string[] {
  const names = new Set<string>();
  const lines = script.split(/\r?\n/);
  for (const l of lines) {
    const t = l.trim();
    if (/^(INT\.|EXT\.)\b/.test(t)) continue;
    if (/^[A-Z][A-Z0-9\s\-\.]{2,}$/.test(t) && t.length <= 30) {
      names.add(t.replace(/\(.+\)$/,'').trim());
    }
  }
  return Array.from(names);
}

export default function Step2CharacterLookbook({ script, characters, onSave }: { script: string; characters: Character[]; onSave: (characters: Character[]) => Promise<void> }) {
  const detected = useMemo(() => extractCharacters(script), [script]);
  const [list, setList] = useState<Character[]>(characters && characters.length ? characters : detected.map((n) => ({ name: n })));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!characters?.length && detected.length) {
      setList(detected.map((n) => ({ name: n })));
    }
  }, [detected, characters]);

  async function generateAll() {
    setLoading(true);
    setMessage(null);
    try {
      const updated: Character[] = [];
      for (const c of list) {
        const desc = c.description || (await callGenerativeAI(`Provide a concise character description for ${c.name}. Use 2-3 sentences.`));
        const headshotPrompt = c.headshotPrompt || (await callGenerativeAI(`Create a photorealistic portrait prompt for ${c.name}. Return a single line describing the headshot.`));
        const fullbodyPrompt = c.fullbodyPrompt || (await callGenerativeAI(`Create a full-body portrait prompt for ${c.name}. Return a single line.`));
        updated.push({ ...c, description: desc, headshotPrompt, fullbodyPrompt });
      }
      setList(updated);
      await onSave(updated);
      setMessage("Character prompts saved.");
    } catch (err: any) {
      setMessage(err.message || "Failed to generate prompts");
    } finally {
      setLoading(false);
    }
  }

  function updateField(idx: number, patch: Partial<Character>) {
    setList((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  async function save() {
    await onSave(list);
    setMessage("Saved.");
  }

  async function onPickFile(type: "headshotUrl" | "fullbodyUrl", idx: number) {
    if (!fileInputRef.current) return;
    fileInputRef.current.onchange = async () => {
      const file = fileInputRef.current!.files?.[0];
      fileInputRef.current!.value = ""; // reset
      if (!file) return;
      setUploadingIdx(idx);
      setMessage(null);
      try {
        const { uploadUrl, fileUrl } = await getSignedUploadUrl({ fileName: file.name, fileType: file.type, folder: type === "headshotUrl" ? "headshots" : "fullbody" });
        const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!putRes.ok) throw new Error("Failed to upload file");
        // Update local list and persist to backend
        const updated = list.map((c, i) => (i === idx ? { ...c, [type]: fileUrl } : c));
        setList(updated);
        await onSave(updated);
        if (id) await updateProjectApi(id, { characters: updated });
        setMessage("Image uploaded and saved.");
      } catch (err: any) {
        setMessage(err.message || "Upload failed");
      } finally {
        setUploadingIdx(null);
      }
    };
    fileInputRef.current.click();
  }

  return (
    <div>
      <h3>Step 2: Character Lookbook</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((c, idx) => (
          <div key={idx} className="card" style={{ padding: 12 }}>
            <strong>{c.name}</strong>
            <label>
              Description
              <textarea rows={3} value={c.description || ""} onChange={(e) => updateField(idx, { description: e.target.value })} />
            </label>
            <label>
              Headshot Prompt
              <textarea rows={2} value={c.headshotPrompt || ""} onChange={(e) => updateField(idx, { headshotPrompt: e.target.value })} />
            </label>
            <label>
              Full-body Prompt
              <textarea rows={2} value={c.fullbodyPrompt || ""} onChange={(e) => updateField(idx, { fullbodyPrompt: e.target.value })} />
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => onPickFile("headshotUrl", idx)} disabled={uploadingIdx === idx}>{uploadingIdx === idx ? "Uploading…" : (c.headshotUrl ? "Replace Headshot" : "Upload Headshot")}</button>
              {c.headshotUrl ? <a href={c.headshotUrl} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>Preview</a> : null}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => onPickFile("fullbodyUrl", idx)} disabled={uploadingIdx === idx}>{uploadingIdx === idx ? "Uploading…" : (c.fullbodyUrl ? "Replace Full-body" : "Upload Full-body")}</button>
              {c.fullbodyUrl ? <a href={c.fullbodyUrl} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>Preview</a> : null}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={generateAll} disabled={loading}>{loading ? "Generating…" : "Generate All"}</button>
        <button onClick={save} disabled={loading}>Save</button>
      </div>
      {message && <p className="message">{message}</p>}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} />
    </div>
  );
}
