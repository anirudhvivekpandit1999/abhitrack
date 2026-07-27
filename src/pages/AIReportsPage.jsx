import { useMemo, useRef, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const EMPTY = {
  report: null,
  predictions: null,
  metrics: null,
  target: null,
  kind: null,
  model_saved: null,
  error: null,
};

/* =========================================================
   ICONS
========================================================= */

function Icon({
  children,
  size = 18,
  strokeWidth = 1.8,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SparklesIcon() {
  return (
    <Icon size={20}>
      <path d="M12 3l1.1 3.2a4 4 0 0 0 2.5 2.5L19 10l-3.4 1.2a4 4 0 0 0-2.5 2.5L12 17l-1.2-3.3a4 4 0 0 0-2.5-2.5L5 10l3.3-1.3a4 4 0 0 0 2.5-2.5L12 3Z" />
      <path d="M19 16l.6 1.5a2 2 0 0 0 1 1L22 19l-1.4.5a2 2 0 0 0-1 1L19 22l-.5-1.5a2 2 0 0 0-1-1L16 19l1.5-.5a2 2 0 0 0 1-1L19 16Z" />
    </Icon>
  );
}

function ServerIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01" />
      <path d="M7 17h.01" />
    </Icon>
  );
}

function UploadIcon() {
  return (
    <Icon size={25}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </Icon>
  );
}

function FileIcon() {
  return (
    <Icon size={19}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </Icon>
  );
}

function PlayIcon() {
  return (
    <Icon size={16}>
      <path d="m8 5 11 7-11 7Z" />
    </Icon>
  );
}

function TrashIcon() {
  return (
    <Icon size={16}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </Icon>
  );
}

function TargetIcon() {
  return (
    <Icon size={18}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

function ActivityIcon() {
  return (
    <Icon size={18}>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </Icon>
  );
}

function ChartIcon() {
  return (
    <Icon size={18}>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </Icon>
  );
}

function CheckIcon() {
  return (
    <Icon size={15} strokeWidth={2.2}>
      <path d="m5 12 4 4L19 6" />
    </Icon>
  );
}

function CopyIcon() {
  return (
    <Icon size={15}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  );
}

function AlertIcon() {
  return (
    <Icon size={18}>
      <path d="M10.3 3.6 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatMetric(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "number") {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });
  }

  return String(value);
}

function MetricCard({
  label,
  value,
  icon,
  helper,
}) {
  return (
    <div className="air-metric-card">
      <div className="air-metric-icon">
        {icon}
      </div>

      <div className="air-metric-content">
        <p className="air-metric-label">
          {label}
        </p>

        <p className="air-metric-value">
          {formatMetric(value)}
        </p>

        {helper && (
          <p className="air-metric-helper">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}

function Badge({
  children,
  type = "info",
}) {
  return (
    <span
      className={`air-badge air-badge-${type}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AIReportsPage() {
  const [inputMode, setInputMode] =
    useState("json");

  const [rawInput, setRawInput] =
    useState("");

  const [apiUrl, setApiUrl] =
    useState(API_URL);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(EMPTY);

  const [selectedFileName, setSelectedFileName] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const fileRef = useRef();


  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit() {
    setLoading(true);
    setResult(EMPTY);

    try {
      let data;

      if (inputMode === "file") {
        const file =
          fileRef.current?.files?.[0];

        if (!file) {
          throw new Error(
            "No file selected."
          );
        }

        const text = await file.text();

        data = file.name
          .toLowerCase()
          .endsWith(".json")
          ? JSON.parse(text)
          : text;
      } else if (inputMode === "json") {
        if (!rawInput.trim()) {
          throw new Error(
            "Paste JSON data before running the report."
          );
        }

        data = JSON.parse(rawInput);
      } else {
        if (!rawInput.trim()) {
          throw new Error(
            "Paste CSV data before running the report."
          );
        }

        data = rawInput;
      }

      const body =
        typeof data === "string"
          ? { data }
          : Array.isArray(data)
          ? { data }
          : data;

      const res = await fetch(
        `${apiUrl}/generate-report`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      let json;

      try {
        json = await res.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (HTTP ${res.status}).`
        );
      }

      if (!res.ok) {
        throw new Error(
          json.error ||
            `HTTP ${res.status}`
        );
      }

      setResult({
        ...EMPTY,
        ...json,
      });
    } catch (err) {
      setResult({
        ...EMPTY,
        error:
          err?.message ||
          "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }


  /* =======================================================
     CLEAR
  ======================================================= */

  function handleClear() {
    setRawInput("");
    setResult(EMPTY);
    setSelectedFileName("");
    setCopied(false);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }


  /* =======================================================
     FILE
  ======================================================= */

  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    setSelectedFileName(
      file?.name || ""
    );
  }


  /* =======================================================
     COPY REPORT
  ======================================================= */

  async function handleCopyReport() {
    if (!result.report) return;

    try {
      await navigator.clipboard.writeText(
        result.report
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1600
      );
    } catch {
      setCopied(false);
    }
  }


  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const preds = result.predictions;

  const isProbaBinary =
    Boolean(preds?.predicted_proba);

  const predictionValues = useMemo(() => {
    if (!preds) return [];

    return isProbaBinary
      ? preds.predicted_class || []
      : preds.predicted || [];
  }, [preds, isProbaBinary]);

  const metricValue =
    result.kind === "binary"
      ? result.metrics?.roc_auc_train
      : result.metrics?.r2_train;

  const metricLabel =
    result.kind === "binary"
      ? "ROC-AUC"
      : "R² Score";


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{`
        .air-page {
          --air-navy: #172b4d;
          --air-navy-dark: #10213d;
          --air-blue: #2563eb;
          --air-blue-dark: #1d4ed8;
          --air-blue-soft: #eff6ff;
          --air-text: #172033;
          --air-muted: #667085;
          --air-light-muted: #98a2b3;
          --air-border: #e4e7ec;
          --air-border-soft: #eef1f5;
          --air-surface: #ffffff;
          --air-bg: #f7f9fc;
          --air-success: #067647;
          --air-success-bg: #ecfdf3;
          --air-danger: #b42318;
          --air-danger-bg: #fef3f2;

          width: 100%;
          min-height: 100vh;
          background:
            radial-gradient(circle at 5% 0%, rgba(37, 99, 235, 0.05), transparent 24rem),
            var(--air-bg);
          color: var(--air-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .air-shell {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 42px 0 72px;
        }

        .air-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .air-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: var(--air-blue);
          font-size: 11px;
          line-height: 1;
          font-weight: 750;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .air-title {
          margin: 0;
          color: var(--air-navy-dark);
          font-size: clamp(27px, 4vw, 36px);
          line-height: 1.15;
          font-weight: 760;
          letter-spacing: -0.035em;
        }

        .air-subtitle {
          max-width: 680px;
          margin: 10px 0 0;
          color: var(--air-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .air-beta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          margin-top: 4px;
          padding: 7px 11px;
          border: 1px solid #dbeafe;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.85);
          color: var(--air-blue);
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(16, 24, 40, 0.04);
        }

        .air-beta-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 3px #dcfce7;
        }

        .air-card {
          overflow: hidden;
          margin-bottom: 18px;
          border: 1px solid var(--air-border);
          border-radius: 14px;
          background: var(--air-surface);
          box-shadow:
            0 1px 2px rgba(16, 24, 40, 0.02),
            0 4px 12px rgba(16, 24, 40, 0.025);
        }

        .air-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 17px 20px;
          border-bottom: 1px solid var(--air-border-soft);
        }

        .air-card-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .air-heading-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--air-blue-soft);
          color: var(--air-blue);
        }

        .air-section-title {
          margin: 0;
          color: var(--air-text);
          font-size: 13px;
          line-height: 1.35;
          font-weight: 720;
        }

        .air-section-description {
          margin: 2px 0 0;
          color: var(--air-light-muted);
          font-size: 11px;
          line-height: 1.4;
        }

        .air-card-body {
          padding: 20px;
        }

        .air-label {
          display: block;
          margin-bottom: 7px;
          color: #475467;
          font-size: 11px;
          font-weight: 680;
        }

        .air-endpoint-wrap {
          position: relative;
        }

        .air-endpoint-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          display: flex;
          color: #98a2b3;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .air-input,
        .air-textarea {
          width: 100%;
          box-sizing: border-box;
          outline: none;
          border: 1px solid #d0d5dd;
          border-radius: 9px;
          background: #ffffff;
          color: #344054;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .air-input {
          height: 42px;
          padding: 0 13px;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: 12px;
        }

        .air-input-with-icon {
          padding-left: 40px;
        }

        .air-input:hover,
        .air-textarea:hover {
          border-color: #b8c0cc;
        }

        .air-input:focus,
        .air-textarea:focus {
          border-color: var(--air-blue);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.09);
        }

        .air-input-help {
          margin: 7px 0 0;
          color: var(--air-light-muted);
          font-size: 10.5px;
        }

        .air-mode-tabs {
          display: inline-flex;
          gap: 3px;
          padding: 4px;
          margin-bottom: 17px;
          border: 1px solid var(--air-border);
          border-radius: 10px;
          background: #f8fafc;
        }

        .air-mode-button {
          appearance: none;
          border: 0;
          border-radius: 7px;
          padding: 8px 16px;
          background: transparent;
          color: var(--air-muted);
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 680;
          transition: all 140ms ease;
        }

        .air-mode-button:hover {
          color: var(--air-navy);
          background: rgba(255, 255, 255, 0.7);
        }

        .air-mode-button.active {
          background: #ffffff;
          color: var(--air-blue);
          box-shadow:
            0 1px 3px rgba(16, 24, 40, 0.08),
            0 0 0 1px rgba(16, 24, 40, 0.03);
        }

        .air-textarea {
          min-height: 230px;
          padding: 14px 15px;
          resize: vertical;
          background: #fbfcfe;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: 11.5px;
          line-height: 1.65;
        }

        .air-textarea::placeholder,
        .air-input::placeholder {
          color: #98a2b3;
        }

        .air-upload {
          min-height: 210px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          border: 1.5px dashed #cbd5e1;
          border-radius: 11px;
          background:
            linear-gradient(180deg, #fcfdff, #f8fafc);
          cursor: pointer;
          text-align: center;
          transition:
            border-color 150ms ease,
            background 150ms ease,
            transform 150ms ease;
        }

        .air-upload:hover {
          border-color: #93b4f5;
          background: var(--air-blue-soft);
        }

        .air-upload-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #ffffff;
          color: var(--air-blue);
          box-shadow: 0 3px 8px rgba(37, 99, 235, 0.07);
        }

        .air-upload-title {
          margin: 0;
          color: #344054;
          font-size: 13px;
          font-weight: 680;
        }

        .air-upload-subtitle {
          margin: 5px 0 0;
          color: var(--air-light-muted);
          font-size: 11px;
        }

        .air-file-selected {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          max-width: 100%;
          margin-top: 13px;
          padding: 7px 10px;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #ffffff;
          color: var(--air-blue);
          font-size: 11px;
          font-weight: 650;
        }

        .air-file-selected span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .air-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 17px;
          padding-top: 17px;
          border-top: 1px solid var(--air-border-soft);
        }

        .air-actions-left {
          display: flex;
          gap: 9px;
        }

        .air-button {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          appearance: none;
          border-radius: 8px;
          padding: 0 15px;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          transition:
            transform 140ms ease,
            background 140ms ease,
            border-color 140ms ease,
            box-shadow 140ms ease;
        }

        .air-button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          transform: none !important;
        }

        .air-button-primary {
          border: 1px solid var(--air-navy);
          background: var(--air-navy);
          color: #ffffff;
          box-shadow: 0 2px 5px rgba(23, 43, 77, 0.12);
        }

        .air-button-primary:hover:not(:disabled) {
          background: var(--air-navy-dark);
          border-color: var(--air-navy-dark);
          transform: translateY(-1px);
          box-shadow: 0 5px 12px rgba(23, 43, 77, 0.15);
        }

        .air-button-secondary {
          border: 1px solid var(--air-border);
          background: #ffffff;
          color: #475467;
        }

        .air-button-secondary:hover:not(:disabled) {
          border-color: #cbd5e1;
          background: #f8fafc;
          color: var(--air-navy);
        }

        .air-spinner {
          width: 14px;
          height: 14px;
          box-sizing: border-box;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: air-spin 0.7s linear infinite;
        }

        @keyframes air-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .air-security-note {
          color: var(--air-light-muted);
          font-size: 10.5px;
        }

        .air-error {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-bottom: 18px;
          padding: 14px 16px;
          border: 1px solid #fecdca;
          border-radius: 10px;
          background: var(--air-danger-bg);
          color: var(--air-danger);
        }

        .air-error-icon {
          display: flex;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .air-error-title {
          margin: 0 0 2px;
          font-size: 12px;
          font-weight: 720;
        }

        .air-error-message {
          margin: 0;
          font-size: 11px;
          line-height: 1.55;
        }

        .air-results-header {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 31px 0 14px;
        }

        .air-results-line {
          flex: 1;
          height: 1px;
          background: var(--air-border);
        }

        .air-results-title {
          color: var(--air-muted);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .air-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .air-metric-card {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 17px;
          border: 1px solid var(--air-border);
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(16, 24, 40, 0.025);
        }

        .air-metric-icon {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--air-blue-soft);
          color: var(--air-blue);
        }

        .air-metric-content {
          min-width: 0;
        }

        .air-metric-label {
          margin: 0 0 5px;
          color: var(--air-muted);
          font-size: 10.5px;
          font-weight: 620;
        }

        .air-metric-value {
          margin: 0;
          overflow: hidden;
          color: var(--air-navy-dark);
          font-size: 20px;
          line-height: 1.2;
          font-weight: 730;
          letter-spacing: -0.025em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .air-metric-helper {
          margin: 4px 0 0;
          color: var(--air-light-muted);
          font-size: 9.5px;
        }

        .air-model-saved {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
          padding: 11px 14px;
          border: 1px solid #d1fadf;
          border-radius: 10px;
          background: #f6fef9;
        }

        .air-model-path {
          min-width: 0;
          overflow-wrap: anywhere;
          color: #475467;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10.5px;
        }

        .air-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 9.5px;
          line-height: 1;
          font-weight: 720;
          white-space: nowrap;
        }

        .air-badge-success {
          background: var(--air-success-bg);
          color: var(--air-success);
        }

        .air-badge-danger {
          background: var(--air-danger-bg);
          color: var(--air-danger);
        }

        .air-badge-info {
          background: var(--air-blue-soft);
          color: var(--air-blue);
        }

        .air-report-body {
          padding: 22px;
        }

        .air-report-text {
          margin: 0;
          color: #344054;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: 12px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .air-copy-button {
          min-height: 31px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--air-border);
          border-radius: 7px;
          padding: 0 10px;
          background: #ffffff;
          color: #667085;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 650;
        }

        .air-copy-button:hover {
          background: #f8fafc;
          color: var(--air-navy);
        }

        .air-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .air-table {
          width: 100%;
          min-width: 620px;
          border-collapse: collapse;
          font-size: 11px;
        }

        .air-table thead {
          background: #f8fafc;
        }

        .air-table th {
          padding: 10px 14px;
          border-bottom: 1px solid var(--air-border);
          color: #667085;
          font-size: 9.5px;
          font-weight: 720;
          letter-spacing: 0.025em;
          text-align: left;
          text-transform: uppercase;
        }

        .air-table td {
          padding: 11px 14px;
          border-bottom: 1px solid var(--air-border-soft);
          color: #344054;
          vertical-align: middle;
        }

        .air-table tbody tr {
          transition: background 120ms ease;
        }

        .air-table tbody tr:hover {
          background: #fafcff;
        }

        .air-row-number {
          width: 50px;
          color: #98a2b3 !important;
          font-variant-numeric: tabular-nums;
        }

        .air-mono {
          font-family: "SFMono-Regular", Consolas, monospace;
          font-variant-numeric: tabular-nums;
        }

        .air-confidence {
          min-width: 150px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .air-progress {
          height: 6px;
          flex: 1;
          overflow: hidden;
          border-radius: 999px;
          background: #eef2f6;
        }

        .air-progress-fill {
          height: 100%;
          border-radius: inherit;
          transition: width 350ms ease;
        }

        .air-progress-fill.success {
          background: #12b76a;
        }

        .air-progress-fill.danger {
          background: #f04438;
        }

        .air-confidence-value {
          width: 34px;
          flex-shrink: 0;
          color: #667085;
          font-size: 10px;
          font-variant-numeric: tabular-nums;
          text-align: right;
        }

        .air-table-footer {
          margin: 0;
          padding: 11px 14px;
          border-top: 0;
          background: #fcfcfd;
          color: #98a2b3;
          font-size: 10px;
        }

        @media (max-width: 760px) {
          .air-shell {
            width: min(100% - 28px, 1180px);
            padding-top: 28px;
          }

          .air-hero {
            flex-direction: column;
          }

          .air-beta {
            margin-top: 0;
          }

          .air-metrics-grid {
            grid-template-columns: 1fr;
          }

          .air-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .air-actions-left {
            width: 100%;
          }

          .air-actions-left .air-button {
            flex: 1;
          }

          .air-security-note {
            text-align: center;
          }

          .air-card-header {
            padding: 15px;
          }

          .air-card-body {
            padding: 15px;
          }
        }

        @media (max-width: 480px) {
          .air-mode-tabs {
            width: 100%;
            box-sizing: border-box;
          }

          .air-mode-button {
            flex: 1;
            padding-left: 8px;
            padding-right: 8px;
          }

          .air-title {
            font-size: 27px;
          }

          .air-upload {
            min-height: 180px;
          }
        }
      `}</style>

      <main className="air-page">
        <div className="air-shell">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <header className="air-hero">
            <div>
              <div className="air-eyebrow">
                <SparklesIcon />
                AI Analytics
              </div>

              <h1 className="air-title">
                Report Generator
              </h1>

              <p className="air-subtitle">
                Upload or paste your dataset and let the
                analysis pipeline train the model, generate
                predictions, evaluate performance, and produce
                a complete report in one run.
              </p>
            </div>

            <div className="air-beta">
              <span className="air-beta-dot" />
              AI reporting service
            </div>
          </header>


          {/* =================================================
              API CONFIGURATION
          ================================================= */}

          <section className="air-card">
            <div className="air-card-header">
              <div className="air-card-heading">
                <div className="air-heading-icon">
                  <ServerIcon />
                </div>

                <div>
                  <h2 className="air-section-title">
                    API Configuration
                  </h2>

                  <p className="air-section-description">
                    Report generation service endpoint
                  </p>
                </div>
              </div>
            </div>

            <div className="air-card-body">
              <label
                className="air-label"
                htmlFor="air-api-endpoint"
              >
                API endpoint
              </label>

              <div className="air-endpoint-wrap">
                <span className="air-endpoint-icon">
                  <ServerIcon />
                </span>

                <input
                  id="air-api-endpoint"
                  className="air-input air-input-with-icon"
                  value={apiUrl}
                  onChange={(event) =>
                    setApiUrl(event.target.value)
                  }
                  placeholder="http://localhost:8000"
                />
              </div>

              <p className="air-input-help">
                Requests are sent to{" "}
                <strong>/generate-report</strong>.
              </p>
            </div>
          </section>


          {/* =================================================
              DATA INPUT
          ================================================= */}

          <section className="air-card">
            <div className="air-card-header">
              <div className="air-card-heading">
                <div className="air-heading-icon">
                  <FileIcon />
                </div>

                <div>
                  <h2 className="air-section-title">
                    Dataset Input
                  </h2>

                  <p className="air-section-description">
                    Paste structured data or upload a local file
                  </p>
                </div>
              </div>
            </div>

            <div className="air-card-body">

              {/* INPUT MODES */}

              <div
                className="air-mode-tabs"
                role="tablist"
                aria-label="Dataset input format"
              >
                {[
                  ["json", "JSON"],
                  ["csv", "CSV"],
                  ["file", "Upload File"],
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={
                      inputMode === mode
                    }
                    className={`air-mode-button ${
                      inputMode === mode
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setInputMode(mode)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>


              {/* FILE INPUT */}

              {inputMode === "file" ? (
                <>
                  <div
                    className="air-upload"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      fileRef.current?.click()
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                  >
                    <div>
                      <div className="air-upload-icon">
                        <UploadIcon />
                      </div>

                      <p className="air-upload-title">
                        Select a dataset
                      </p>

                      <p className="air-upload-subtitle">
                        Click to browse for a CSV or JSON file
                      </p>

                      {selectedFileName && (
                        <div className="air-file-selected">
                          <FileIcon />
                          <span>
                            {selectedFileName}
                          </span>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.json"
                      hidden
                      onChange={
                        handleFileChange
                      }
                    />
                  </div>
                </>
              ) : (

                /* TEXT INPUT */

                <textarea
                  className="air-textarea"
                  value={rawInput}
                  onChange={(event) =>
                    setRawInput(
                      event.target.value
                    )
                  }
                  rows={10}
                  spellCheck={false}
                  placeholder={
                    inputMode === "json"
                      ? `[
  {"age": 30, "income": 50000, "response": 1},
  {"age": 45, "income": 75000, "response": 0}
]`
                      : `age,income,response
30,50000,1
45,75000,0`
                  }
                />
              )}


              {/* ACTIONS */}

              <div className="air-actions">
                <div className="air-actions-left">
                  <button
                    type="button"
                    className="air-button air-button-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="air-spinner" />
                        Generating report...
                      </>
                    ) : (
                      <>
                        <PlayIcon />
                        Run Report
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="air-button air-button-secondary"
                    onClick={handleClear}
                    disabled={loading}
                  >
                    <TrashIcon />
                    Clear
                  </button>
                </div>

                <span className="air-security-note">
                  Your dataset is sent only to the configured
                  analysis API.
                </span>
              </div>
            </div>
          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {result.error && (
            <div
              className="air-error"
              role="alert"
            >
              <span className="air-error-icon">
                <AlertIcon />
              </span>

              <div>
                <p className="air-error-title">
                  Report generation failed
                </p>

                <p className="air-error-message">
                  {result.error}
                </p>
              </div>
            </div>
          )}


          {/* =================================================
              RESULTS
          ================================================= */}

          {result.kind && (
            <>
              <div className="air-results-header">
                <span className="air-results-title">
                  Analysis Results
                </span>

                <span className="air-results-line" />
              </div>


              {/* METRICS */}

              <div className="air-metrics-grid">
                <MetricCard
                  label="Target column"
                  value={result.target}
                  icon={<TargetIcon />}
                  helper="Prediction target"
                />

                <MetricCard
                  label="Task type"
                  value={result.kind}
                  icon={<ActivityIcon />}
                  helper="Detected model type"
                />

                <MetricCard
                  label={metricLabel}
                  value={metricValue}
                  icon={<ChartIcon />}
                  helper="Training performance"
                />
              </div>


              {/* MODEL PATH */}

              {result.model_saved && (
                <div className="air-model-saved">
                  <Badge type="success">
                    <span
                      style={{
                        display: "inline-flex",
                        marginRight: 4,
                      }}
                    >
                      <CheckIcon />
                    </span>
                    Model saved
                  </Badge>

                  <code className="air-model-path">
                    {result.model_saved}
                  </code>
                </div>
              )}


              {/* NARRATIVE REPORT */}

              {result.report && (
                <section className="air-card">
                  <div className="air-card-header">
                    <div className="air-card-heading">
                      <div className="air-heading-icon">
                        <SparklesIcon />
                      </div>

                      <div>
                        <h2 className="air-section-title">
                          Analysis Report
                        </h2>

                        <p className="air-section-description">
                          Generated interpretation of the
                          model and dataset
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="air-copy-button"
                      onClick={handleCopyReport}
                    >
                      {copied ? (
                        <>
                          <CheckIcon />
                          Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="air-report-body">
                    <pre className="air-report-text">
                      {result.report}
                    </pre>
                  </div>
                </section>
              )}


              {/* PREDICTIONS */}

              {preds && (
                <section className="air-card">
                  <div className="air-card-header">
                    <div className="air-card-heading">
                      <div className="air-heading-icon">
                        <ChartIcon />
                      </div>

                      <div>
                        <h2 className="air-section-title">
                          Predictions
                        </h2>

                        <p className="air-section-description">
                          {isProbaBinary
                            ? "Binary classification results and confidence"
                            : "Regression prediction results"}
                        </p>
                      </div>
                    </div>

                    <Badge type="info">
                      {predictionValues.length} rows
                    </Badge>
                  </div>

                  <div className="air-table-wrap">
                    <table className="air-table">
                      <thead>
                        <tr>
                          <th>#</th>

                          {isProbaBinary ? (
                            <>
                              <th>
                                Prediction
                              </th>

                              <th>
                                Probability
                              </th>

                              <th>
                                Confidence
                              </th>
                            </>
                          ) : (
                            <th>
                              Predicted Value
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {predictionValues
                          .slice(0, 50)
                          .map((val, i) => {
                            const proba =
                              isProbaBinary
                                ? preds
                                    .predicted_proba?.[
                                    i
                                  ]
                                : null;

                            const pct =
                              proba != null
                                ? Math.round(
                                    proba * 100
                                  )
                                : null;

                            return (
                              <tr key={i}>
                                <td className="air-row-number">
                                  {i + 1}
                                </td>

                                {isProbaBinary ? (
                                  <>
                                    <td>
                                      <Badge
                                        type={
                                          val === 1
                                            ? "success"
                                            : "danger"
                                        }
                                      >
                                        {val === 1
                                          ? "Positive"
                                          : "Negative"}
                                      </Badge>
                                    </td>

                                    <td className="air-mono">
                                      {typeof proba ===
                                      "number"
                                        ? proba.toFixed(
                                            4
                                          )
                                        : "—"}
                                    </td>

                                    <td>
                                      <div className="air-confidence">
                                        <div className="air-progress">
                                          <div
                                            className={`air-progress-fill ${
                                              val === 1
                                                ? "success"
                                                : "danger"
                                            }`}
                                            style={{
                                              width: `${
                                                pct ??
                                                0
                                              }%`,
                                            }}
                                          />
                                        </div>

                                        <span className="air-confidence-value">
                                          {pct != null
                                            ? `${pct}%`
                                            : "—"}
                                        </span>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <td className="air-mono">
                                    {typeof val ===
                                    "number"
                                      ? val.toFixed(
                                          4
                                        )
                                      : val}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>

                    {predictionValues.length >
                      50 && (
                      <p className="air-table-footer">
                        Showing the first 50 of{" "}
                        {predictionValues.length.toLocaleString()}{" "}
                        prediction rows.
                      </p>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}