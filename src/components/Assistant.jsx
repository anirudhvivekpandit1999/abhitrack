import React, { useEffect, useState } from 'react';
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
}) => {
  const [isListening, setIsListening] = useState(propIsListening ?? false);
  const [lastCommand, setLastCommand] = useState(propLastCommand ?? "");
  const [voiceFeedback, setVoiceFeedback] = useState(propVoiceFeedback ?? "");
  const [assistantCollapsed, setAssistantCollapsed] = useState(propAssistantCollapsed ?? false);
  const [recentFiles, setRecentFiles] = useState(propRecentFiles ?? []);
  const [showFileSearchModal, setShowFileSearchModal] = useState(propShowFileSearchModal ?? false);
  const [matchedRecentFiles, setMatchedRecentFiles] = useState(propMatchedRecentFiles ?? []);


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
    if (typeof propRecentFiles !== 'undefined') setRecentFiles(propRecentFiles);
  }, [propRecentFiles]);
  useEffect(() => {
    if (typeof propShowFileSearchModal !== 'undefined') setShowFileSearchModal(propShowFileSearchModal);
  }, [propShowFileSearchModal]);
  useEffect(() => {
    if (typeof propMatchedRecentFiles !== 'undefined') setMatchedRecentFiles(propMatchedRecentFiles);
  }, [propMatchedRecentFiles]);

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

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {lastCommand ? (
              <div className="bg-slate-50 rounded-lg p-2 text-sm">
                <div className="text-xs text-slate-500 mb-1">Last command</div>
                <div className="text-sm text-slate-800">{lastCommand}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">No commands yet. Click the mic and speak.</div>
            )}

            {voiceFeedback && (
              <div className="bg-blue-50 rounded-lg p-2 text-sm">
                <div className="text-xs text-blue-600 font-medium">Feedback</div>
                <div className="text-sm text-blue-800">{voiceFeedback}</div>
              </div>
            )}

            <div>
              <div className="text-xs text-slate-500 mb-2">Recent files</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentFiles.length ? recentFiles.map((f, idx) => (
                  <div key={idx} className="text-xs text-slate-700 truncate">{f}</div>
                )) : <div className="text-xs text-slate-400">— none —</div>}
              </div>
            </div>
          </div>

          <div className="p-3 border-t bg-gradient-to-r from-white to-slate-50">
            <div className="flex gap-2 items-center">
              <input
                value=""
                placeholder="Type a command (optional)"
                className="flex-1 min-w-0 rounded-md border px-3 py-2 text-sm focus:outline-none"
                onChange={() => { }}
              />
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
                <div className="text-sm">No matching files found in recent.</div>
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
