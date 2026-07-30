import React, { useEffect, useState, useRef } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

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
  const [assistantCollapsed, setAssistantCollapsed] = useState(propAssistantCollapsed ?? true);
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

  function extractEntities(text) {
  const lower = text.toLowerCase();
  const entities = {};

  const baseSheetMatch =
    lower.match(/base sheet (as|to|is)?\s*["']?([a-z0-9 _-]+)/i) ||
    lower.match(/select sheet (as|to)?\s*["']?([a-z0-9 _-]+)/i);

  if (baseSheetMatch) entities.sheet_name = baseSheetMatch[2].trim();

  const newSheetMatch =
    lower.match(/new sheet name (as|to|is)?\s*["']?([a-z0-9 _-]+)/i) ||
    lower.match(/name (the )?sheet (as|to)?\s*["']?([a-z0-9 _-]+)/i);

  if (newSheetMatch)
    entities.new_sheet_name = newSheetMatch[3]?.trim() || newSheetMatch[2]?.trim();

  return entities;
}

const REQUIRED_PARAMS = {
  select_base_sheet: ["sheet_name"],
  name_new_sheet: ["new_sheet_name"],
};

function askForMissingParams(action) {
  const questions = {
    sheet_name: "Which sheet should I select as the base sheet?",
    new_sheet_name: "What should be the name of the new sheet?"
  };

  const missing = REQUIRED_PARAMS[action.type].filter(p => !action.params[p]);
  const msg = missing.map(p => questions[p]).join("\n");

  setMessages(m => [...m, { from: "assistant", text: msg }]);
}
async function executeAction(action) {
  switch (action.type) {
    case "upload_file":
      return handleFileUpload();

    case "select_base_sheet":
      return selectBaseSheet(action.params.sheet_name);

    case "name_new_sheet":
      return createNewSheet(action.params.new_sheet_name);

    default:
      console.warn("Unknown action:", action);
  }
}

async function processActionQueue(queue) {
  if (!queue.length) return;

  const current = queue[0];
  const required = REQUIRED_PARAMS[current.type] || [];
  const missing = required.filter(p => !current.params[p]);

  if (missing.length > 0) {
    askForMissingParams(current);
    return; // WAIT for user reply
  }

  await executeAction(current);
  queue.shift(); // remove completed
  processActionQueue(queue); // continue next
}


let actionQueue = [];




  async function predictIntent(text, executeActions = false) {
    if (!text || !text.trim()) return null;
    try {
      setSending(true);
      const resp = await fetch("https://abhistatchatbot.onrender.com/predict-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      console.log("Intent API response:", data);
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
        <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-50">
          <button
            onClick={() => {
              if (propSetAssistantCollapsed) propSetAssistantCollapsed(false);
              else setAssistantCollapsed(false);
            }}
            aria-label="Open AbhiStat Assistant"
            className="group relative w-14 h-14 rounded-l-2xl bg-slate-950 text-white shadow-[0_14px_40px_rgba(15,23,42,0.28)] flex items-center justify-center transition-all duration-300 hover:w-16 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <AutoAwesomeRoundedIcon fontSize="small" />
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 translate-x-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 shadow-lg">
              Open Assistant
            </span>
          </button>
        </div>
      ) : (
        <aside
          className="hidden md:flex flex-col fixed right-4 top-24 bottom-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl"
          style={{ animation: 'subtle-pop 260ms ease-out both' }}
        >
          <div className="relative overflow-hidden border-b border-slate-100 bg-white px-4 py-4">
            <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-blue-50" />
            <div className="pointer-events-none absolute right-20 -top-16 h-24 w-24 rounded-full bg-violet-50" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-bold tracking-tight text-slate-900">
                      AbhiStat Assistant
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    Data workflow copilot
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (propSetAssistantCollapsed) propSetAssistantCollapsed(true);
                  else setAssistantCollapsed(true);
                }}
                aria-label="Collapse Assistant"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              >
                <KeyboardArrowRightRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/80 via-white to-white px-4 py-4"
          >
            {messages.length === 0 && !lastCommand && !voiceFeedback ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <AutoAwesomeRoundedIcon />
                </div>
                <h3 className="text-sm font-bold text-slate-900">How can I help?</h3>
                <p className="mt-1.5 max-w-[260px] text-xs leading-5 text-slate-500">
                  Ask me to upload a spreadsheet, select a base sheet, preprocess data, or create a formula column.
                </p>

                <div className="mt-5 grid w-full gap-2">
                  {[
                    "Upload an Excel file",
                    "Select a base sheet",
                    "Create a formula column"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setCommandText(suggestion)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {lastCommand && (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Last voice command
                    </div>
                    <div className="text-xs leading-5 text-slate-700">{lastCommand}</div>
                  </div>
                )}

                {voiceFeedback && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                      <MicIcon sx={{ fontSize: 13 }} />
                      Voice feedback
                    </div>
                    <div className="text-xs leading-5 text-blue-900">{voiceFeedback}</div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.from === "assistant" && (
                      <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />
                      </div>
                    )}

                    <div
                      className={
                        m.from === "user"
                          ? "max-w-[82%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-blue-700 px-3.5 py-2.5 text-xs leading-5 text-white shadow-sm"
                          : "max-w-[82%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-5 text-slate-700 shadow-sm"
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-white p-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <textarea
                value={commandText}
                rows={2}
                placeholder="Ask AbhiStat to do something..."
                className="block max-h-28 min-h-[48px] w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400"
                onChange={(e) => setCommandText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendClick();
                  }
                }}
              />

              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={openFilePicker}
                    aria-label="Attach or browse file"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
                  >
                    <AttachFileRoundedIcon fontSize="small" />
                  </button>

                  <button
                    onClick={toggleListening}
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                    className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition ${
                      isListening
                        ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100"
                        : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                    }`}
                  >
                    <MicIcon fontSize="small" />
                    {isListening ? "Listening..." : "Voice"}
                  </button>
                </div>

                <button
                  onClick={handleSendClick}
                  disabled={sending || !commandText.trim()}
                  aria-label="Send command"
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span>Send</span>
                  <SendRoundedIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line</span>
              <span className="text-[10px] font-medium text-slate-400">AbhiStat AI</span>
            </div>
          </div>
        </aside>
      )}

      {showFileSearchModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <InsertDriveFileRoundedIcon fontSize="small" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-slate-900">Find a file</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Choose a matching recent file or browse your computer.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                aria-label="Close file search"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-4">
              {matchedRecentFiles.length > 0 ? (
                <div className="space-y-2">
                  <div className="px-1 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Matching files
                  </div>
                  {matchedRecentFiles.map((file) => (
                    <button
                      key={file}
                      onClick={() => (handleDirectFileSelection ? handleDirectFileSelection(file) : null)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-white group-hover:text-blue-700">
                        <InsertDriveFileRoundedIcon sx={{ fontSize: 19 }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-800">{file}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">Recent file</div>
                      </div>
                      <KeyboardArrowRightRoundedIcon className="text-slate-300 transition group-hover:text-blue-500" fontSize="small" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <InsertDriveFileRoundedIcon />
                  </div>
                  <div className="text-sm font-semibold text-slate-700">No matching files</div>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                    Browse your computer to select the spreadsheet you want to use.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
              <button
                onClick={() => (handleBrowseMoreFiles ? handleBrowseMoreFiles() : openFilePicker())}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <AttachFileRoundedIcon fontSize="small" />
                Browse Files
              </button>
              <button
                onClick={handleCloseModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
