import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
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
  PhoneOutlined,
  SecurityRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  GoogleOAuthProvider,
  GoogleLogin,
} from "@react-oauth/google";

import logo from "../assets/main-logo.png";
import logo2 from "../assets/login.png";

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

  warning: "#D97706",
  warningBackground: "#FFFBEB",

  error: "#DC2626",
  errorBackground: "#FEF2F2",
};

/* =========================================================
   SIGNUP
========================================================= */

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =======================================================
     AUTH REDIRECT
  ======================================================= */

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/data-file-checks", {
        replace: true,
      });
    }
  }, [navigate]);

  /* =======================================================
     FORM HANDLING
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     PASSWORD QUALITY
  ======================================================= */

  const passwordStrength = useMemo(() => {
    const password = form.password;

    if (!password) {
      return {
        score: 0,
        label: "",
        color: COLORS.border,
      };
    }

    let score = 0;

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      return {
        score: 20,
        label: "Weak",
        color: "#DC2626",
      };
    }

    if (score === 2) {
      return {
        score: 40,
        label: "Fair",
        color: "#D97706",
      };
    }

    if (score === 3) {
      return {
        score: 65,
        label: "Good",
        color: "#2563EB",
      };
    }

    if (score === 4) {
      return {
        score: 82,
        label: "Strong",
        color: "#059669",
      };
    }

    return {
      score: 100,
      label: "Very strong",
      color: "#047857",
    };
  }, [form.password]);

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  const passwordsDoNotMatch =
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  /* =======================================================
     STANDARD SIGNUP
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(
        "Please complete all fields before creating your account."
      );

      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Your password must contain at least 6 characters."
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://abhistat.com/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
            confirm_password: form.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.detail &&
          data.detail
            .toLowerCase()
            .includes("already registered")
        ) {
          setError(
            "This email is already registered. Redirecting you to login..."
          );

          setTimeout(() => {
            navigate("/non-abhitech-login");

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
            "Unable to create your account."
        );
      }

      const userData = data.user || {
        email: form.email,
        name: form.name,
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

        state: {
          showWelcome: true,
        },
      });
    } catch (err) {
      console.error("Signup error:", err);

      setError(
        err?.message ||
          "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     GOOGLE SIGNUP
  ======================================================= */

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://abhistat.com/api/google-signup",
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
          response.status === 400 &&
          data.detail &&
          data.detail
            .toLowerCase()
            .includes("already registered")
        ) {
          setError(
            "This Google account is already registered. Redirecting you to login..."
          );

          setTimeout(() => {
            navigate("/non-abhitech-login");

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
            "Google signup failed."
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

        state: {
          showWelcome: true,
        },
      });
    } catch (err) {
      console.error("Google OAuth error:", err);

      setError(
        err?.message ||
          "Google signup could not be completed."
      );

      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleEmployeeLogin = () => {
    clearAuthData();
    navigate("/login");
  };

  const handleExternalLogin = () => {
    clearAuthData();
    navigate("/non-abhitech-login");
  };

  /* =======================================================
     SHARED FIELD STYLES
  ======================================================= */

  const fieldStyles = {
    "& .MuiOutlinedInput-root": {
      minHeight: "52px",

      borderRadius: "11px",

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
      fontSize: "0.88rem",

      "&::placeholder": {
        color: "#98A2B3",
        opacity: 1,
      },
    },
  };

  /* =======================================================
     FEATURES
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

      title: "Turn data into decisions",

      description:
        "Discover useful relationships and convert complex datasets into actionable insights.",
    },
  ];

  /* =======================================================
     GOOGLE CONFIG FALLBACK
  ======================================================= */

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Box
        sx={{
          minHeight: "100vh",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          bgcolor: COLORS.surface,

          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 430,

            p: 4,

            textAlign: "center",

            borderRadius: "16px",

            border: `1px solid ${COLORS.border}`,
          }}
        >
          <CircularProgress
            size={30}
            sx={{
              color: COLORS.blue,
            }}
          />

          <Typography
            sx={{
              mt: 2,

              color: COLORS.text,

              fontWeight: 700,
            }}
          >
            Preparing secure sign up
          </Typography>

          <Typography
            sx={{
              mt: 0.5,

              color: COLORS.muted,

              fontSize: "0.82rem",
            }}
          >
            Loading Google OAuth configuration...
          </Typography>
        </Paper>
      </Box>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
              sm: "880px",
            },

            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "1.02fr 0.98fr",
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
            {/* Grid pattern */}

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

            {/* Decorative circle */}

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

            {/* Main content */}

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Badge */}

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
                    md: "2.6rem",
                    lg: "3.1rem",
                  },

                  lineHeight: 1.08,

                  letterSpacing: "-0.045em",

                  fontWeight: 800,
                }}
              >
                Build a clearer view
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "#7DD3FC",
                  }}
                >
                  of your operational data.
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
                Create your AbhiStat account and
                access a focused environment for
                statistical analysis, comparison and
                data-driven decision making.
              </Typography>

              {/* Benefits */}

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
                  alt="AbhiStat statistical analysis"
                  sx={{
                    display: "block",

                    width: "100%",

                    maxHeight: "210px",

                    objectFit: "contain",
                  }}
                />
              </Box>
            </Box>

            {/* Footer */}

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
                  Secure account creation
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* =================================================
              RIGHT SIGNUP PANEL
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
                md: 6,
                lg: 8,
              },

              py: {
                xs: 5,
                md: 6,
              },

              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "440px",
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

                  mb: 3.5,
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
                        xs: "170px",
                        sm: "190px",
                      },

                      height: "auto",
                    }}
                  />
                </Box>
              </Box>

              {/* Mobile portal label */}

              <Box
                sx={{
                  display: {
                    xs: "flex",
                    md: "none",
                  },

                  alignItems: "center",
                  justifyContent: "center",

                  gap: 1,

                  mb: 2.5,
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

              {/* Heading */}

              <Typography
                component="h2"
                sx={{
                  color: COLORS.text,

                  fontSize: {
                    xs: "1.75rem",
                    sm: "1.95rem",
                  },

                  fontWeight: 800,

                  letterSpacing: "-0.035em",

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                Create your account
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,

                  color: COLORS.muted,

                  fontSize: "0.9rem",
                  lineHeight: 1.6,

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                Set up your external AbhiStat account
                to start analysing your data.
              </Typography>

              {/* Portal indicator */}

              <Box
                sx={{
                  mt: 2.5,

                  display: "flex",
                  alignItems: "center",

                  gap: 1.2,

                  p: 1.3,

                  borderRadius: "10px",

                  bgcolor: "#F8FAFC",

                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,

                    flexShrink: 0,

                    display: "grid",
                    placeItems: "center",

                    borderRadius: "8px",

                    bgcolor: alpha(
                      COLORS.blue,
                      0.07
                    ),

                    color: COLORS.blue,
                  }}
                >
                  <PersonOutlineRounded
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: COLORS.text,

                      fontSize: "0.76rem",
                      fontWeight: 750,
                    }}
                  >
                    External user registration
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.1,

                      color: COLORS.muted,

                      fontSize: "0.68rem",
                    }}
                  >
                    For clients and partners
                  </Typography>
                </Box>
              </Box>

              {/* =================================================
                  FORM
              ================================================= */}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  mt: 3,
                }}
              >
                {/* Name */}

                <Typography
                  component="label"
                  htmlFor="signup-name"
                  sx={{
                    display: "block",

                    mb: 0.7,

                    color: COLORS.text,

                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  Full name
                </Typography>

                <TextField
                  id="signup-name"
                  fullWidth
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineRounded
                          sx={{
                            color: COLORS.subtle,
                            fontSize: 19,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />

                {/* Email */}

                <Typography
                  component="label"
                  htmlFor="signup-email"
                  sx={{
                    display: "block",

                    mt: 1.8,
                    mb: 0.7,

                    color: COLORS.text,

                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  Email address
                </Typography>

                <TextField
                  id="signup-email"
                  fullWidth
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineRounded
                          sx={{
                            color: COLORS.subtle,
                            fontSize: 19,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />

                {/* Phone */}

                <Typography
                  component="label"
                  htmlFor="signup-phone"
                  sx={{
                    display: "block",

                    mt: 1.8,
                    mb: 0.7,

                    color: COLORS.text,

                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  Phone number
                </Typography>

                <TextField
                  id="signup-phone"
                  fullWidth
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="tel"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined
                          sx={{
                            color: COLORS.subtle,
                            fontSize: 19,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />

                {/* Password */}

                <Typography
                  component="label"
                  htmlFor="signup-password"
                  sx={{
                    display: "block",

                    mt: 1.8,
                    mb: 0.7,

                    color: COLORS.text,

                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  Password
                </Typography>

                <TextField
                  id="signup-password"
                  fullWidth
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a secure password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined
                          sx={{
                            color: COLORS.subtle,
                            fontSize: 19,
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
                          disabled={loading}
                          edge="end"
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

                {/* Password strength */}

                {form.password && (
                  <Box
                    sx={{
                      mt: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        mb: 0.6,
                      }}
                    >
                      <Typography
                        sx={{
                          color: COLORS.subtle,

                          fontSize: "0.66rem",
                        }}
                      >
                        Password strength
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            passwordStrength.color,

                          fontSize: "0.66rem",
                          fontWeight: 700,
                        }}
                      >
                        {passwordStrength.label}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={
                        passwordStrength.score
                      }
                      sx={{
                        height: 4,

                        borderRadius: "999px",

                        bgcolor: "#EEF1F4",

                        "& .MuiLinearProgress-bar": {
                          borderRadius: "999px",

                          bgcolor:
                            passwordStrength.color,

                          transition:
                            "all 0.3s ease",
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Confirm password */}

                <Typography
                  component="label"
                  htmlFor="signup-confirm-password"
                  sx={{
                    display: "block",

                    mt: 1.8,
                    mb: 0.7,

                    color: COLORS.text,

                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  Confirm password
                </Typography>

                <TextField
                  id="signup-confirm-password"
                  fullWidth
                  name="confirmPassword"
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  error={passwordsDoNotMatch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined
                          sx={{
                            color: passwordsDoNotMatch
                              ? COLORS.error
                              : passwordsMatch
                              ? COLORS.success
                              : COLORS.subtle,

                            fontSize: 19,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        {passwordsMatch && (
                          <CheckCircleRounded
                            sx={{
                              mr: 0.5,

                              color: COLORS.success,

                              fontSize: 19,
                            }}
                          />
                        )}

                        <IconButton
                          onClick={() =>
                            setShowConfirm(
                              (previous) => !previous
                            )
                          }
                          disabled={loading}
                          edge="end"
                          aria-label={
                            showConfirm
                              ? "Hide confirmed password"
                              : "Show confirmed password"
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
                          {showConfirm ? (
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

                {/* Match state */}

                {passwordsDoNotMatch && (
                  <Typography
                    sx={{
                      mt: 0.7,

                      color: COLORS.error,

                      fontSize: "0.68rem",
                    }}
                  >
                    Passwords do not match.
                  </Typography>
                )}

                {passwordsMatch && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      mt: 0.7,
                    }}
                  >
                    <CheckCircleRounded
                      sx={{
                        color: COLORS.success,
                        fontSize: 14,
                      }}
                    />

                    <Typography
                      sx={{
                        color: COLORS.success,

                        fontSize: "0.68rem",
                        fontWeight: 600,
                      }}
                    >
                      Passwords match
                    </Typography>
                  </Stack>
                )}

                {/* Error */}

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mt: 2,

                      borderRadius: "10px",

                      border:
                        "1px solid #FECACA",

                      bgcolor:
                        COLORS.errorBackground,

                      color: "#991B1B",

                      fontSize: "0.76rem",

                      "& .MuiAlert-icon": {
                        color: COLORS.error,
                      },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Submit */}

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
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
                    mt: 2.5,

                    minHeight: "51px",

                    borderRadius: "11px",

                    bgcolor: COLORS.navy,

                    color: COLORS.white,

                    textTransform: "none",

                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "0.88rem",
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

                      <span>
                        Creating account...
                      </span>
                    </Stack>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </Box>

              {/* =================================================
                  GOOGLE
              ================================================= */}

              <Divider
                sx={{
                  my: 2.5,

                  "&::before, &::after": {
                    borderColor: COLORS.border,
                  },
                }}
              >
                <Typography
                  sx={{
                    px: 1,

                    color: COLORS.subtle,

                    fontSize: "0.67rem",
                    fontWeight: 600,
                  }}
                >
                  OR SIGN UP WITH
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
                  text="signup_with"
                  theme="outline"
                />
              </Box>

              {/* =================================================
                  LOGIN LINK
              ================================================= */}

              <Box
                sx={{
                  mt: 2.5,

                  p: 1.6,

                  textAlign: "center",

                  borderRadius: "10px",

                  bgcolor: "#F8FAFC",

                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.muted,

                    fontSize: "0.77rem",
                  }}
                >
                  Already have an AbhiStat account?
                </Typography>

                <Button
                  variant="text"
                  onClick={handleExternalLogin}
                  disabled={loading}
                  sx={{
                    mt: 0.15,

                    p: 0,

                    minWidth: "auto",

                    color: COLORS.blue,

                    textTransform: "none",

                    fontSize: "0.78rem",
                    fontWeight: 750,

                    "&:hover": {
                      bgcolor: "transparent",
                      color: COLORS.blueDark,
                    },
                  }}
                >
                  Sign in to your account
                </Button>
              </Box>

              {/* =================================================
                  EMPLOYEE LOGIN
              ================================================= */}

              <Box
                sx={{
                  mt: 2.5,
                  pt: 2.5,

                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <Typography
                  sx={{
                    mb: 1.2,

                    textAlign: "center",

                    color: COLORS.subtle,

                    fontSize: "0.7rem",
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
                        width: 20,
                        height: 20,

                        objectFit: "contain",
                      }}
                    />
                  }
                  sx={{
                    minHeight: "48px",

                    borderRadius: "10px",

                    borderColor: COLORS.border,

                    bgcolor: COLORS.white,

                    color: COLORS.text,

                    textTransform: "none",

                    fontFamily:
                      "'Inter', sans-serif",

                    fontSize: "0.82rem",
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
                spacing={0.7}
                justifyContent="center"
                alignItems="center"
                sx={{
                  mt: 2.5,
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

                    fontSize: "0.65rem",
                  }}
                >
                  Secure account creation powered by
                  AbhiStat
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Signup;