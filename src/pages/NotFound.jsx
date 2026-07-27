import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

import {
  ArrowBackRounded,
  ArrowForwardRounded,
  HomeRounded,
  MenuBookRounded,
  SearchOffRounded,
} from "@mui/icons-material";

import logo from "../assets/main-logo.png";

const NotFound = () => {
  const navigate = useNavigate();

  /* =========================================================
     DESIGN TOKENS
  ========================================================= */

  const COLORS = {
    navy: "#0B1F33",
    navyLight: "#12314D",

    blue: "#2563EB",
    blueDark: "#1D4ED8",
    cyan: "#38BDF8",

    text: "#172033",
    muted: "#667085",
    subtle: "#98A2B3",

    border: "#E4E7EC",
    surface: "#F7F9FC",
    white: "#FFFFFF",
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOpenManual = () => {
    navigate("/manual");
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        bgcolor: COLORS.surface,

        p: {
          xs: 2,
          sm: 3,
          md: 5,
        },

        fontFamily: "'Inter', 'Segoe UI', sans-serif",

        /* Subtle background grid */
        backgroundImage: `
          linear-gradient(
            ${alpha(COLORS.navy, 0.025)} 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            ${alpha(COLORS.navy, 0.025)} 1px,
            transparent 1px
          )
        `,

        backgroundSize: "42px 42px",
      }}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <Box
        sx={{
          position: "absolute",

          width: {
            xs: 300,
            md: 500,
          },

          height: {
            xs: 300,
            md: 500,
          },

          borderRadius: "50%",

          top: {
            xs: -180,
            md: -280,
          },

          right: {
            xs: -160,
            md: -180,
          },

          background: `radial-gradient(
            circle,
            ${alpha(COLORS.blue, 0.09)} 0%,
            ${alpha(COLORS.blue, 0.02)} 50%,
            transparent 72%
          )`,

          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",

          width: {
            xs: 280,
            md: 450,
          },

          height: {
            xs: 280,
            md: 450,
          },

          borderRadius: "50%",

          bottom: {
            xs: -180,
            md: -260,
          },

          left: {
            xs: -160,
            md: -180,
          },

          background: `radial-gradient(
            circle,
            ${alpha(COLORS.cyan, 0.08)} 0%,
            ${alpha(COLORS.cyan, 0.02)} 50%,
            transparent 72%
          )`,

          pointerEvents: "none",
        }}
      />

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",

            overflow: "hidden",

            borderRadius: {
              xs: "20px",
              md: "26px",
            },

            bgcolor: COLORS.white,

            border: `1px solid ${COLORS.border}`,

            boxShadow: `
              0 24px 70px rgba(16, 24, 40, 0.08),
              0 4px 12px rgba(16, 24, 40, 0.03)
            `,
          }}
        >
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                md: "0.9fr 1.1fr",
              },

              minHeight: {
                md: 600,
              },
            }}
          >
            {/* =================================================
                LEFT PANEL
            ================================================= */}

            <Box
              sx={{
                position: "relative",
                overflow: "hidden",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                minHeight: {
                  xs: 260,
                  sm: 300,
                  md: "auto",
                },

                p: {
                  xs: 4,
                  sm: 5,
                  md: 6,
                },

                color: COLORS.white,

                background: `
                  radial-gradient(
                    circle at 20% 20%,
                    rgba(56,189,248,0.14),
                    transparent 18rem
                  ),

                  radial-gradient(
                    circle at 80% 90%,
                    rgba(37,99,235,0.18),
                    transparent 20rem
                  ),

                  linear-gradient(
                    145deg,
                    #081A2C 0%,
                    #0B2339 55%,
                    #0C2C49 100%
                  )
                `,
              }}
            >
              {/* Decorative grid */}

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,

                  opacity: 0.22,

                  backgroundImage: `
                    linear-gradient(
                      rgba(255,255,255,0.05) 1px,
                      transparent 1px
                    ),

                    linear-gradient(
                      90deg,
                      rgba(255,255,255,0.05) 1px,
                      transparent 1px
                    )
                  `,

                  backgroundSize: "44px 44px",

                  pointerEvents: "none",
                }}
              />

              {/* Decorative circles */}

              <Box
                sx={{
                  position: "absolute",

                  width: 260,
                  height: 260,

                  borderRadius: "50%",

                  border:
                    "1px solid rgba(125,211,252,0.08)",

                  right: -100,
                  bottom: -100,
                }}
              />

              <Box
                sx={{
                  position: "absolute",

                  width: 190,
                  height: 190,

                  borderRadius: "50%",

                  border:
                    "1px solid rgba(125,211,252,0.07)",

                  right: -65,
                  bottom: -65,
                }}
              />

              {/* 404 Illustration */}

              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,

                  width: "100%",

                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: {
                      xs: 64,
                      md: 76,
                    },

                    height: {
                      xs: 64,
                      md: 76,
                    },

                    display: "grid",
                    placeItems: "center",

                    mx: "auto",
                    mb: 3,

                    borderRadius: "20px",

                    bgcolor:
                      "rgba(125,211,252,0.08)",

                    border:
                      "1px solid rgba(125,211,252,0.16)",

                    color: "#7DD3FC",
                  }}
                >
                  <SearchOffRounded
                    sx={{
                      fontSize: {
                        xs: 32,
                        md: 38,
                      },
                    }}
                  />
                </Box>

                <Typography
                  aria-label="404"
                  sx={{
                    fontSize: {
                      xs: "5.5rem",
                      sm: "7rem",
                      md: "8.5rem",
                    },

                    lineHeight: 0.9,

                    fontWeight: 900,

                    letterSpacing: "-0.08em",

                    background:
                      "linear-gradient(135deg, #FFFFFF 15%, #7DD3FC 100%)",

                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",

                    WebkitTextFillColor: "transparent",

                    userSelect: "none",
                  }}
                >
                  404
                </Typography>

                <Typography
                  sx={{
                    mt: 2,

                    color: "#94AEC4",

                    fontSize: {
                      xs: "0.72rem",
                      md: "0.78rem",
                    },

                    fontWeight: 700,

                    letterSpacing: "0.14em",
                  }}
                >
                  PAGE NOT FOUND
                </Typography>
              </Box>
            </Box>

            {/* =================================================
                RIGHT CONTENT
            ================================================= */}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",

                justifyContent: "center",

                p: {
                  xs: 4,
                  sm: 6,
                  md: 7,
                  lg: 8,
                },
              }}
            >
              {/* Logo */}

              <Box
                sx={{
                  mb: {
                    xs: 4,
                    md: 5,
                  },
                }}
              >
                <Box
                  component="a"
                  href="https://abhitechenergycon.com/"
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    display: "inline-flex",
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="Abhitech Energycon"
                    sx={{
                      display: "block",

                      width: "auto",

                      maxWidth: {
                        xs: 155,
                        sm: 180,
                      },

                      height: "auto",
                    }}
                  />
                </Box>
              </Box>

              {/* Error badge */}

              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",

                  alignSelf: "flex-start",

                  gap: 0.8,

                  px: 1.3,
                  py: 0.7,

                  mb: 2,

                  borderRadius: "999px",

                  bgcolor: alpha(
                    COLORS.blue,
                    0.06
                  ),

                  border: `1px solid ${alpha(
                    COLORS.blue,
                    0.1
                  )}`,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,

                    borderRadius: "50%",

                    bgcolor: COLORS.blue,
                  }}
                />

                <Typography
                  sx={{
                    color: COLORS.blueDark,

                    fontSize: "0.67rem",
                    fontWeight: 800,

                    letterSpacing: "0.08em",
                  }}
                >
                  ERROR 404
                </Typography>
              </Box>

              {/* Heading */}

              <Typography
                component="h1"
                sx={{
                  color: COLORS.text,

                  fontSize: {
                    xs: "1.9rem",
                    sm: "2.25rem",
                    md: "2.6rem",
                  },

                  lineHeight: 1.15,

                  fontWeight: 800,

                  letterSpacing: "-0.04em",
                }}
              >
                We couldn't find
                <Box
                  component="span"
                  sx={{
                    display: "block",

                    color: COLORS.blue,
                  }}
                >
                  that page.
                </Box>
              </Typography>

              {/* Description */}

              <Typography
                sx={{
                  mt: 2,

                  maxWidth: "520px",

                  color: COLORS.muted,

                  fontSize: {
                    xs: "0.9rem",
                    sm: "0.95rem",
                  },

                  lineHeight: 1.75,
                }}
              >
                The page may have been moved, deleted,
                or the address might be incorrect. Your
                AbhiStat data and account are unaffected.
              </Typography>

              {/* =================================================
                  PRIMARY ACTIONS
              ================================================= */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                sx={{
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleGoHome}
                  startIcon={<HomeRounded />}
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    minHeight: 50,

                    px: 3,

                    borderRadius: "11px",

                    bgcolor: COLORS.navy,

                    color: COLORS.white,

                    textTransform: "none",

                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "0.84rem",
                    fontWeight: 750,

                    boxShadow:
                      "0 8px 20px rgba(11,31,51,0.16)",

                    "&:hover": {
                      bgcolor: COLORS.navyLight,

                      transform:
                        "translateY(-1px)",

                      boxShadow:
                        "0 12px 25px rgba(11,31,51,0.20)",
                    },

                    transition:
                      "all 0.2s ease",
                  }}
                >
                  Go to homepage
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleGoBack}
                  startIcon={<ArrowBackRounded />}
                  sx={{
                    minHeight: 50,

                    px: 3,

                    borderRadius: "11px",

                    color: COLORS.text,

                    borderColor: COLORS.border,

                    bgcolor: COLORS.white,

                    textTransform: "none",

                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "0.84rem",
                    fontWeight: 700,

                    "&:hover": {
                      bgcolor: "#F8FAFC",

                      borderColor: "#B9C1CC",

                      transform:
                        "translateY(-1px)",
                    },

                    transition:
                      "all 0.2s ease",
                  }}
                >
                  Go back
                </Button>
              </Stack>

              {/* =================================================
                  HELP CARD
              ================================================= */}

              <Box
                sx={{
                  mt: 5,

                  p: {
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

                  gap: 2,

                  borderRadius: "14px",

                  bgcolor: "#F8FAFC",

                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,

                      flexShrink: 0,

                      display: "grid",
                      placeItems: "center",

                      borderRadius: "10px",

                      bgcolor: alpha(
                        COLORS.blue,
                        0.07
                      ),

                      color: COLORS.blue,
                    }}
                  >
                    <MenuBookRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        color: COLORS.text,

                        fontSize: "0.82rem",
                        fontWeight: 750,
                      }}
                    >
                      Need help finding something?
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.2,

                        color: COLORS.muted,

                        fontSize: "0.72rem",

                        lineHeight: 1.5,
                      }}
                    >
                      Browse the AbhiStat user manual
                      for guidance.
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="text"
                  onClick={handleOpenManual}
                  endIcon={
                    <ArrowForwardRounded
                      sx={{
                        fontSize: "17px !important",
                      }}
                    />
                  }
                  sx={{
                    flexShrink: 0,

                    color: COLORS.blue,

                    textTransform: "none",

                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "0.76rem",
                    fontWeight: 750,

                    "&:hover": {
                      bgcolor: alpha(
                        COLORS.blue,
                        0.05
                      ),
                    },
                  }}
                >
                  User Manual
                </Button>
              </Box>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <Box
                sx={{
                  mt: 4,
                  pt: 3,

                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.subtle,

                    fontSize: "0.67rem",

                    lineHeight: 1.6,
                  }}
                >
                  If you reached this page from an
                  AbhiStat link, the destination may
                  have changed. Return to the homepage
                  and continue from the main navigation.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* =====================================================
            OUTSIDE FOOTER
        ===================================================== */}

        <Typography
          sx={{
            mt: 2.5,

            textAlign: "center",

            color: COLORS.subtle,

            fontSize: "0.65rem",
          }}
        >
          AbhiStat • Abhitech Energycon Limited
        </Typography>
      </Container>
    </Box>
  );
};

export default NotFound;