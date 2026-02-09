import React, { useEffect, useState, useRef } from 'react';
import MicIcon from '@mui/icons-material/Mic';

const Assistant = ({
  isListening: propIsListening,
  lastCommand: propLastCommand,
  voiceFeedback: propVoiceFeedback,
  assistantCollapsed: propAssistantCollapsed,
  setAssistantCollapsed: propSetAssistantCollapsed,
  startListening: propStartListening,
  stopListening: propStopListening,
  recentFiles: propRecentFiles,
  setRecentFiles: propSetRecentFiles,
  showFileSearchModal: propShowFileSearchModal,
  setShowFileSearchModal: propSetShowFileSearchModal,
  matchedRecentFiles: propMatchedRecentFiles,
  handleDirectFileSelection,
  handleBrowseMoreFiles,
  fileInputRef,
  onAssistantResult,
}) => {
  const [isListening, setIsListening] = useState(propIsListening ?? false);
  const [lastCommand, setLastCommand] = useState(propLastCommand ?? "");
  const [voiceFeedback, setVoiceFeedback] = useState(propVoiceFeedback ?? "");
  const [assistantCollapsed, setAssistantCollapsed] = useState(propAssistantCollapsed ?? false);
  const [showFileSearchModal, setShowFileSearchModal] = useState(propShowFileSearchModal ?? false);
  const [matchedRecentFiles, setMatchedRecentFiles] = useState(propMatchedRecentFiles ?? []);
  const [commandText, setCommandText] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof propIsListening !== 'undefined') setIsListening(propIsListening);
  }, [propIsListening]);
  useEffect(() => {
    if (typeof propLastCommand !== 'undefined') setLastCommand(propLastCommand);
  }, [propLastCommand]);
  useEffect(() => {
    if (typeof propVoiceFeedback !== 'undefined') setVoiceFeedback(propVoiceFeedback);
  }, [propVoiceFeedback]);
  useEffect(() => {
    if (typeof propAssistantCollapsed !== 'undefined') setAssistantCollapsed(propAssistantCollapsed);
  }, [propAssistantCollapsed]);
  useEffect(() => {
    if (typeof propShowFileSearchModal !== 'undefined') setShowFileSearchModal(propShowFileSearchModal);
  }, [propShowFileSearchModal]);
  useEffect(() => {
    if (typeof propMatchedRecentFiles !== 'undefined') setMatchedRecentFiles(propMatchedRecentFiles);
  }, [propMatchedRecentFiles]);

  useEffect(() => {
    if (typeof propLastCommand !== "undefined" && propLastCommand && String(propLastCommand).trim()) {
      const t = String(propLastCommand).trim();
      setMessages((m) => [...m, { from: "user", text: t }]);
      predictIntent(t, true);
    }
  }, [propLastCommand]);

  useEffect(() => {
    if (containerRef.current) {
      try {
        containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
      } catch (e) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const toggleListening = () => {
    if (propStartListening && propStopListening) {
      if (isListening) propStopListening();
      else propStartListening();
    } else {
      setIsListening((s) => !s);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setShowFileSearchModal(true);
    }
  };

  const handleCloseModal = () => {
    if (propSetShowFileSearchModal) propSetShowFileSearchModal(false);
    setShowFileSearchModal(false);
  };

  const RESPONSE_MAP = {
    upload_file: "I'll help you upload a file. Please select your Excel spreadsheet.",
    select_base_sheet: "Great! I've selected this sheet as the base. What would you like to do next?",
    enter_preprocess: "Moving to preprocessing step. Let's prepare your data.",
    name_new_sheet: "Please enter a name for your new sheet.",
    set_row_range: "Select the row range you want to keep (start row - end row).",
    select_x_axis: "Which column should be used for the X-axis?",
    select_y_axis: "Which column should be used for the Y-axis?",
    open_column_builder: "Opening formula builder. You can create custom calculated columns.",
    add_formula_column: "Enter your formula. You can reference columns like [ColumnA] + [ColumnB]",
    submit_sheet: "Saving your sheet configuration...",
    go_to_results: "Taking you to the results page to review your processed data.",
    cancel: "Canceling operation. Going back to the previous step."
  };

  function inferIntentsFromText(text) {
    const t = (text || "").toLowerCase();
    const inferred = [];
    if (/\b(upload|excel|import|browse|add a file|open my spreadsheet|choose a file|load excel)\b/.test(t)) {
      inferred.push({ intent: "upload_file", confidence: 1.0, matches: 1, response: RESPONSE_MAP.upload_file });
    }
    if (/\b(select base|select the base|base sheet|set as base|choose the base|as\s+)\b/.test(t)) {
      inferred.push({ intent: "select_base_sheet", confidence: 1.0, matches: 1, response: RESPONSE_MAP.select_base_sheet });
    }
    if (/\b(name|named|rename|sheet name)\b/.test(t)) {
      inferred.push({ intent: "name_new_sheet", confidence: 0.9, matches: 1, response: RESPONSE_MAP.name_new_sheet });
    }
    if (/\b(preprocess|pre-processing|pre process)\b/.test(t)) {
      inferred.push({ intent: "enter_preprocess", confidence: 0.9, matches: 1, response: RESPONSE_MAP.enter_preprocess });
    }
    if (/\b(formula|add formula|formula column|column builder)\b/.test(t)) {
      inferred.push({ intent: "add_formula_column", confidence: 0.9, matches: 1, response: RESPONSE_MAP.add_formula_column });
    }
    return inferred;
  }

  async function predictIntent(text, executeActions = false) {
    if (!text || !text.trim()) return null;
    try {
      setSending(true);
      const resp = await fetch("http://127.0.0.1:8000/predict-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      console.log("Intent API response:", resp);
      const serverIntents = (data?.intents || []).map(i => ({
        intent: i.intent,
        confidence: i.confidence ?? 0,
        matches: i.matches ?? 0,
        response: i.response ?? RESPONSE_MAP[i.intent] ?? i.intent
      }));
      const inferred = inferIntentsFromText(text);
      const mergedMap = new Map();
      inferred.forEach(i => {
        if (!mergedMap.has(i.intent)) mergedMap.set(i.intent, i);
      });
      serverIntents.forEach(i => mergedMap.set(i.intent, i));
      const preferredOrder = ["upload_file", "select_base_sheet", "name_new_sheet", "enter_preprocess", "add_formula_column"];
      const merged = [];
      preferredOrder.forEach(key => { if (mergedMap.has(key)) merged.push(mergedMap.get(key)); });
      mergedMap.forEach((v, k) => { if (!preferredOrder.includes(k)) merged.push(v); });
      const intentsToShow = merged;
      let assistantResp = "Hey, I’m the AbhiStat assistant 👋";
      if (intentsToShow.length > 0) {
        const intentNames = intentsToShow.map(i => i.intent.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
        assistantResp += "\n\nFrom your text, I detected the following intents:\n";
        intentNames.forEach((name) => { assistantResp += `• ${name}\n`; });
        const mixed = intentsToShow.map(i => i.response || i.intent).join(" | ");
        assistantResp += `\n\nMixed response: ${mixed}`;
      } else if (data?.response) {
        assistantResp += `\n\n${data.response}`;
      } else {
        assistantResp += "\n\nI couldn’t clearly detect an action.";
      }
      setMessages((m) => [...m, { from: "assistant", text: assistantResp }]);
      if (executeActions && typeof onAssistantResult === "function") {
        try {
          onAssistantResult(data, text);
        } catch (err) {
          console.error("onAssistantResult threw:", err);
        }
      }
      return data;
    } catch (err) {
      console.error("Intent API error:", err);
      setMessages((m) => [
        ...m,
        { from: "assistant", text: "Sorry — couldn't reach the intent service." },
      ]);
      return null;
    } finally {
      setSending(false);
    }
  }

  function handleSendClick() {
    const t = (commandText || "").trim();
    if (!t) return;
    setMessages((m) => [...m, { from: "user", text: t }]);
    predictIntent(t, true);
    setCommandText("");
  }

  return (
    <>
      {assistantCollapsed ? (
        <div className="hidden md:flex fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
          <button
            onClick={() => {
              if (propSetAssistantCollapsed) propSetAssistantCollapsed(false);
              else setAssistantCollapsed(false);
            }}
            aria-label="Open Assistant"
            className="w-12 h-12 rounded-l-lg bg-blue-600 text-white shadow-md flex items-center justify-center px-3 transform transition-all duration-300 hover:scale-105"
          >
            💬
          </button>
        </div>
      ) : (
        <aside className="w-64 hidden md:flex flex-col border-l bg-gradient-to-b from-white to-slate-50 shadow-xl h-[calc(100vh-12rem)] fixed right-0 top-20 z-40 transform transition-all duration-300 ease-in-out translate-x-0 rounded-l-lg" style={{ animation: 'subtle-pop 300ms ease-out both' }}>
          <div className="p-3 border-b font-semibold text-slate-700 bg-gradient-to-r from-white to-slate-50 flex items-center justify-between">
            <div>Assistant</div>
            <button
              onClick={() => {
                if (propSetAssistantCollapsed) propSetAssistantCollapsed(true);
                else setAssistantCollapsed(true);
              }}
              aria-label="Collapse Assistant"
              className="text-sm text-slate-500 px-2 py-1 rounded hover:bg-slate-100"
            >
              ◀
            </button>
          </div>

          <div ref={containerRef} className="flex-1 p-3 overflow-y-auto space-y-3">
            {lastCommand ? (
              <div className="bg-slate-50 rounded-lg p-2 text-xs">
                <div className="text-[11px] text-slate-500 mb-1">Last command</div>
                <div className="text-xs text-slate-800">{lastCommand}</div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500">No commands yet. Click the mic and speak.</div>
            )}

            {voiceFeedback && (
              <div className="bg-blue-50 rounded-lg p-2 text-xs">
                <div className="text-[11px] text-blue-600 font-medium">Feedback</div>
                <div className="text-xs text-blue-800">{voiceFeedback}</div>
              </div>
            )}

            <div className="pt-2">
              {messages.length ? messages.map((m, i) => (
                <div key={i} className={`mb-2 ${m.from === "user" ? "text-right" : "text-left"}`}>
                  {m.from === "user" ? (
                    <div style={{ backgroundColor: '#02008a', color: '#ffffff' }} className="inline-block max-w-full break-words px-2 py-1 rounded text-xs">
                      {m.text}
                    </div>
                  ) : (
                    <div className="inline-block max-w-full break-words px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs border border-slate-300">
                      {m.text}
                    </div>
                  )}
                </div>
              )) : null}
            </div>
          </div>

          <div className="p-3 border-t bg-gradient-to-r from-white to-slate-50">
            <div className="flex gap-2 items-center">
              <input
                value={commandText}
                placeholder="Type a command (optional)"
                className="flex-1 min-w-0 rounded-md border px-3 py-2 text-sm focus:outline-none"
                onChange={(e) => setCommandText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendClick();
                  }
                }}
              />
              <button
                onClick={handleSendClick}
                className="ml-2 px-3 py-2 rounded bg-slate-800 text-white text-sm"
                disabled={sending}
              >
                {sending ? "Sending..." : "Send"}
              </button>
              <button
                onClick={toggleListening}
                className={`flex items-center gap-1 shrink-0 rounded-md px-2 py-1 text-sm font-medium ${isListening ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}
              >
                <MicIcon fontSize="small" />
                <span className="whitespace-nowrap">{isListening ? "Listening" : "Speak"}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {showFileSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-900">Find File</h2>
              <p className="text-sm text-slate-600 mt-1">Searching for: <span className="font-semibold text-blue-600">{''}</span></p>
            </div>

            {matchedRecentFiles.length > 0 ? (
              <div className="p-4">
                <div className="text-xs font-semibold text-slate-700 mb-2">Matching Files:</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matchedRecentFiles.map((file) => (
                    <button
                      key={file}
                      onClick={() => (handleDirectFileSelection ? handleDirectFileSelection(file) : null)}
                      className="w-full text-left p-3 rounded-md hover:bg-blue-50 border border-slate-200 hover:border-blue-400 transition"
                    >
                      <div className="font-medium text-slate-800">{file}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500">
                <div className="text-sm">No matching files found.</div>
              </div>
            )}

            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => (handleBrowseMoreFiles ? handleBrowseMoreFiles() : openFilePicker())}
                className="flex-1 bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition"
              >
                Browse Files
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-slate-200 text-slate-800 rounded-md py-2 font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Assistant;
