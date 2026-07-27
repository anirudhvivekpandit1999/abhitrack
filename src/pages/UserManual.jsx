import React, { useState } from "react";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";

import {
  ArrowBackRounded,
  DescriptionRounded,
  LaunchRounded,
  MenuBookRounded,
  RefreshRounded,
  VerifiedRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#0B1F33",
  navyLight: "#12314D",

  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueSoft: "#EFF6FF",

  green: "#16A34A",
  greenSoft: "#F0FDF4",

  text: "#172033",
  muted: "#667085",
  subtle: "#98A2B3",

  border: "#E4E7EC",
  surface: "#F7F9FC",

  white: "#FFFFFF",
};

const MANUAL_URL = "/manual/index.html";

/* =========================================================
   USER MANUAL
========================================================= */

function UserManual() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    setLoading(true);

    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    window.open(
      MANUAL_URL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",

        bgcolor: COLORS.surface,

        py: {
          xs: 2,
          sm: 3,
          md: 4,
        },

        backgroundImage: `
          linear-gradient(
            ${alpha(COLORS.navy, 0.022)} 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            ${alpha(COLORS.navy, 0.022)} 1px,
            transparent 1px
          )
        `,

        backgroundSize: "42px 42px",
      }}
    >
      <Container maxWidth="xl">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <Box
          sx={{
            mb: 3,

            display: "flex",

            flexDirection: {
              xs: "column",
              md: "row",
            },

            alignItems: {
              xs: "flex-start",
              md: "center",
            },

            justifyContent: "space-between",

            gap: 2,
          }}
        >
          {/* LEFT */}

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Box
              sx={{
                width: {
                  xs: 48,
                  sm: 54,
                },

                height: {
                  xs: 48,
                  sm: 54,
                },

                flexShrink: 0,

                display: "grid",
                placeItems: "center",

                borderRadius: "14px",

                bgcolor: COLORS.blueSoft,

                border: `1px solid ${alpha(
                  COLORS.blue,
                  0.1
                )}`,

                color: COLORS.blue,
              }}
            >
              <MenuBookRounded
                sx={{
                  fontSize: {
                    xs: 25,
                    sm: 28,
                  },
                }}
              />
            </Box>

            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  component="h1"
                  sx={{
                    color: COLORS.text,

                    fontSize: {
                      xs: "1.45rem",
                      sm: "1.7rem",
                    },

                    fontWeight: 800,

                    letterSpacing: "-0.03em",
                  }}
                >
                  AbhiStat User Manual
                </Typography>

                <Chip
                  icon={
                    <VerifiedRounded
                      sx={{
                        fontSize: "14px !important",
                      }}
                    />
                  }
                  label="Official Guide"
                  size="small"
                  sx={{
                    height: 25,

                    bgcolor: COLORS.greenSoft,
                    color: COLORS.green,

                    border: `1px solid ${alpha(
                      COLORS.green,
                      0.15
                    )}`,

                    fontSize: "0.62rem",
                    fontWeight: 700,

                    "& .MuiChip-icon": {
                      color: COLORS.green,
                    },
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 0.35,

                  color: COLORS.muted,

                  fontSize: {
                    xs: "0.76rem",
                    sm: "0.8rem",
                  },

                  lineHeight: 1.5,
                }}
              >
                Documentation, instructions and guidance
                for using the AbhiStat platform.
              </Typography>
            </Box>
          </Stack>

          {/* RIGHT ACTIONS */}

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackRounded />}
              onClick={handleGoBack}
              sx={{
                minHeight: 40,

                px: 2,

                borderRadius: "9px",

                borderColor: COLORS.border,

                color: COLORS.text,

                bgcolor: COLORS.white,

                textTransform: "none",

                fontSize: "0.75rem",
                fontWeight: 700,

                "&:hover": {
                  bgcolor: "#F8FAFC",

                  borderColor: "#C8CDD5",
                },
              }}
            >
              Go Back
            </Button>

            <Button
              variant="outlined"
              startIcon={<LaunchRounded />}
              onClick={handleOpenNewTab}
              sx={{
                minHeight: 40,

                px: 2,

                borderRadius: "9px",

                borderColor: COLORS.border,

                color: COLORS.text,

                bgcolor: COLORS.white,

                textTransform: "none",

                fontSize: "0.75rem",
                fontWeight: 700,

                "&:hover": {
                  bgcolor: "#F8FAFC",

                  borderColor: "#C8CDD5",
                },
              }}
            >
              Open Full Screen
            </Button>
          </Stack>
        </Box>

        {/* =================================================
            MANUAL WINDOW
        ================================================= */}

        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",

            borderRadius: {
              xs: "14px",
              sm: "18px",
            },

            bgcolor: COLORS.white,

            border: `1px solid ${COLORS.border}`,

            boxShadow: `
              0 16px 40px rgba(16, 24, 40, 0.06),
              0 2px 6px rgba(16, 24, 40, 0.03)
            `,
          }}
        >

          {/* =================================================
              DOCUMENT TOOLBAR
          ================================================= */}

          <Box
            sx={{
              minHeight: 58,

              px: {
                xs: 2,
                sm: 2.5,
              },

              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",

              gap: 2,

              borderBottom: `1px solid ${COLORS.border}`,

              bgcolor: "#FFFFFF",
            }}
          >
            {/* Document information */}

            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              sx={{
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,

                  flexShrink: 0,

                  display: "grid",
                  placeItems: "center",

                  borderRadius: "8px",

                  bgcolor: COLORS.blueSoft,

                  color: COLORS.blue,
                }}
              >
                <DescriptionRounded
                  sx={{
                    fontSize: 18,
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
                    color: COLORS.text,

                    fontSize: "0.77rem",
                    fontWeight: 700,

                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  AbhiStat Documentation
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,

                      borderRadius: "50%",

                      bgcolor: COLORS.green,
                    }}
                  />

                  <Typography
                    sx={{
                      color: COLORS.subtle,

                      fontSize: "0.62rem",
                    }}
                  >
                    Available
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Toolbar actions */}

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              <Tooltip title="Reload manual">
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,

                    color: COLORS.muted,

                    borderRadius: "8px",

                    "&:hover": {
                      color: COLORS.blue,
                      bgcolor: COLORS.blueSoft,
                    },
                  }}
                >
                  <RefreshRounded
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </IconButton>
              </Tooltip>

              <Tooltip title="Open in new tab">
                <IconButton
                  onClick={handleOpenNewTab}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,

                    color: COLORS.muted,

                    borderRadius: "8px",

                    "&:hover": {
                      color: COLORS.blue,
                      bgcolor: COLORS.blueSoft,
                    },
                  }}
                >
                  <LaunchRounded
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* =================================================
              DOCUMENT VIEWER
          ================================================= */}

          <Box
            sx={{
              position: "relative",

              height: {
                xs: "72vh",
                sm: "76vh",
                md: "78vh",
              },

              minHeight: {
                xs: 500,
                md: 620,
              },

              bgcolor: "#FFFFFF",
            }}
          >

            {/* Loading overlay */}

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,

                  zIndex: 2,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  bgcolor: COLORS.white,
                }}
              >
                <Stack
                  spacing={2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 58,
                      height: 58,

                      display: "grid",
                      placeItems: "center",

                      borderRadius: "16px",

                      bgcolor: COLORS.blueSoft,

                      color: COLORS.blue,
                    }}
                  >
                    <MenuBookRounded
                      sx={{
                        fontSize: 28,
                      }}
                    />
                  </Box>

                  <CircularProgress
                    size={26}
                    thickness={4}
                    sx={{
                      color: COLORS.blue,
                    }}
                  />

                  <Box
                    sx={{
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        color: COLORS.text,

                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      Loading User Manual
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,

                        color: COLORS.subtle,

                        fontSize: "0.68rem",
                      }}
                    >
                      Preparing AbhiStat documentation...
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Manual */}

            <Box
              component="iframe"
              key={iframeKey}
              title="AbhiStat User Manual"
              src={MANUAL_URL}
              onLoad={() => setLoading(false)}
              sx={{
                display: "block",

                width: "100%",
                height: "100%",

                border: 0,

                bgcolor: COLORS.white,
              }}
            />
          </Box>

          {/* =================================================
              DOCUMENT FOOTER
          ================================================= */}

          <Box
            sx={{
              minHeight: 44,

              px: {
                xs: 2,
                sm: 2.5,
              },

              display: "flex",

              flexDirection: {
                xs: "column",
                sm: "row",
              },

              alignItems: {
                xs: "flex-start",
                sm: "center",
              },

              justifyContent: "space-between",

              gap: {
                xs: 0.5,
                sm: 2,
              },

              py: {
                xs: 1.2,
                sm: 0,
              },

              borderTop: `1px solid ${COLORS.border}`,

              bgcolor: "#FAFBFC",
            }}
          >
            <Typography
              sx={{
                color: COLORS.subtle,

                fontSize: "0.62rem",
              }}
            >
              AbhiStat • Abhitech Energycon Limited
            </Typography>

            <Typography
              sx={{
                color: COLORS.subtle,

                fontSize: "0.62rem",
              }}
            >
              Having trouble viewing the manual?{" "}
              <Box
                component="button"
                type="button"
                onClick={handleOpenNewTab}
                sx={{
                  p: 0,

                  border: 0,

                  bgcolor: "transparent",

                  color: COLORS.blue,

                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: 700,

                  cursor: "pointer",

                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Open it separately
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default UserManual;