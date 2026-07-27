import React from "react";

import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";

import {
  PlayArrowRounded,
  RestartAltRounded,
  WarningAmberRounded,
  InsertDriveFileOutlined,
  CheckCircleOutlineRounded,
} from "@mui/icons-material";


/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const COLORS = {
  primary: "#1A2B4B",
  primaryHover: "#13213A",

  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  surface: "#F8FAFC",
  white: "#FFFFFF",

  warning: "#D97706",
  warningHover: "#B45309",
  warningBackground: "#FFFBEB",
  warningBorder: "#FDE68A",

  success: "#059669",
  successBackground: "#ECFDF5",
};


/* ============================================================================
   PROCESS FILE BUTTONS
============================================================================ */

const ProcessFileButtons = React.memo(
  ({
    errorType,
    files,
    isLoading,
    onProcessFiles,
    onRemoveColumns,
    onResetErrors,
  }) => {

    /* ========================================================================
       FILE STATE
    ======================================================================== */

    const withoutProductReady =
      Boolean(files?.withoutProduct);

    const withProductReady =
      Boolean(files?.withProduct);

    const bothFilesReady =
      withoutProductReady &&
      withProductReady;


    /* ========================================================================
       ERROR CONTENT
    ======================================================================== */

    const getErrorContent = () => {
      switch (errorType) {
        case "unnamed":
          return {
            title:
              "Unnamed columns detected",

            description:
              "The uploaded files contain unnamed columns. You can remove them automatically and continue processing.",

            buttonLabel:
              "Remove Unnamed Columns & Process",
          };

        case "mismatched":
          return {
            title:
              "Column mismatch detected",

            description:
              "The datasets contain columns that do not match. Remove the mismatched columns to continue with compatible data.",

            buttonLabel:
              "Remove Mismatched Columns & Process",
          };

        default:
          return null;
      }
    };


    const errorContent =
      getErrorContent();


    /* ========================================================================
       PROCESS
    ======================================================================== */

    const handleProcess = () => {
      if (
        !bothFilesReady ||
        isLoading
      ) {
        return;
      }

      onProcessFiles(
        files.withoutProduct,
        files.withProduct,
        false,
        false
      );
    };


    /* ========================================================================
       CORRECT AND PROCESS
    ======================================================================== */

    const handleCorrectAndProcess =
      () => {
        if (
          !errorType ||
          isLoading
        ) {
          return;
        }

        onRemoveColumns(
          errorType
        );
      };


    /* ========================================================================
       RENDER
    ======================================================================== */

    return (
      <Box
        sx={{
          width: "100%",
          mb: 4,
        }}
      >

        {/* ====================================================================
            NORMAL PROCESSING
        ==================================================================== */}

        {!errorType && (
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 2,
                sm: 2.25,
              },

              display: "flex",

              flexDirection: {
                xs: "column",
                sm: "row",
              },

              alignItems: {
                xs: "stretch",
                sm: "center",
              },

              justifyContent:
                "space-between",

              gap: 2,

              border:
                `1px solid ${COLORS.border}`,

              borderRadius: 2.5,

              bgcolor:
                COLORS.white,

              boxShadow:
                "0 3px 12px rgba(15, 23, 42, 0.035)",
            }}
          >

            {/* ================================================================
                INFORMATION
            ================================================================= */}

            <Box
              sx={{
                minWidth: 0,

                display: "flex",

                alignItems:
                  "center",

                gap: 1.25,
              }}
            >

              {/* ICON */}

              <Box
                sx={{
                  width: 40,
                  height: 40,

                  display: "grid",

                  placeItems:
                    "center",

                  flexShrink: 0,

                  borderRadius:
                    1.75,

                  bgcolor:
                    bothFilesReady
                      ? COLORS.successBackground
                      : COLORS.surface,

                  color:
                    bothFilesReady
                      ? COLORS.success
                      : COLORS.textMuted,

                  transition:
                    "background-color 160ms ease, color 160ms ease",
                }}
              >
                {bothFilesReady ? (
                  <CheckCircleOutlineRounded
                    sx={{
                      fontSize: 20,
                    }}
                  />
                ) : (
                  <InsertDriveFileOutlined
                    sx={{
                      fontSize: 20,
                    }}
                  />
                )}
              </Box>


              {/* TEXT */}

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    color:
                      COLORS.textPrimary,

                    fontSize:
                      "0.78rem",

                    fontWeight: 750,

                    lineHeight: 1.35,
                  }}
                >
                  {bothFilesReady
                    ? "Files ready for processing"
                    : "Upload both datasets to continue"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,

                    color:
                      COLORS.textMuted,

                    fontSize:
                      "0.61rem",

                    lineHeight: 1.5,
                  }}
                >
                  {bothFilesReady
                    ? "Both datasets are available and ready for validation and analysis."
                    : "A Without Product and With Product file are required before processing can begin."}
                </Typography>
              </Box>
            </Box>


            {/* ================================================================
                PROCESS BUTTON
            ================================================================= */}

            <Button
              variant="contained"
              onClick={
                handleProcess
              }
              disabled={
                !bothFilesReady ||
                isLoading
              }
              startIcon={
                isLoading ? (
                  <CircularProgress
                    size={16}
                    thickness={5}
                    color="inherit"
                  />
                ) : (
                  <PlayArrowRounded />
                )
              }
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 150,
                },

                minHeight: 42,

                px: 2.25,

                flexShrink: 0,

                borderRadius: 1.75,

                bgcolor:
                  COLORS.primary,

                color:
                  COLORS.white,

                textTransform:
                  "none",

                fontSize:
                  "0.72rem",

                fontWeight: 750,

                boxShadow:
                  "0 4px 10px rgba(26, 43, 75, 0.16)",

                transition:
                  "all 160ms ease",

                "& .MuiButton-startIcon":
                  {
                    mr: 0.7,

                    "& svg": {
                      fontSize: 18,
                    },
                  },

                "&:hover": {
                  bgcolor:
                    COLORS.primaryHover,

                  transform:
                    "translateY(-1px)",

                  boxShadow:
                    "0 6px 14px rgba(26, 43, 75, 0.2)",
                },

                "&:active": {
                  transform:
                    "translateY(0)",
                },

                "&.Mui-disabled":
                  {
                    bgcolor:
                      "#E2E8F0",

                    color:
                      "#94A3B8",

                    boxShadow:
                      "none",
                  },
              }}
            >
              {isLoading
                ? "Processing..."
                : "Process Files"}
            </Button>

          </Paper>
        )}


        {/* ====================================================================
            ERROR RECOVERY
        ==================================================================== */}

        {errorType &&
          errorContent && (
            <Paper
              elevation={0}
              role="alert"
              sx={{
                overflow:
                  "hidden",

                border:
                  `1px solid ${COLORS.warningBorder}`,

                borderRadius: 2.5,

                bgcolor:
                  COLORS.warningBackground,

                boxShadow:
                  "0 3px 12px rgba(146, 64, 14, 0.04)",
              }}
            >

              {/* ==============================================================
                  ERROR CONTENT
              =============================================================== */}

              <Box
                sx={{
                  p: {
                    xs: 2,
                    sm: 2.25,
                  },

                  display: "flex",

                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },

                  alignItems: {
                    xs: "stretch",
                    md: "center",
                  },

                  justifyContent:
                    "space-between",

                  gap: 2,
                }}
              >

                {/* ============================================================
                    MESSAGE
                ============================================================= */}

                <Box
                  sx={{
                    minWidth: 0,

                    display:
                      "flex",

                    alignItems:
                      "flex-start",

                    gap: 1.25,
                  }}
                >

                  <Box
                    sx={{
                      width: 40,
                      height: 40,

                      display:
                        "grid",

                      placeItems:
                        "center",

                      flexShrink: 0,

                      borderRadius:
                        1.75,

                      bgcolor:
                        "#FEF3C7",

                      color:
                        COLORS.warning,
                    }}
                  >
                    <WarningAmberRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  </Box>


                  <Box
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          "#92400E",

                        fontSize:
                          "0.78rem",

                        fontWeight:
                          800,

                        lineHeight:
                          1.35,
                      }}
                    >
                      {
                        errorContent.title
                      }
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,

                        maxWidth:
                          620,

                        color:
                          "#A16207",

                        fontSize:
                          "0.62rem",

                        lineHeight:
                          1.55,
                      }}
                    >
                      {
                        errorContent.description
                      }
                    </Typography>
                  </Box>

                </Box>


                {/* ============================================================
                    ACTIONS
                ============================================================= */}

                <Box
                  sx={{
                    display: "flex",

                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },

                    alignItems:
                      "stretch",

                    gap: 1,

                    flexShrink: 0,
                  }}
                >

                  {/* RESET */}

                  <Button
                    variant="outlined"
                    onClick={
                      onResetErrors
                    }
                    disabled={
                      isLoading
                    }
                    startIcon={
                      <RestartAltRounded />
                    }
                    sx={{
                      minHeight:
                        42,

                      px: 1.8,

                      borderRadius:
                        1.75,

                      borderColor:
                        "#F5C76B",

                      bgcolor:
                        "rgba(255,255,255,0.55)",

                      color:
                        "#92400E",

                      textTransform:
                        "none",

                      fontSize:
                        "0.7rem",

                      fontWeight:
                        700,

                      "& .MuiButton-startIcon":
                        {
                          "& svg":
                            {
                              fontSize:
                                17,
                            },
                        },

                      "&:hover": {
                        borderColor:
                          COLORS.warning,

                        bgcolor:
                          "#FFFFFF",
                      },

                      "&.Mui-disabled":
                        {
                          borderColor:
                            "#FDE68A",

                          color:
                            "#D6B67A",
                        },
                    }}
                  >
                    Reset
                  </Button>


                  {/* FIX + PROCESS */}

                  <Button
                    variant="contained"
                    onClick={
                      handleCorrectAndProcess
                    }
                    disabled={
                      isLoading
                    }
                    startIcon={
                      isLoading ? (
                        <CircularProgress
                          size={16}
                          thickness={5}
                          color="inherit"
                        />
                      ) : (
                        <WarningAmberRounded />
                      )
                    }
                    sx={{
                      minHeight:
                        42,

                      px: 2,

                      borderRadius:
                        1.75,

                      bgcolor:
                        COLORS.warning,

                      color:
                        "#FFFFFF",

                      textTransform:
                        "none",

                      fontSize:
                        "0.7rem",

                      fontWeight:
                        750,

                      boxShadow:
                        "0 4px 10px rgba(217, 119, 6, 0.16)",

                      transition:
                        "all 160ms ease",

                      "& .MuiButton-startIcon":
                        {
                          "& svg":
                            {
                              fontSize:
                                17,
                            },
                        },

                      "&:hover": {
                        bgcolor:
                          COLORS.warningHover,

                        transform:
                          "translateY(-1px)",

                        boxShadow:
                          "0 6px 14px rgba(217, 119, 6, 0.2)",
                      },

                      "&.Mui-disabled":
                        {
                          bgcolor:
                            "#FDE68A",

                          color:
                            "#A16207",

                          boxShadow:
                            "none",
                        },
                    }}
                  >
                    {isLoading
                      ? "Processing..."
                      : errorContent.buttonLabel}
                  </Button>

                </Box>
              </Box>


              {/* ==============================================================
                  PROCESSING INDICATOR
              =============================================================== */}

              {isLoading && (
                <Box
                  sx={{
                    px: 2.25,
                    py: 0.8,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 0.75,

                    borderTop:
                      "1px solid rgba(217, 119, 6, 0.12)",

                    bgcolor:
                      "rgba(255,255,255,0.35)",
                  }}
                >
                  <CircularProgress
                    size={11}
                    thickness={5}
                    sx={{
                      color:
                        COLORS.warning,
                    }}
                  />

                  <Typography
                    sx={{
                      color:
                        "#A16207",

                      fontSize:
                        "0.57rem",

                      fontWeight:
                        600,
                    }}
                  >
                    Correcting the
                    dataset and preparing
                    it for analysis...
                  </Typography>
                </Box>
              )}

            </Paper>
          )}

      </Box>
    );
  }
);


/* ============================================================================
   DISPLAY NAME
============================================================================ */

ProcessFileButtons.displayName =
  "ProcessFileButtons";


/* ============================================================================
   EXPORT
============================================================================ */

export default ProcessFileButtons;