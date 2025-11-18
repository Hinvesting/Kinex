import { useEffect, useState } from "react";
import { useApiKey } from "../context/ApiKeyContext";

const PROVIDERS = ["OpenAI", "Gemini", "Anthropic"] as const;

export default function ApiKeyManager() {
  const { provider, saveApiKey } = useApiKey();
  const [selected, setSelected] = useState<typeof PROVIDERS[number]>(provider);
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    setSelected(provider);
  }, [provider]);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!key) {
      setSaved("Please enter an API key.");
      return;
    }
    saveApiKey(selected, key);
    setKey("");
    setSaved(`Saved ${selected} API key locally. It is never sent to our servers.`);
  }

  return (
    <section className="card">
      <h2>Bring Your Own API Key</h2>
      <p className="message">Your key is stored only in your browser via localStorage.</p>
      <form onSubmit={onSave}>
        <label>
          Provider
          <select value={selected} onChange={(e) => setSelected(e.target.value as typeof PROVIDERS[number])}>
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          API Key
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your API key"
          />
        </label>
        <button type="submit">Save</button>
      </form>
      {saved && <p className="message">{saved}</p>}
    </section>
  );
}
