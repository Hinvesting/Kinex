import { useMemo, useState } from "react";
import { callGenerativeAI } from "../../lib/aiAdapter";

function isLikelyFormattedScript(text: string) {
  const lines = text.split(/\r?\n/);
  const hasSlug = lines.some((l) => /^(INT\.|EXT\.)\b/.test(l.trim()));
  const hasUpperNames = lines.filter((l) => l.trim().length > 0).some((l) => /^[A-Z][A-Z0-9\s\-\.]{2,}$/.test(l.trim()));
  return hasSlug || hasUpperNames;
}

export default function Step1IntelligentIngest({ originalText, script, onSave }: { originalText: string; script: string; onSave: (originalText: string, script: string) => Promise<void> }) {
  const [text, setText] = useState(originalText);
  const [formatted, setFormatted] = useState(script);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const alreadyFormatted = useMemo(() => isLikelyFormattedScript(text || formatted), [text, formatted]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      let newScript = formatted;
      if (!alreadyFormatted) {
        const prompt = `Format this text into a standard screenplay format (sluglines, dialogue, character names in caps). Keep content faithful and concise.\n\nText:\n${text}`;
        newScript = await callGenerativeAI(prompt);
      } else if (!newScript) {
        newScript = text;
      }
      setFormatted(newScript);
      await onSave(text, newScript);
      setMessage("Script saved.");
    } catch (err: any) {
      setMessage(err.message || "Failed to format script");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Step 1: Intelligent Ingest</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Original Text
          <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label>
          Script (preview)
          <textarea rows={10} value={formatted} onChange={(e) => setFormatted(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Processing…" : alreadyFormatted ? "Save" : "Format & Save"}</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
