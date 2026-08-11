import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";

import {
  ArrowForwardRounded,
  BarChartRounded,
  CheckCircleRounded,
  DataObjectRounded,
  InsightsRounded,
  LockOutlined,
  MailOutlineRounded,
  SecurityRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import logo from "../assets/main-logo.png";
import logo2 from "../assets/login.png";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clearAuthData, isAuthenticated } from "../utils/authUtils";

const COLORS = {
  navy: "#0B1F33",
  navyLight: "#12314D",
  blue: "#2563EB",
  blueLight: "#60A5FA",
  cyan: "#38BDF8",
  text: "#172033",
  muted: "#667085",
  border: "#E4E7EC",
  surface: "#F7F9FC",
  success: "#059669",
  white: "#FFFFFF",
  purple: "#7C3AED",
  gradientStart: "#6366F1",
  gradientEnd: "#8B5CF6",
};

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth?.user || isAuthenticated()) {
      navigate("/full-excel-file", { replace: true });
    }
  }, [auth?.user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    setLoading(true);

    try {
      if (auth?.loginUser?.mutate) {
        auth.loginUser.mutate(
          {
            email: email.trim(),
            password,
          },
          {
            onSettled: () => {
              setLoading(false);
            },
          }
        );
      } else {
        console.error("Auth context not available");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  const handleExternalLogin = () => {
    clearAuthData();
    navigate("/non-abhitech-login");
  };

  const fieldStyles = {
    "& .MuiInputLabel-root": {
      fontFamily: "'Inter', sans-serif",
      color: COLORS.muted,
      fontSize: "0.9rem",
      fontWeight: 500,
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: COLORS.blue,
    },

    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      minHeight: "56px",
      fontFamily: "'Inter', sans-serif",
      transition: 'all 0.2s ease',

      "& fieldset": {
        borderColor: COLORS.border,
        borderWidth: "1.5px",
      },

      "&:hover fieldset": {
        borderColor: "#B9C1CC",
        backgroundColor: "rgba(255, 255, 255, 1)",
      },

      "&.Mui-focused fieldset": {
        borderColor: COLORS.blue,
        borderWidth: "2px",
      },

      "&.Mui-focused": {
        backgroundColor: "rgba(255, 255, 255, 1)",
        boxShadow: `0 0 0 4px ${alpha(COLORS.blue, 0.1)}`,
      },
    },
  };

  const benefits = [
    {
      icon: <DataObjectRounded />,
      title: "Structured data workflow",
      description: "Validate and prepare operational datasets before analysis.",
    },
    {
      icon: <BarChartRounded />,
      title: "Statistical analysis",
      description: "Compare performance using distributions, correlations and metrics.",
    },
    {
      icon: <InsightsRounded />,
      title: "Decision-ready insights",
      description: "Turn complex operating data into clear visual evidence.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: COLORS.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: {
          xs: 0,
          sm: 3,
          md: 4,
        },
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "1280px",
          minHeight: {
            xs: "100vh",
            sm: "760px",
          },
          overflow: "hidden",
          borderRadius: {
            xs: 0,
            sm: "24px",
          },
          border: {
            xs: "none",
            sm: `1px solid ${COLORS.border}`,
          },
          boxShadow: {
            xs: "none",
            sm: "0 24px 70px rgba(16, 24, 40, 0.10)",
          },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.05fr 0.95fr",
          },
        }}
      >
        

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",

            display: {
              xs: "none",
              md: "flex",
            },

            flexDirection: "column",
            justifyContent: "space-between",

            p: {
              md: 6,
              lg: 7,
            },

            color: "#FFFFFF",

            background: `
              radial-gradient(
                circle at 80% 15%,
                rgba(56, 189, 248, 0.16),
                transparent 22rem
              ),
              radial-gradient(
                circle at 15% 90%,
                rgba(37, 99, 235, 0.14),
                transparent 24rem
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

          <Box
            sx={{
              position: "absolute",
              inset: 0,

              opacity: 0.18,

              backgroundImage: `
                linear-gradient(
                  rgba(255,255,255,0.04) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.04) 1px,
                  transparent 1px
                )
              `,

              backgroundSize: "46px 46px",

              pointerEvents: "none",
            }}
          />


          <Box
            sx={{
              position: "absolute",
              width: 350,
              height: 350,
              borderRadius: "50%",
              bgcolor: "rgba(56,189,248,0.06)",
              right: -160,
              bottom: -120,
            }}
          />


          <Box
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,

                px: 1.5,
                py: 0.8,

                mb: 4,

                borderRadius: "999px",

                bgcolor: "rgba(96,165,250,0.08)",
                border: "1px solid rgba(147,197,253,0.18)",
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#7DD3FC",
                }}
              />

              <Typography
                sx={{
                  color: "#DCEEFF",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                }}
              >
                ABHISTAT • INDUSTRIAL ANALYTICS
              </Typography>
            </Box>

            <Typography
              component="h1"
              sx={{
                maxWidth: "540px",

                fontSize: {
                  md: "2.7rem",
                  lg: "3.25rem",
                },

                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                fontWeight: 800,
              }}
            >
              Statistical insight for{" "}
              <Box
                component="span"
                sx={{
                  color: "#7DD3FC",
                }}
              >
                industrial performance.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 2.5,

                maxWidth: "540px",

                color: "#B5C8D9",

                fontSize: "1rem",
                lineHeight: 1.75,
              }}
            >
              Access AbhiStat to validate operating data, compare performance
              and investigate the statistical relationships behind your
              optimization results.
            </Typography>


            <Stack
              spacing={2.2}
              sx={{
                mt: 5,
                maxWidth: "520px",
              }}
            >
              {benefits.map((item) => (
                <Stack
                  key={item.title}
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,

                      flexShrink: 0,

                      display: "grid",
                      placeItems: "center",

                      borderRadius: "12px",

                      bgcolor: "rgba(125,211,252,0.08)",
                      border: "1px solid rgba(125,211,252,0.12)",

                      color: "#7DD3FC",

                      "& svg": {
                        fontSize: 21,
                      },
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.92rem",
                        fontWeight: 750,
                        color: "#FFFFFF",
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        color: "#94AEC4",
                        fontSize: "0.8rem",
                        lineHeight: 1.55,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>


          <Box
            sx={{
              position: "relative",
              zIndex: 1,

              mt: 5,

              p: 2,

              borderRadius: "18px",

              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",

              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              component="a"
              href="https://abhitechenergycon.com/"
              target="_blank"
              rel="noreferrer"
              sx={{
                display: "block",
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src={logo2}
                alt="Abhitech analytics illustration"
                sx={{
                  display: "block",
                  width: "100%",
                  maxHeight: "235px",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>


          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              position: "relative",
              zIndex: 1,

              mt: 4,

              pt: 3,

              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography
              sx={{
                color: "#7897B1",
                fontSize: "0.72rem",
              }}
            >
              Abhitech Energycon Limited
            </Typography>

            <Stack direction="row" spacing={0.7} alignItems="center">
              <SecurityRounded
                sx={{
                  color: "#7DD3FC",
                  fontSize: 15,
                }}
              />

              <Typography
                sx={{
                  color: "#7897B1",
                  fontSize: "0.72rem",
                }}
              >
                Secure employee access
              </Typography>
            </Stack>
          </Stack>
        </Box>

        

        <Box
          sx={{
            bgcolor: "#FFFFFF",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            px: {
              xs: 3,
              sm: 6,
              md: 7,
              lg: 9,
            },

            py: {
              xs: 6,
              md: 7,
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "430px",
            }}
          >

            <Box
              sx={{
                display: "flex",
                justifyContent: {
                  xs: "center",
                  md: "flex-start",
                },

                mb: 6,
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
                    maxWidth: {
                      xs: "180px",
                      sm: "200px",
                    },

                    height: "auto",
                  }}
                />
              </Box>
            </Box>


            <Box
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },

                alignItems: "center",
                justifyContent: "center",

                gap: 1,

                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: COLORS.blue,
                }}
              />

              <Typography
                sx={{
                  color: COLORS.blue,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.09em",
                }}
              >
                ABHISTAT
              </Typography>
            </Box>


            <Typography
              component="h2"
              sx={{
                color: COLORS.text,

                fontSize: {
                  xs: "1.8rem",
                  sm: "2rem",
                },

                fontWeight: 800,
                letterSpacing: "-0.03em",

                textAlign: {
                  xs: "center",
                  md: "left",
                },
              }}
            >
              Welcome back
            </Typography>

            <Typography
              sx={{
                mt: 1,

                color: COLORS.muted,

                fontSize: "0.95rem",
                lineHeight: 1.6,

                textAlign: {
                  xs: "center",
                  md: "left",
                },
              }}
            >
              Sign in with your Abhitech employee credentials to continue to
              your analysis workspace.
            </Typography>


            <Box
              sx={{
                mt: 3,

                px: 2,
                py: 1.4,

                display: "flex",
                alignItems: "center",

                gap: 1.2,

                borderRadius: "10px",

                bgcolor: "#F8FAFC",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,

                  display: "grid",
                  placeItems: "center",

                  borderRadius: "8px",

                  bgcolor: "#ECFDF5",
                  color: COLORS.success,
                }}
              >
                <CheckCircleRounded
                  sx={{
                    fontSize: 18,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: COLORS.text,
                    fontSize: "0.78rem",
                    fontWeight: 750,
                  }}
                >
                  Abhitech employee portal
                </Typography>

                <Typography
                  sx={{
                    color: COLORS.muted,
                    fontSize: "0.7rem",
                  }}
                >
                  Authorized personnel access
                </Typography>
              </Box>
            </Box>


            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                mt: 4,
              }}
            >

              <Typography
                component="label"
                htmlFor="email"
                sx={{
                  display: "block",

                  mb: 0.8,

                  color: COLORS.text,

                  fontSize: "0.82rem",
                  fontWeight: 700,
                }}
              >
                Email address
              </Typography>

              <TextField
                id="email"
                fullWidth
                type="email"
                placeholder="name@abhitechenergycon.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRounded
                        sx={{
                          color: "#98A2B3",
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyles}
              />


              <Typography
                component="label"
                htmlFor="password"
                sx={{
                  display: "block",

                  mt: 2.5,
                  mb: 0.8,

                  color: COLORS.text,

                  fontSize: "0.82rem",
                  fontWeight: 700,
                }}
              >
                Password
              </Typography>

              <TextField
                id="password"
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined
                        sx={{
                          color: "#98A2B3",
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),

                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        edge="end"
                        disabled={loading}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        sx={{
                          color: "#98A2B3",

                          "&:hover": {
                            color: COLORS.blue,
                            bgcolor: alpha(COLORS.blue, 0.06),
                          },
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyles}
              />


              <Button
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                endIcon={
                  loading ? null : (
                    <ArrowForwardRounded
                      sx={{
                        fontSize: 19,
                      }}
                    />
                  )
                }
                sx={{
                  mt: 3.5,

                  minHeight: "54px",

                  borderRadius: "12px",

                  bgcolor: COLORS.navy,

                  color: "#FFFFFF",

                  textTransform: "none",

                  fontFamily: "'Inter', sans-serif",

                  fontSize: "0.92rem",
                  fontWeight: 750,

                  boxShadow: "0 8px 20px rgba(11,31,51,0.16)",

                  "&:hover": {
                    bgcolor: COLORS.navyLight,

                    transform: "translateY(-1px)",

                    boxShadow: "0 12px 25px rgba(11,31,51,0.20)",
                  },

                  "&.Mui-disabled": {
                    bgcolor: "#E4E7EC",
                    color: "#98A2B3",
                  },

                  transition: "all 0.2s ease",
                }}
              >
                {loading ? (
                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                  >
                    <CircularProgress
                      size={18}
                      thickness={5}
                      sx={{
                        color: "inherit",
                      }}
                    />

                    <span>Signing in...</span>
                  </Stack>
                ) : (
                  "Sign in as Abhitech employee"
                )}
              </Button>
            </Box>


            <Divider
              sx={{
                my: 3.5,

                "&::before, &::after": {
                  borderColor: COLORS.border,
                },
              }}
            >
              <Typography
                sx={{
                  px: 1,

                  color: "#98A2B3",

                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                OR
              </Typography>
            </Divider>


            <Button
              fullWidth
              variant="outlined"
              onClick={handleExternalLogin}
              disabled={loading}
              sx={{
                minHeight: "52px",

                borderRadius: "12px",

                borderColor: COLORS.border,

                color: COLORS.text,

                bgcolor: "#FFFFFF",

                textTransform: "none",

                fontFamily: "'Inter', sans-serif",

                fontSize: "0.9rem",
                fontWeight: 700,

                "&:hover": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#B9C1CC",
                },
              }}
            >
              Continue as external user
            </Button>


            <Box
              sx={{
                mt: 4,

                pt: 3,

                borderTop: `1px solid ${COLORS.border}`,

                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: COLORS.muted,
                  fontSize: "0.78rem",
                }}
              >
                Having trouble signing in?
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,

                  color: COLORS.blue,

                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}
              >
                Contact technical support
              </Typography>
            </Box>


            <Stack
              direction="row"
              spacing={0.8}
              justifyContent="center"
              alignItems="center"
              sx={{
                mt: 3,
              }}
            >
              <SecurityRounded
                sx={{
                  color: "#98A2B3",
                  fontSize: 14,
                }}
              />

              <Typography
                sx={{
                  color: "#98A2B3",
                  fontSize: "0.68rem",
                }}
              >
                Secure access to AbhiStat
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;