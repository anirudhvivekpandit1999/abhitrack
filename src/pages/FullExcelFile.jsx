import { useEffect, useRef, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as XLSX from "xlsx";

const FullExcelFile = () => {
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedSheetData, setSelectedSheetData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // Update table when sheet changes
  useEffect(() => {
    const foundSheet = excelData.find(s => s.sheetName === selectedSheet);
    setSelectedSheetData(foundSheet ? foundSheet.sheetData : []);
  }, [selectedSheet, excelData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();

    if (["xlsx", "xls"].includes(ext)) {
      const reader = new FileReader();

      reader.onload = (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheets = workbook.SheetNames;
        setSheetNames(sheets);

        // Parse ALL sheets properly
        const allSheetData = sheets.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          return {
            sheetName: sheetName,   // ✅ Correct
            sheetData: jsonData     // ✅ Correct
          };
        });

        setExcelData(allSheetData);
      };

      reader.readAsBinaryString(file);
    } else {
      setError("Unsupported file type");
    }
  };

  return (
    <div
      className={`mx-auto max-w-md rounded-2xl border-2 border-dashed p-8 text-center transition-all
      ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}
      hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg`}
    >
      <CloudUploadIcon className="mb-3 text-[52px] text-slate-700" />

      <div className="text-sm text-slate-700">
        <label
          htmlFor="fileUpload"
          className="cursor-pointer font-semibold text-slate-800 hover:text-blue-600"
        >
          {fileName ? "Change file" : "Upload a file"}
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
          <p className="mt-1 text-xs text-slate-500">or drag and drop</p>
        )}
      </div>

      {fileName && (
        <div className="mt-4 inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {fileName}
        </div>
      )}

      {/* Sheet List */}
      {sheetNames.length > 0 &&
        sheetNames.map((sheet) => (
          <div key={sheet} className="mt-3">
            <button
              onClick={() => setSelectedSheet(sheet)}
              className="block w-full rounded-md bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow hover:bg-slate-100"
            >
              {sheet}
            </button>

            {selectedSheet === sheet && selectedSheetData.length > 0 && (
              <div className="mt-2 max-h-64 overflow-auto rounded-md border border-slate-300 bg-white p-2">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {Object.keys(selectedSheetData[0]).map((key) => (
                        <th
                          key={key}
                          className="border border-slate-300 px-3 py-1 text-left font-semibold text-slate-700"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSheetData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="border border-slate-200 px-3 py-1 text-slate-700"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default FullExcelFile;
