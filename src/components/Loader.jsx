import React from "react";

import {
  Box,
  CircularProgress,
  Typography,
  Tooltip,
  Fade,
} from "@mui/material";

import {
  AutoGraphRounded,
} from "@mui/icons-material";


/* ============================================================================
   LOADER
============================================================================ */

const Loader = ({
  size = 42,
  text = "Loading...",
  subtext = "",
  fullScreen = false,
  minHeight = 180,
}) => {

  return (
    <Fade
      in
      timeout={250}
    >
      <Box
        role="status"
        aria-live="polite"
        aria-label={text || "Loading"}
        sx={{
          width: "100%",

          minHeight: fullScreen
            ? "100vh"
            : minHeight,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          px: 2,

          py: 4,

          bgcolor: fullScreen
            ? "#F8FAFC"
            : "transparent",
        }}
      >

        {/* ====================================================================
            LOADER CONTENT
        ==================================================================== */}

        <Box
          sx={{
            display: "flex",

            flexDirection: "column",

            alignItems: "center",

            textAlign: "center",
          }}
        >

          {/* ==================================================================
              LOADER GRAPHIC
          ================================================================== */}

          <Tooltip
            title="Platform engineering by Ekalon Solutions"
            arrow
            placement="top"
          >
            <Box
              sx={{
                position: "relative",

                width: size + 24,

                height: size + 24,

                display: "grid",

                placeItems: "center",

                borderRadius: "50%",

                bgcolor: "#FFFFFF",

                border: "1px solid #E2E8F0",

                boxShadow:
                  "0 6px 20px rgba(15, 23, 42, 0.06)",
              }}
            >

              {/* ==============================================================
                  BACKGROUND TRACK
              ============================================================== */}

              <CircularProgress
                variant="determinate"
                value={100}
                size={size}
                thickness={3.2}
                sx={{
                  position: "absolute",

                  color: "#E8EEF6",
                }}
              />


              {/* ==============================================================
                  ACTIVE SPINNER
              ============================================================== */}

              <CircularProgress
                size={size}
                thickness={3.2}
                sx={{
                  position: "absolute",

                  color: "#2563EB",

                  animationDuration: "900ms",

                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
              />


              {/* ==============================================================
                  CENTER ICON
              ============================================================== */}

              <AutoGraphRounded
                sx={{
                  fontSize: size * 0.36,

                  color: "#64748B",
                }}
              />

            </Box>
          </Tooltip>


          {/* ==================================================================
              LOADING MESSAGE
          ================================================================== */}

          {text && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,

                color: "#334155",

                fontSize: "0.78rem",

                fontWeight: 700,

                lineHeight: 1.5,

                letterSpacing: "0.01em",
              }}
            >
              {text}
            </Typography>
          )}


          {/* ==================================================================
              OPTIONAL SECONDARY MESSAGE
          ================================================================== */}

          {subtext && (
            <Typography
              variant="caption"
              sx={{
                mt: 0.4,

                maxWidth: 300,

                color: "#94A3B8",

                fontSize: "0.64rem",

                lineHeight: 1.5,
              }}
            >
              {subtext}
            </Typography>
          )}


          {/* ==================================================================
              BRANDING
          ================================================================== */}

          <Tooltip
            title="Platform engineering by Ekalon Solutions"
            arrow
            placement="bottom"
          >
            <Box
              sx={{
                mt: 1.6,

                display: "inline-flex",

                alignItems: "center",

                gap: 0.55,

                px: 1,

                py: 0.45,

                border: "1px solid #E8EDF3",

                borderRadius: 10,

                bgcolor: "#FFFFFF",

                cursor: "default",

                transition:
                  "border-color 150ms ease, box-shadow 150ms ease",

                "&:hover": {
                  borderColor: "#CBD5E1",

                  boxShadow:
                    "0 2px 8px rgba(15, 23, 42, 0.05)",
                },
              }}
            >

              <Box
                sx={{
                  width: 5,

                  height: 5,

                  borderRadius: "50%",

                  bgcolor: "#2563EB",
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color: "#94A3B8",

                  fontSize: "0.55rem",

                  fontWeight: 600,

                  letterSpacing: "0.02em",
                }}
              >
                Platform engineering by
              </Typography>

              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: "#64748B",

                  fontSize: "0.55rem",

                  fontWeight: 800,

                  letterSpacing: "0.02em",
                }}
              >
                Ekalon Solutions
              </Typography>

            </Box>
          </Tooltip>

        </Box>
      </Box>
    </Fade>
  );
};


/* ============================================================================
   EXPORT
============================================================================ */

export default Loader;