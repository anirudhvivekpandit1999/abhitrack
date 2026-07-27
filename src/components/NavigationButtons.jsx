import React from "react";

import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  ArrowBackRounded,
  ArrowForwardRounded,
  LockOutlined,
} from "@mui/icons-material";


/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const COLORS = {
  primary: "#1A2B4B",
  primaryHover: "#13213A",

  blue: "#2563EB",
  blueHover: "#1D4ED8",

  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  borderHover: "#CBD5E1",

  surface: "#F8FAFC",
  white: "#FFFFFF",
};


/* ============================================================================
   NAVIGATION BUTTONS
============================================================================ */

function NavigationButtons({
  onPrevious,
  onNext,

  isLoading = false,

  previousLabel = "Previous Step",
  nextLabel = "Next Step",

  disableNext = false,

  hidePrevious = false,
  hideNext = false,
}) {
  /* ==========================================================================
     STATES
  ========================================================================== */

  const nextDisabled =
    isLoading || disableNext;

  const previousDisabled =
    isLoading;


  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <Box
      component="nav"
      aria-label="Step navigation"
      sx={{
        mt: {
          xs: 4,
          md: 5,
        },

        pt: 2.5,

        borderTop:
          `1px solid ${COLORS.border}`,
      }}
    >
      {/* ======================================================================
          NAVIGATION BAR
      ====================================================================== */}

      <Box
        sx={{
          display: "flex",

          flexDirection: {
            xs: "column-reverse",
            sm: "row",
          },

          alignItems: {
            xs: "stretch",
            sm: "center",
          },

          justifyContent:
            "space-between",

          gap: {
            xs: 1.25,
            sm: 2,
          },
        }}
      >
        {/* ====================================================================
            PREVIOUS
        ==================================================================== */}

        <Box
          sx={{
            minWidth: {
              xs: "100%",
              sm: 160,
            },

            display:
              "flex",

            justifyContent:
              "flex-start",
          }}
        >
          {!hidePrevious && (
            <Button
              variant="outlined"
              onClick={onPrevious}
              disabled={
                previousDisabled
              }
              startIcon={
                <ArrowBackRounded />
              }
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },

                minWidth: {
                  sm: 150,
                },

                minHeight: 44,

                px: 2.25,

                border:
                  `1px solid ${COLORS.border}`,

                borderRadius: 2,

                bgcolor:
                  COLORS.white,

                color:
                  COLORS.textSecondary,

                textTransform:
                  "none",

                fontSize:
                  "0.76rem",

                fontWeight: 700,

                letterSpacing:
                  "-0.005em",

                boxShadow:
                  "0 1px 2px rgba(15, 23, 42, 0.02)",

                transition:
                  "all 160ms ease",

                "& .MuiButton-startIcon":
                  {
                    mr: 0.8,

                    transition:
                      "transform 160ms ease",

                    "& svg": {
                      fontSize: 18,
                    },
                  },

                "&:hover": {
                  bgcolor:
                    COLORS.surface,

                  color:
                    COLORS.primary,

                  borderColor:
                    COLORS.borderHover,

                  boxShadow:
                    "0 3px 8px rgba(15, 23, 42, 0.05)",

                  transform:
                    "translateY(-1px)",

                  "& .MuiButton-startIcon":
                    {
                      transform:
                        "translateX(-2px)",
                    },
                },

                "&.Mui-disabled":
                  {
                    bgcolor:
                      "#FAFAFB",

                    color:
                      "#CBD5E1",

                    borderColor:
                      "#EDF1F5",
                  },
              }}
            >
              {previousLabel}
            </Button>
          )}
        </Box>


        {/* ====================================================================
            STATUS / GUIDANCE
        ==================================================================== */}

        <Box
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },

            flex: 1,

            alignItems:
              "center",

            justifyContent:
              "center",

            px: 2,
          }}
        >
          {isLoading ? (
            <Typography
              variant="caption"
              sx={{
                color:
                  COLORS.textMuted,

                fontSize:
                  "0.62rem",

                fontWeight:
                  600,
              }}
            >
              Processing your
              changes...
            </Typography>
          ) : disableNext ? (
            <Box
              sx={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap: 0.55,
              }}
            >
              <LockOutlined
                sx={{
                  color:
                    COLORS.textMuted,

                  fontSize: 13,
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color:
                    COLORS.textMuted,

                  fontSize:
                    "0.6rem",

                  fontWeight:
                    550,
                }}
              >
                Complete the required
                fields to continue
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color:
                  COLORS.textMuted,

                fontSize:
                  "0.6rem",

                fontWeight:
                  500,
              }}
            >
              Continue when you are
              ready
            </Typography>
          )}
        </Box>


        {/* ====================================================================
            NEXT
        ==================================================================== */}

        <Box
          sx={{
            minWidth: {
              xs: "100%",
              sm: 160,
            },

            display:
              "flex",

            justifyContent:
              "flex-end",
          }}
        >
          {!hideNext && (
            <Button
              variant="contained"
              onClick={onNext}
              disabled={
                nextDisabled
              }
              endIcon={
                isLoading ? (
                  <CircularProgress
                    size={16}
                    thickness={5}
                    color="inherit"
                  />
                ) : (
                  <ArrowForwardRounded />
                )
              }
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },

                minWidth: {
                  sm: 150,
                },

                minHeight: 44,

                px: 2.4,

                borderRadius: 2,

                bgcolor:
                  COLORS.primary,

                color:
                  COLORS.white,

                textTransform:
                  "none",

                fontSize:
                  "0.76rem",

                fontWeight: 750,

                letterSpacing:
                  "-0.005em",

                boxShadow:
                  "0 4px 10px rgba(26, 43, 75, 0.16)",

                transition:
                  "all 160ms ease",

                "& .MuiButton-endIcon":
                  {
                    ml: 0.8,

                    transition:
                      "transform 160ms ease",

                    "& svg": {
                      fontSize: 18,
                    },
                  },

                "&:hover": {
                  bgcolor:
                    COLORS.primaryHover,

                  boxShadow:
                    "0 6px 14px rgba(26, 43, 75, 0.22)",

                  transform:
                    "translateY(-1px)",

                  "& .MuiButton-endIcon":
                    {
                      transform:
                        isLoading
                          ? "none"
                          : "translateX(2px)",
                    },
                },

                "&:active": {
                  transform:
                    "translateY(0)",

                  boxShadow:
                    "0 2px 6px rgba(26, 43, 75, 0.16)",
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
                : nextLabel}
            </Button>
          )}
        </Box>
      </Box>


      {/* ======================================================================
          MOBILE STATUS
      ====================================================================== */}

      {(isLoading ||
        disableNext) && (
        <Box
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },

            mt: 1.25,

            alignItems:
              "center",

            justifyContent:
              "center",

            gap: 0.5,
          }}
        >
          {disableNext &&
            !isLoading && (
              <LockOutlined
                sx={{
                  color:
                    COLORS.textMuted,

                  fontSize: 12,
                }}
              />
            )}

          <Typography
            variant="caption"
            sx={{
              color:
                COLORS.textMuted,

              fontSize:
                "0.58rem",

              textAlign:
                "center",
            }}
          >
            {isLoading
              ? "Processing your changes..."
              : "Complete the required fields to continue"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}


/* ============================================================================
   EXPORT
============================================================================ */

export default NavigationButtons;