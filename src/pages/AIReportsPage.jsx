import { useState, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const EMPTY = { report: null, predictions: null, metrics: null, target: null, kind: null, model_saved: null, error: null };

function MetricCard({ label, value }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)", wordBreak: "break-all" }}>{value}</p>
    </div>
  );
}

function Badge({ children, type = "info" }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 500, padding: "2px 10px",
      borderRadius: "var(--border-radius-md)",
      background: `var(--color-background-${type})`,
      color: `var(--color-text-${type})`,
      display: "inline-block"
    }}>{children}</span>
  );
}

export default function AIReportsPage() {
  const [inputMode, setInputMode] = useState("json");   // "json" | "csv" | "file"
  const [rawInput, setRawInput] = useState("");
  const [apiUrl, setApiUrl] = useState(API_URL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(EMPTY);
  const fileRef = useRef();

  async function handleSubmit() {
    setLoading(true);
    setResult(EMPTY);
    try {
      let data;

      if (inputMode === "file") {
        const file = fileRef.current?.files?.[0];
        if (!file) throw new Error("No file selected.");
        const text = await file.text();
        data = file.name.endsWith(".json") ? JSON.parse(text) : text;
      } else if (inputMode === "json") {
        data = JSON.parse(rawInput);
      } else {
        data = rawInput;   // raw CSV string
      }

      const body = typeof data === "string" ? { data } : Array.isArray(data) ? { data } : data;

      const res = await fetch(`${apiUrl}/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResult({ ...EMPTY, ...json });
    } catch (err) {
      setResult({ ...EMPTY, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setRawInput("");
    setResult(EMPTY);
    if (fileRef.current) fileRef.current.value = "";
  }

  const preds = result.predictions;
  const isProbaBinary = preds?.predicted_proba;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem" }}>

      <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>
        Report generator
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 2rem" }}>
        Upload or paste your dataset — the model trains, predicts, and returns a full report in one shot.
      </p>

      {/* ── Config ── */}
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem", marginBottom: "1.25rem" }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px", color: "var(--color-text-secondary)" }}>API endpoint</p>
        <input
          value={apiUrl}
          onChange={e => setApiUrl(e.target.value)}
          placeholder="http://localhost:8000"
          style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--font-mono)", fontSize: 13 }}
        />
      </div>

      {/* ── Input panel ── */}
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem", marginBottom: "1.25rem" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
          {["json", "csv", "file"].map(m => (
            <button
              key={m}
              onClick={() => setInputMode(m)}
              style={{
                fontWeight: inputMode === m ? 500 : 400,
                background: inputMode === m ? "var(--color-background-secondary)" : "transparent",
                borderColor: inputMode === m ? "var(--color-border-primary)" : "var(--color-border-tertiary)",
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {inputMode === "file" ? (
          <div
            style={{ border: "0.5px dashed var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "2rem", textAlign: "center", cursor: "pointer" }}
            onClick={() => fileRef.current?.click()}
          >
            <p style={{ margin: "0 0 6px", color: "var(--color-text-secondary)", fontSize: 14 }}>Click to select a file</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-tertiary)" }}>.csv or .json</p>
            <input ref={fileRef} type="file" accept=".csv,.json" style={{ display: "none" }} onChange={() => {}} />
          </div>
        ) : (
          <textarea
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            rows={10}
            placeholder={inputMode === "json"
              ? '[{"age": 30, "income": 50000, "response": 1}, ...]'
              : "age,income,response\n30,50000,1\n45,75000,0"}
            style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--font-mono)", fontSize: 12, resize: "vertical" }}
          />
        )}

        <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
          <button onClick={handleSubmit} disabled={loading} style={{ fontWeight: 500 }}>
            {loading ? "Running..." : "Run report \u2197"}
          </button>
          <button onClick={handleClear} disabled={loading}>Clear</button>
        </div>
      </div>

      {/* ── Error ── */}
      {result.error && (
        <div style={{ background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-md)", padding: "1rem", marginBottom: "1.25rem" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-danger)" }}>{result.error}</p>
        </div>
      )}

      {/* ── Results ── */}
      {result.kind && (
        <>
          {/* Summary row */}
          <div style={{ display: "flex", gap: 12, marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <MetricCard label="Target column" value={result.target} />
            <MetricCard label="Task type" value={result.kind} />
            <MetricCard
              label={result.kind === "binary" ? "ROC-AUC (train)" : "R² (train)"}
              value={result.kind === "binary"
                ? (result.metrics?.roc_auc_train ?? "—").toLocaleString?.(undefined, { maximumFractionDigits: 4 }) ?? result.metrics?.roc_auc_train
                : (result.metrics?.r2_train ?? "—").toLocaleString?.(undefined, { maximumFractionDigits: 4 }) ?? result.metrics?.r2_train}
            />
          </div>

          {/* Model path */}
          {result.model_saved && (
            <div style={{ marginBottom: "1.25rem", padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", display: "flex", alignItems: "center", gap: 10 }}>
              <Badge type="success">saved</Badge>
              <code style={{ fontSize: 12, color: "var(--color-text-secondary)", wordBreak: "break-all" }}>{result.model_saved}</code>
            </div>
          )}

          {/* Narrative report */}
          {result.report && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px", color: "var(--color-text-secondary)" }}>Report</p>
              <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
                {result.report}
              </pre>
            </div>
          )}

          {/* Predictions table */}
          {preds && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
              <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px", color: "var(--color-text-secondary)" }}>
                Predictions — {isProbaBinary ? "binary classifier" : "regression"}
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                      <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, color: "var(--color-text-secondary)" }}>#</th>
                      {isProbaBinary && (
                        <>
                          <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, color: "var(--color-text-secondary)" }}>Class</th>
                          <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, color: "var(--color-text-secondary)" }}>Probability</th>
                          <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, color: "var(--color-text-secondary)" }}>Confidence</th>
                        </>
                      )}
                      {!isProbaBinary && (
                        <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, color: "var(--color-text-secondary)" }}>Predicted value</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(isProbaBinary ? preds.predicted_class : preds.predicted).slice(0, 50).map((val, i) => {
                      const proba = isProbaBinary ? preds.predicted_proba[i] : null;
                      const pct = proba != null ? Math.round(proba * 100) : null;
                      return (
                        <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                          <td style={{ padding: "6px 10px", color: "var(--color-text-tertiary)" }}>{i + 1}</td>
                          {isProbaBinary && (
                            <>
                              <td style={{ padding: "6px 10px" }}>
                                <Badge type={val === 1 ? "success" : "danger"}>{val === 1 ? "positive" : "negative"}</Badge>
                              </td>
                              <td style={{ padding: "6px 10px", fontFamily: "var(--font-mono)" }}>{proba.toFixed(4)}</td>
                              <td style={{ padding: "6px 10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ flex: 1, height: 6, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", background: val === 1 ? "var(--color-background-success)" : "var(--color-background-danger)", borderRadius: 3, transition: "width 0.3s" }} />
                                  </div>
                                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 32 }}>{pct}%</span>
                                </div>
                              </td>
                            </>
                          )}
                          {!isProbaBinary && (
                            <td style={{ padding: "6px 10px", fontFamily: "var(--font-mono)" }}>{typeof val === "number" ? val.toFixed(4) : val}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(isProbaBinary ? preds.predicted_class : preds.predicted).length > 50 && (
                  <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "10px 10px 0" }}>
                    Showing first 50 of {(isProbaBinary ? preds.predicted_class : preds.predicted).length} rows.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}