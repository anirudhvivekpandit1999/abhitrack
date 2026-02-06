export const ASSISTANT_SCHEMA = {
  version: "1.0",

  context: {
    appName: "Abhistat Assistant",
    description:
      "Voice + text assistant for uploading, preprocessing, creating sheets, building columns, plotting and submitting Excel-based workflows"
  },

  // NOTE: paramTypes "runtime" means the value comes from React state (columns/sheets),
  // not trained values. Use <placeholder> in examples.
  actions: {
    // 1. Upload file (you said FullExcelFile.jsx already implements this)
    upload_file: {
      description: "Uploads an Excel file into the app (entry point).",
      requiredParams: ["file"],
      paramTypes: { file: "attachment" },
      optionalParams: [],
      examples: [
        "upload file",
        "choose file",
        "open my spreadsheet",
        "browse and upload an excel file"
      ]
    },

    // Activation: wake word + immediate listen
    wake_listen: {
      description:
        "Wake assistant with custom phrase and start listening (wake-word). Example wake-word: 'hey abhistat' or 'hey, abhistat'.",
      requiredParams: [],
      optionalParams: ["wakePhrase"],
      paramTypes: { wakePhrase: "static" },
      examples: [
        "hey abhistat",
        "hey, abhistat",
        "abhistat listen",
        "okay abhistat"
      ]
    },

    // 2. Move to preprocessing / add-new-sheet screen (and 'next' shortcut after upload)
    enter_preprocess: {
      description:
        "Open or move focus to the preprocessing / new-sheet creation area. Triggered automatically after upload or when user says 'next'.",
      requiredParams: [],
      optionalParams: ["viaNext"],
      paramTypes: { viaNext: "boolean" },
      examples: [
        "next",
        "go to preprocessing",
        "open new sheet creation",
        "open add sheet"
      ]
    },

    // 3. Create / name new sheet (user names the new sheet)
    name_new_sheet: {
      description: "Create or name the new sheet that will be generated.",
      requiredParams: ["sheetName"],
      paramTypes: { sheetName: "runtime" },
      optionalParams: [],
      examples: [
        "name new sheet sales_2025",
        "create sheet named summary",
        "call the new sheet cleaned_data",
        "set name to <sheetName>"
      ]
    },

    // 4. Select base sheet (dropdown from uploaded Excel)
    select_base_sheet: {
      description:
        "Select the base/origin sheet from the uploaded workbook that will be used to create new sheets.",
      requiredParams: ["baseSheetName"],
      paramTypes: { baseSheetName: "runtime" },
      optionalParams: [],
      examples: [
        "select sheet 'Sheet1'",
        "use the sheet called data",
        "pick base sheet sales_raw",
        "set base sheet to <sheetName>"
      ]
    },

    // 5. Set names for the two target sheets (default two sheets)
    name_target_sheets: {
      description: "Name the two target sheets that will be created from the base sheet.",
      requiredParams: ["firstSheetName", "secondSheetName"],
      paramTypes: { firstSheetName: "runtime", secondSheetName: "runtime" },
      optionalParams: [],
      examples: [
        "name the two sheets as training and test",
        "call one sheet analysis and the other results",
        "first sheet named X and second named Y"
      ]
    },

    // 6. Set row range (trim by row range or date range)
    set_row_range: {
      description:
        "Trim the base sheet by row indices or by date start/end. Accepts row numbers or date-based ranges.",
      requiredParams: ["start", "end"],
      paramTypes: { start: "runtime", end: "runtime" },
      optionalParams: ["byDate"],
      examples: [
        "trim rows 10 to 200",
        "start from row 5 end at row 100",
        "trim from 1 to 500",
        "use records from January 1 2022 to December 31 2022"
      ]
    },

    // 7. Select X axis column (for scatter)
    select_x_axis: {
      description:
        "Select a column to use as X axis for scatter plot/preview. Column is dynamic (comes from sheet).",
      requiredParams: ["xColumn"],
      paramTypes: { xColumn: "runtime" },
      optionalParams: [],
      examples: [
        "select x axis time",
        "set x to <column>",
        "use date as x",
        "pick time column for x"
      ]
    },

    // 8. Select Y axis column (for scatter)
    select_y_axis: {
      description: "Select column to use as Y axis for scatter plot/preview.",
      requiredParams: ["yColumn"],
      paramTypes: { yColumn: "runtime" },
      optionalParams: [],
      examples: [
        "select y axis temperature",
        "set y to speed",
        "use pressure as y",
        "choose <column> for y"
      ]
    },

    // 9. Replace target sheet with selected sheet directly (if user says 'select this sheet directly')
    replace_sheet_with_selected: {
      description:
        "Replace a target sheet (or x/y axis sheet) with a selected existing sheet immediately.",
      requiredParams: ["targetSheetName", "replacementSheetName"],
      paramTypes: { targetSheetName: "runtime", replacementSheetName: "runtime" },
      optionalParams: [],
      examples: [
        "replace sheet1 with cleaned_data",
        "set the first sheet to sheet2",
        "select this sheet directly for the new sheet"
      ]
    },

    // 10. From scatter choose to include/exclude columns for new sheet
    choose_column_for_new_sheet: {
      description:
        "Select or deselect columns to include in the new sheet (can be used after scatter preview).",
      requiredParams: ["columnName", "include"],
      paramTypes: { columnName: "runtime", include: "boolean" },
      optionalParams: [],
      examples: [
        "include temperature in new sheet",
        "exclude humidity from new sheet",
        "add time column to my sheet",
        "remove speed column"
      ]
    },

    // 11. Open column builder
    open_column_builder: {
      description: "Open the column builder UI to add computed columns or formulas.",
      requiredParams: [],
      optionalParams: [],
      examples: [
        "open column builder",
        "open formula editor",
        "add formula column",
        "create calculated column"
      ]
    },

    // 12. Add formula column (submit formula to column builder)
    add_formula_column: {
      description:
        "Add a new column using a formula provided by the user or a named template.",
      requiredParams: ["formula", "newColumnName"],
      paramTypes: { formula: "freeText", newColumnName: "runtime" },
      optionalParams: [],
      examples: [
        "add column 'avg_temp' as (temp1+temp2)/2",
        "create column called diff = colA - colB",
        "new column name total and formula sum(a,b)"
      ]
    },

    // 13. Submit sheet (finalize the created sheet)
    submit_sheet: {
      description: "Submit and save the newly created/preprocessed sheet into the workbook.",
      requiredParams: ["sheetName"],
      paramTypes: { sheetName: "runtime" },
      optionalParams: [],
      examples: [
        "submit sheet",
        "save this sheet",
        "submit cleaned_data",
        "finish and save the sheet"
      ]
    },

    // 14. Go to results / data-check page
    go_to_results: {
      description: "Navigate to the results page (data-check / analysis) for the processed sheets.",
      requiredParams: [],
      optionalParams: ["targetPage"],
      paramTypes: { targetPage: "static" },
      examples: [
        "go to results",
        "open data check",
        "show me results",
        "take me to data-check page"
      ]
    },

    // 15. Generic fallback / confirm (low-confidence handling)
    confirm_action: {
      description:
        "Ask user for confirmation when the assistant is not confident or when multiple matches exist.",
      requiredParams: ["message"],
      paramTypes: { message: "freeText" },
      optionalParams: [],
      examples: [
        "did you mean select column time or timestamp?",
        "i found multiple sheets — which one?"
      ]
    },

    // 16. Cancel / back
    cancel: {
      description: "Cancel current action or go back one step.",
      requiredParams: [],
      optionalParams: [],
      examples: ["cancel", "go back", "undo", "stop"]
    }
  }
};
