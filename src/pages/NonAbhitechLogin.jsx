import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  PersonOutlineRounded,
  SecurityRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import logo from "../assets/main-logo.png";
import logo2 from "../assets/login.png";

import { useAuth } from "../hooks/useAuth";
import { config } from "../../config";

import {
  storeAuthData,
  clearAuthData,
  isAuthenticated,
  USER_TYPES,
} from "../utils/authUtils";

const GOOGLE_CLIENT_ID = config.GoogleClientId;

/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#0B1F33",
  navyLight: "#12314D",

  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueLight: "#60A5FA",

  cyan: "#38BDF8",

  text: "#172033",
  muted: "#667085",
  subtle: "#98A2B3",

  border: "#E4E7EC",

  surface: "#F7F9FC",
  white: "#FFFFFF",

  success: "#059669",
  successBackground: "#ECFDF5",

  error: "#DC2626",
  errorBackground: "#FEF2F2",
};

/* =========================================================
   LOGIN
========================================================= */

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =======================================================
     AUTH REDIRECT
  ======================================================= */

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/full-excel-file", {
        replace: true,
      });
    }
  }, [navigate]);

  /* =======================================================
     STANDARD LOGIN
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    clearAuthData();

    try {
      const response = await fetch(
        "https://abhistat.com/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 404 ||
          (data.detail &&
            data.detail.toLowerCase().includes("not found"))
        ) {
          setError(
            "We couldn't find an account with those details. Redirecting you to sign up..."
          );

          setTimeout(() => {
            navigate("/non-abhitech-signup");

            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }, 1500);

          return;
        }

        throw new Error(
          data.detail ||
            data.message ||
            "Unable to sign in. Please check your details."
        );
      }

      const userData = data.user || {
        email: data.email,
        name: data.name,
      };

      const success = storeAuthData(
        userData,
        data.access_token,
        USER_TYPES.EXTERNAL
      );

      if (!success) {
        throw new Error(
          "Failed to store authentication data."
        );
      }

      if (auth?.loginUser?.mutateAsync) {
        try {
          await auth.loginUser.mutateAsync({
            email: userData.email,
            token: data.access_token,
          });
        } catch (authError) {
          console.warn(
            "Auth context update failed:",
            authError
          );
        }
      }

      navigate("/data-file-checks", {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err?.message ||
          "Something went wrong while signing in."
      );

      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     GOOGLE LOGIN
  ======================================================= */

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://abhistat.com/api/google-login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 404 ||
          (data.detail &&
            data.detail.toLowerCase().includes("not found"))
        ) {
          setError(
            "This Google account isn't registered yet. Redirecting you to sign up..."
          );

          setTimeout(() => {
            navigate("/non-abhitech-signup");

            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }, 1500);

          return;
        }

        throw new Error(
          data.detail ||
            data.message ||
            "Google sign-in failed."
        );
      }

      const userData = data.user || {
        email: data.email,
        name: data.name,
      };

      const success = storeAuthData(
        userData,
        data.access_token,
        USER_TYPES.EXTERNAL
      );

      if (!success) {
        throw new Error(
          "Failed to store authentication data."
        );
      }

      navigate("/data-file-checks", {
        replace: true,
      });
    } catch (err) {
      console.error("Google OAuth error:", err);

      setError(
        err?.message ||
          "Google sign-in could not be completed."
      );

      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     OTHER ACTIONS
  ======================================================= */

  const handleEmployeeLogin = () => {
    clearAuthData();
    navigate("/login");
  };

  const handleSignup = () => {
    clearAuthData();
    navigate("/non-abhitech-signup");
  };

  /* =======================================================
     SHARED FIELD STYLES
  ======================================================= */

  const fieldStyles = {
    "& .MuiOutlinedInput-root": {
      minHeight: "54px",

      borderRadius: "12px",

      bgcolor: COLORS.white,

      fontFamily: "'Inter', sans-serif",

      transition: "all 0.2s ease",

      "& fieldset": {
        borderColor: COLORS.border,
      },

      "&:hover fieldset": {
        borderColor: "#B9C1CC",
      },

      "&.Mui-focused fieldset": {
        borderColor: COLORS.blue,
        borderWidth: "1.5px",
      },

      "&.Mui-focused": {
        boxShadow: `0 0 0 4px ${alpha(
          COLORS.blue,
          0.08
        )}`,
      },
    },

    "& .MuiInputBase-input": {
      fontSize: "0.9rem",

      "&::placeholder": {
        color: "#98A2B3",
        opacity: 1,
      },
    },
  };

  /* =======================================================
     FEATURE LIST
  ======================================================= */

  const benefits = [
    {
      icon: <DataObjectRounded />,
      title: "Bring your operational data",
      description:
        "Upload and prepare datasets for structured statistical analysis.",
    },

    {
      icon: <BarChartRounded />,
      title: "Explore performance",
      description:
        "Compare variables, distributions and operational outcomes.",
    },

    {
      icon: <InsightsRounded />,
      title: "Find useful relationships",
      description:
        "Turn complex datasets into clear, decision-ready insights.",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
    >
      <Box
        sx={{
          minHeight: "100vh",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          bgcolor: COLORS.surface,

          p: {
            xs: 0,
            sm: 3,
            md: 4,
          },

          fontFamily:
            "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",

            maxWidth: "1280px",

            minHeight: {
              xs: "100vh",
              sm: "800px",
            },

            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "1.05fr 0.95fr",
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
              sm: `
                0 24px 70px rgba(16,24,40,0.10),
                0 4px 12px rgba(16,24,40,0.03)
              `,
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

              color: COLORS.white,

              background: `
                radial-gradient(
                  circle at 80% 15%,
                  rgba(56,189,248,0.16),
                  transparent 22rem
                ),

                radial-gradient(
                  circle at 10% 90%,
                  rgba(37,99,235,0.16),
                  transparent 25rem
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
            {/* Engineering grid */}

            <Box
              sx={{
                position: "absolute",
                inset: 0,

                opacity: 0.2,

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

            {/* Decorative glow */}

            <Box
              sx={{
                position: "absolute",

                width: 400,
                height: 400,

                right: -200,
                bottom: -170,

                borderRadius: "50%",

                bgcolor:
                  "rgba(56,189,248,0.05)",

                border:
                  "1px solid rgba(125,211,252,0.06)",
              }}
            />

            {/* Main left content */}

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Portal badge */}

              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",

                  gap: 1,

                  px: 1.5,
                  py: 0.8,

                  mb: 4,

                  borderRadius: "999px",

                  bgcolor:
                    "rgba(96,165,250,0.08)",

                  border:
                    "1px solid rgba(147,197,253,0.18)",
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
                  ABHISTAT • EXTERNAL ACCESS
                </Typography>
              </Box>

              {/* Heading */}

              <Typography
                component="h1"
                sx={{
                  maxWidth: "550px",

                  fontSize: {
                    md: "2.65rem",
                    lg: "3.2rem",
                  },

                  lineHeight: 1.08,

                  letterSpacing: "-0.045em",

                  fontWeight: 800,
                }}
              >
                Your data has a story.
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "#7DD3FC",
                  }}
                >
                  AbhiStat helps uncover it.
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
                Sign in to access Abhitech&apos;s
                statistical analysis environment and
                explore the relationships behind your
                operational data.
              </Typography>

              {/* Feature list */}

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

                        bgcolor:
                          "rgba(125,211,252,0.08)",

                        border:
                          "1px solid rgba(125,211,252,0.12)",

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
                          color: COLORS.white,

                          fontSize: "0.92rem",
                          fontWeight: 750,
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

            {/* Illustration */}

            <Box
              sx={{
                position: "relative",
                zIndex: 1,

                mt: 5,

                p: 2,

                borderRadius: "18px",

                bgcolor:
                  "rgba(255,255,255,0.035)",

                border:
                  "1px solid rgba(255,255,255,0.08)",

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
                }}
              >
                <Box
                  component="img"
                  src={logo2}
                  alt="AbhiStat analytics"
                  sx={{
                    display: "block",

                    width: "100%",

                    maxHeight: "220px",

                    objectFit: "contain",
                  }}
                />
              </Box>
            </Box>

            {/* Left footer */}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                position: "relative",
                zIndex: 1,

                mt: 4,
                pt: 3,

                borderTop:
                  "1px solid rgba(255,255,255,0.08)",
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

              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
              >
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
                  Secure external access
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* =================================================
              RIGHT LOGIN PANEL
          ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              bgcolor: COLORS.white,

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
              {/* Logo */}

              <Box
                sx={{
                  display: "flex",

                  justifyContent: {
                    xs: "center",
                    md: "flex-start",
                  },

                  mb: 5,
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

              {/* Mobile product tag */}

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
                  ABHISTAT EXTERNAL ACCESS
                </Typography>
              </Box>

              {/* Title */}

              <Typography
                component="h2"
                sx={{
                  color: COLORS.text,

                  fontSize: {
                    xs: "1.8rem",
                    sm: "2rem",
                  },

                  fontWeight: 800,

                  letterSpacing: "-0.035em",

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

                  fontSize: "0.94rem",
                  lineHeight: 1.65,

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                Sign in to your external AbhiStat
                account to continue your analysis.
              </Typography>

              {/* Account type */}

              <Box
                sx={{
                  mt: 3,

                  display: "flex",
                  alignItems: "center",

                  gap: 1.3,

                  p: 1.5,

                  borderRadius: "11px",

                  bgcolor: "#F8FAFC",

                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,

                    flexShrink: 0,

                    display: "grid",
                    placeItems: "center",

                    borderRadius: "9px",

                    bgcolor: alpha(
                      COLORS.blue,
                      0.07
                    ),

                    color: COLORS.blue,
                  }}
                >
                  <PersonOutlineRounded
                    sx={{
                      fontSize: 19,
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
                    External user portal
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.15,

                      color: COLORS.muted,

                      fontSize: "0.7rem",
                    }}
                  >
                    Client and partner access
                  </Typography>
                </Box>
              </Box>

              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  mt: 3.5,
                }}
              >
                {/* Email label */}

                <Typography
                  component="label"
                  htmlFor="external-email"
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

                {/* Email */}

                <TextField
                  id="external-email"
                  fullWidth
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineRounded
                          sx={{
                            color: COLORS.subtle,
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />

                {/* Password label */}

                <Typography
                  component="label"
                  htmlFor="external-password"
                  sx={{
                    display: "block",

                    mt: 2.3,
                    mb: 0.8,

                    color: COLORS.text,

                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}
                >
                  Password
                </Typography>

                {/* Password */}

                <TextField
                  id="external-password"
                  fullWidth
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined
                          sx={{
                            color: COLORS.subtle,
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword(
                              (previous) => !previous
                            )
                          }
                          edge="end"
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          sx={{
                            color: COLORS.subtle,

                            "&:hover": {
                              color: COLORS.blue,

                              bgcolor: alpha(
                                COLORS.blue,
                                0.06
                              ),
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

                {/* Error */}

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mt: 2.5,

                      borderRadius: "10px",

                      border:
                        "1px solid #FECACA",

                      bgcolor:
                        COLORS.errorBackground,

                      color: "#991B1B",

                      fontSize: "0.78rem",

                      "& .MuiAlert-icon": {
                        color: COLORS.error,
                      },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Login button */}

                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={
                    loading ||
                    !email.trim() ||
                    !password.trim()
                  }
                  endIcon={
                    !loading ? (
                      <ArrowForwardRounded
                        sx={{
                          fontSize: 19,
                        }}
                      />
                    ) : null
                  }
                  sx={{
                    mt: 3,

                    minHeight: "52px",

                    borderRadius: "11px",

                    bgcolor: COLORS.navy,

                    color: COLORS.white,

                    textTransform: "none",

                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "0.9rem",
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

                    "&.Mui-disabled": {
                      bgcolor: "#E4E7EC",
                      color: "#98A2B3",
                    },

                    transition:
                      "all 0.2s ease",
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
                    "Sign in"
                  )}
                </Button>
              </Box>

              {/* =================================================
                  GOOGLE
              ================================================= */}

              <Divider
                sx={{
                  my: 3,

                  "&::before, &::after": {
                    borderColor: COLORS.border,
                  },
                }}
              >
                <Typography
                  sx={{
                    px: 1,

                    color: COLORS.subtle,

                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  OR CONTINUE WITH
                </Typography>
              </Divider>

              <Box
                sx={{
                  width: "100%",

                  display: "flex",
                  justifyContent: "center",

                  "& > div": {
                    width: "100% !important",
                  },

                  "& iframe": {
                    width: "100% !important",
                  },
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setError(
                      "Google Sign-In failed. Please try again."
                    )
                  }
                  width="400"
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  theme="outline"
                />
              </Box>

              {/* =================================================
                  SIGN UP
              ================================================= */}

              <Box
                sx={{
                  mt: 3,

                  p: 2,

                  textAlign: "center",

                  borderRadius: "11px",

                  bgcolor: "#F8FAFC",

                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.muted,

                    fontSize: "0.8rem",
                  }}
                >
                  New to AbhiStat?
                </Typography>

                <Button
                  variant="text"
                  onClick={handleSignup}
                  disabled={loading}
                  sx={{
                    mt: 0.25,

                    p: 0,

                    minWidth: "auto",

                    color: COLORS.blue,

                    textTransform: "none",

                    fontSize: "0.8rem",
                    fontWeight: 750,

                    "&:hover": {
                      bgcolor: "transparent",
                      color: COLORS.blueDark,
                    },
                  }}
                >
                  Create an external account
                </Button>
              </Box>

              {/* =================================================
                  EMPLOYEE LOGIN
              ================================================= */}

              <Box
                sx={{
                  mt: 3,
                  pt: 3,

                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <Typography
                  sx={{
                    mb: 1.5,

                    textAlign: "center",

                    color: COLORS.subtle,

                    fontSize: "0.72rem",
                  }}
                >
                  Are you an Abhitech employee?
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleEmployeeLogin}
                  disabled={loading}
                  startIcon={
                    <Box
                      component="img"
                      src={logo}
                      alt=""
                      sx={{
                        width: 21,
                        height: 21,
                        objectFit: "contain",
                      }}
                    />
                  }
                  sx={{
                    minHeight: "50px",

                    borderRadius: "11px",

                    borderColor: COLORS.border,

                    bgcolor: COLORS.white,

                    color: COLORS.text,

                    textTransform: "none",

                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "0.85rem",
                    fontWeight: 700,

                    "&:hover": {
                      bgcolor: "#F8FAFC",
                      borderColor: "#B9C1CC",
                    },
                  }}
                >
                  Sign in as Abhitech employee
                </Button>
              </Box>

              {/* Security */}

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
                    color: COLORS.subtle,
                    fontSize: 14,
                  }}
                />

                <Typography
                  sx={{
                    color: COLORS.subtle,
                    fontSize: "0.67rem",
                  }}
                >
                  Secure access to AbhiStat
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;