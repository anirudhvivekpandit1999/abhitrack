import { useEffect, useRef, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as XLSX from "xlsx";

const FullExcelFile = () => {
  const [fileName, setFileName] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedSheetData, setSelectedSheetData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const found = excelData.find((s) => s.sheetName === selectedSheet);
    setSelectedSheetData(found ? found.sheetData : []);
  }, [selectedSheet, excelData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      setError("Unsupported file type");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheets = workbook.SheetNames;
      setSheetNames(sheets);

      const parsed = sheets.map((name) => {
        const ws = workbook.Sheets[name];
        return {
          sheetName: name,
          sheetData: XLSX.utils.sheet_to_json(ws, { defval: "" }),
        };
      });

      setExcelData(parsed);
      if (sheets.length > 0) setSelectedSheet(sheets[0]);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed bg-slate-50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg">
        <CloudUploadIcon className="mb-3 text-[52px] text-slate-700" />
        <div className="text-sm">
          <label
            htmlFor="fileUpload"
            className="cursor-pointer font-semibold text-slate-800 hover:text-blue-600"
          >
            {fileName ? "Change file" : "Upload Excel file"}
          </label>
          <input
            id="fileUpload"
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {!fileName && (
            <p className="mt-1 text-xs text-slate-500">or drag & drop</p>
          )}
        </div>
        {fileName && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            {fileName}
          </div>
        )}
      </div>

      {sheetNames.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <div className="mb-2 text-sm font-semibold text-slate-700">
              Sheets
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sheetNames.map((sheet) => (
                <button
                  key={sheet}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition
                    ${
                      selectedSheet === sheet
                        ? "bg-blue-600 text-white shadow"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  {sheet}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {selectedSheetData.length > 0 ? (
              <div className="relative overflow-auto rounded-lg border">
                <div className="absolute right-2 top-2 z-10 rounded bg-slate-800 px-2 py-0.5 text-xs text-white md:hidden">
                  Scroll →
                </div>

                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 shadow-sm">
                    <tr>
                      {Object.keys(selectedSheetData[0]).map((key) => (
                        <th
                          key={key}
                          className="whitespace-nowrap border-b px-4 py-2 text-left font-semibold text-slate-700"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSheetData.map((row, i) => (
                      <tr
                        key={i}
                        className={`${
                          i % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } hover:bg-blue-50`}
                      >
                        {Object.keys(selectedSheetData[0]).map((k, j) => (
                          <td
                            key={j}
                            className="max-w-[240px] truncate whitespace-nowrap border-b px-4 py-2 text-slate-700"
                            title={row[k]}
                          >
                            {row[k]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                No data available for this sheet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullExcelFile;
