import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  ThemeProvider,
  Fade,
  Stack,
  Chip,
  alpha,
} from "@mui/material";

import {
  HomeRounded,
  ArrowBackRounded,
  SearchRounded,
  InsightsRounded,
  ErrorOutlineRounded,
  GridViewRounded,
  SecurityRounded,
} from "@mui/icons-material";

import customTheme from "../theme/customTheme";

const COLORS = {
  navy: "#0B1F33",
  navyLight: "#12314D",
  blue: "#2563EB",
  blueLight: "#60A5FA",
  cyan: "#38BDF8",
  text: "#172033",
  muted: "#667085",
  subtle: "#98A2B3",
  border: "#E4E7EC",
  surface: "#F7F9FC",
  white: "#FFFFFF",
};

const NoMatch = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    return () => {
      setVisible(false);
    };
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          bgcolor: COLORS.surface,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* =========================================================
            BACKGROUND DECORATION
        ========================================================= */}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              radial-gradient(
                circle at 10% 10%,
                rgba(37, 99, 235, 0.07),
                transparent 30rem
              ),
              radial-gradient(
                circle at 90% 90%,
                rgba(56, 189, 248, 0.07),
                transparent 30rem
              )
            `,
          }}
        />

        {/* Subtle grid */}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.45,

            backgroundImage: `
              linear-gradient(
                rgba(11, 31, 51, 0.025) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(11, 31, 51, 0.025) 1px,
                transparent 1px
              )
            `,

            backgroundSize: "44px 44px",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            py: {
              xs: 4,
              sm: 6,
              md: 8,
            },
          }}
        >
          <Fade in={visible} timeout={700}>
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",

                maxWidth: "1000px",
                mx: "auto",

                borderRadius: {
                  xs: "20px",
                  md: "28px",
                },

                border: `1px solid ${COLORS.border}`,

                bgcolor: alpha(COLORS.white, 0.96),

                boxShadow: `
                  0 24px 60px rgba(16, 24, 40, 0.08),
                  0 4px 12px rgba(16, 24, 40, 0.03)
                `,
              }}
            >
              {/* Top accent */}

              <Box
                sx={{
                  height: "4px",
                  width: "100%",
                  background: `linear-gradient(
                    90deg,
                    ${COLORS.blue},
                    ${COLORS.cyan}
                  )`,
                }}
              />

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "0.9fr 1.1fr",
                  },

                  minHeight: {
                    md: "600px",
                  },
                }}
              >
                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <Box
                  sx={{
                    position: "relative",
                    overflow: "hidden",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    p: {
                      xs: 4,
                      sm: 5,
                      md: 6,
                    },

                    minHeight: {
                      xs: "280px",
                      md: "auto",
                    },

                    color: COLORS.white,

                    background: `
                      radial-gradient(
                        circle at 30% 30%,
                        rgba(56, 189, 248, 0.14),
                        transparent 18rem
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
                  {/* Grid overlay */}

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

                      backgroundSize: "40px 40px",
                    }}
                  />

                  {/* Decorative circle */}

                  <Box
                    sx={{
                      position: "absolute",

                      width: 330,
                      height: 330,

                      borderRadius: "50%",

                      border: "1px solid rgba(125,211,252,0.08)",

                      top: "50%",
                      left: "50%",

                      transform: "translate(-50%, -50%)",
                    }}
                  />

                  <Box
                    sx={{
                      position: "absolute",

                      width: 230,
                      height: 230,

                      borderRadius: "50%",

                      border: "1px solid rgba(125,211,252,0.10)",

                      top: "50%",
                      left: "50%",

                      transform: "translate(-50%, -50%)",
                    }}
                  />

                  {/* 404 content */}

                  <Fade
                    in={visible}
                    timeout={900}
                    style={{
                      transitionDelay: "150ms",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        textAlign: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,

                          mx: "auto",
                          mb: 2,

                          display: "grid",
                          placeItems: "center",

                          borderRadius: "18px",

                          bgcolor: "rgba(125,211,252,0.08)",
                          border: "1px solid rgba(125,211,252,0.15)",

                          color: "#7DD3FC",
                        }}
                      >
                        <ErrorOutlineRounded
                          sx={{
                            fontSize: 31,
                          }}
                        />
                      </Box>

                      <Typography
                        component="div"
                        sx={{
                          fontSize: {
                            xs: "5rem",
                            sm: "6rem",
                            md: "7.5rem",
                          },

                          lineHeight: 1,

                          fontWeight: 900,

                          letterSpacing: "-0.07em",

                          background: `
                            linear-gradient(
                              135deg,
                              #FFFFFF 20%,
                              #7DD3FC 100%
                            )
                          `,

                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        404
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,

                          color: "#B8D4E7",

                          fontSize: "0.72rem",
                          fontWeight: 800,

                          letterSpacing: "0.14em",
                        }}
                      >
                        ROUTE NOT FOUND
                      </Typography>
                    </Box>
                  </Fade>
                </Box>

                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",

                    p: {
                      xs: 4,
                      sm: 5,
                      md: 7,
                    },
                  }}
                >
                  <Fade
                    in={visible}
                    timeout={900}
                    style={{
                      transitionDelay: "300ms",
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      {/* Product tag */}

                      <Chip
                        icon={
                          <InsightsRounded
                            sx={{
                              fontSize: "16px !important",
                            }}
                          />
                        }
                        label="ABHISTAT"
                        size="small"
                        sx={{
                          mb: 3,

                          height: 30,

                          bgcolor: alpha(COLORS.blue, 0.07),
                          color: COLORS.blue,

                          border: `1px solid ${alpha(
                            COLORS.blue,
                            0.12
                          )}`,

                          fontSize: "0.7rem",
                          fontWeight: 800,
                          letterSpacing: "0.08em",

                          "& .MuiChip-icon": {
                            color: COLORS.blue,
                          },
                        }}
                      />

                      <Typography
                        component="h1"
                        sx={{
                          color: COLORS.text,

                          fontSize: {
                            xs: "1.9rem",
                            sm: "2.2rem",
                            md: "2.5rem",
                          },

                          lineHeight: 1.15,

                          fontWeight: 800,

                          letterSpacing: "-0.04em",
                        }}
                      >
                        This page seems to have
                        <Box
                          component="span"
                          sx={{
                            color: COLORS.blue,
                          }}
                        >
                          {" "}
                          left the dataset.
                        </Box>
                      </Typography>

                      <Typography
                        sx={{
                          mt: 2,

                          maxWidth: "480px",

                          color: COLORS.muted,

                          fontSize: "0.95rem",
                          lineHeight: 1.7,
                        }}
                      >
                        The page you requested could not be found. The URL may
                        be incorrect, the page may have moved, or the resource
                        may no longer be available.
                      </Typography>

                      {/* Information card */}

                      <Box
                        sx={{
                          mt: 3.5,

                          display: "flex",
                          gap: 1.5,
                          alignItems: "flex-start",

                          p: 2,

                          borderRadius: "12px",

                          bgcolor: "#F8FAFC",

                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,

                            flexShrink: 0,

                            display: "grid",
                            placeItems: "center",

                            borderRadius: "9px",

                            bgcolor: alpha(COLORS.blue, 0.07),

                            color: COLORS.blue,
                          }}
                        >
                          <SearchRounded
                            sx={{
                              fontSize: 19,
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              color: COLORS.text,

                              fontSize: "0.8rem",
                              fontWeight: 750,
                            }}
                          >
                            Looking for an analysis?
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.3,

                              color: COLORS.muted,

                              fontSize: "0.75rem",
                              lineHeight: 1.55,
                            }}
                          >
                            Return to the homepage or use the previous page to
                            get back to your analysis workflow.
                          </Typography>
                        </Box>
                      </Box>

                      {/* Actions */}

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
                          sx={{
                            minHeight: 48,

                            px: 3,

                            borderRadius: "11px",

                            bgcolor: COLORS.navy,

                            color: COLORS.white,

                            textTransform: "none",

                            fontWeight: 700,
                            fontSize: "0.85rem",

                            boxShadow:
                              "0 8px 18px rgba(11,31,51,0.15)",

                            "&:hover": {
                              bgcolor: COLORS.navyLight,

                              transform: "translateY(-1px)",

                              boxShadow:
                                "0 12px 22px rgba(11,31,51,0.18)",
                            },

                            transition: "all 0.2s ease",
                          }}
                        >
                          Go to homepage
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={handleGoBack}
                          startIcon={<ArrowBackRounded />}
                          sx={{
                            minHeight: 48,

                            px: 3,

                            borderRadius: "11px",

                            borderColor: COLORS.border,

                            color: COLORS.text,

                            textTransform: "none",

                            fontWeight: 700,
                            fontSize: "0.85rem",

                            "&:hover": {
                              borderColor: "#B9C1CC",
                              bgcolor: "#F8FAFC",
                            },
                          }}
                        >
                          Previous page
                        </Button>
                      </Stack>

                      {/* Bottom information */}

                      <Box
                        sx={{
                          mt: 5,
                          pt: 3,

                          borderTop: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={{
                            xs: 1.5,
                            sm: 3,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.8}
                            alignItems="center"
                          >
                            <GridViewRounded
                              sx={{
                                color: COLORS.subtle,
                                fontSize: 16,
                              }}
                            />

                            <Typography
                              sx={{
                                color: COLORS.subtle,
                                fontSize: "0.7rem",
                              }}
                            >
                              AbhiStat Analytics
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={0.8}
                            alignItems="center"
                          >
                            <SecurityRounded
                              sx={{
                                color: COLORS.subtle,
                                fontSize: 16,
                              }}
                            />

                            <Typography
                              sx={{
                                color: COLORS.subtle,
                                fontSize: "0.7rem",
                              }}
                            >
                              Abhitech Energycon Limited
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Box>
                  </Fade>
                </Box>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NoMatch;