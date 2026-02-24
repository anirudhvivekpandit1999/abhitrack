import * as XLSX from "xlsx";

self.onmessage = async (e) => {
  const file = e.data;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);

  self.postMessage(json);
};