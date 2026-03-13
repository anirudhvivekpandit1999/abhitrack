import * as XLSX from "xlsx";

self.onmessage = async (e) => {
  const file = e.data;

  try {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, { type: "array" });
    console.log(workbook)
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const jsonData = XLSX.utils.sheet_to_json(sheet);

    self.postMessage({
      status: "success",
      data: jsonData,
    });

  } catch (error) {
    self.postMessage({
      status: "error",
      message: error.message,
    });
  }
};