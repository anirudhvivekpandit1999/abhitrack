import React, { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

import {
  AccountBalanceRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  CreditCardRounded,
  LockRounded,
  PaymentsRounded,
  SecurityRounded,
  VerifiedUserRounded,
} from "@mui/icons-material";

import { config } from "../../config";

/* =========================================================
   RAZORPAY SDK LOADER
========================================================= */

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      return resolve(true);
    }

    const script = document.createElement("script");

    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#0B1F33",
  navyLight: "#12314D",

  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueSoft: "#EFF6FF",

  cyan: "#38BDF8",

  green: "#16A34A",
  greenSoft: "#F0FDF4",

  text: "#172033",
  muted: "#667085",
  subtle: "#98A2B3",

  border: "#E4E7EC",
  surface: "#F7F9FC",

  white: "#FFFFFF",
};

/* =========================================================
   PAYMENT PAGE
========================================================= */

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  /* =======================================================
     CREATE RAZORPAY ORDER
  ======================================================= */

  const createOrder = async () => {
    const res = await fetch(
      `${config.APIBaseURL}/payments/create-order`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount_rupees: 1,
          currency: "INR",

          notes: {
            purpose: "Non-Abhitech signup",
          },
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));

      throw new Error(
        data.detail ||
          data.message ||
          "Failed to create payment order"
      );
    }

    return res.json();
  };

  /* =======================================================
     VERIFY PAYMENT
  ======================================================= */

  const verifyPayment = async (payload) => {
    const res = await fetch(
      `${config.APIBaseURL}/payments/verify`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));

      throw new Error(
        data.detail ||
          data.message ||
          "Payment verification failed"
      );
    }

    return res.json();
  };

  /* =======================================================
     START PAYMENT
  ======================================================= */

  const startPayment = async () => {
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      /* Load Razorpay */

      const sdkOk = await loadRazorpay();

      if (!sdkOk) {
        throw new Error(
          "Unable to load Razorpay. Please check your connection and try again."
        );
      }

      /* Create order */

      const { order, key_id } = await createOrder();

      /* Razorpay configuration */

      const options = {
        key: key_id,

        amount: order.amount,

        currency: order.currency,

        name: "Abhitech Statistical Tool",

        description: "External Account Activation",

        order_id: order.id,

        /* ===============================================
           PAYMENT SUCCESS CALLBACK
        =============================================== */

        handler: async function (response) {
          try {
            const result = await verifyPayment({
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,
            });

            setSuccess(result);
            setError("");
          } catch (e) {
            setError(
              e.message ||
                "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },

        /* ===============================================
           RAZORPAY APPEARANCE
        =============================================== */

        theme: {
          color: COLORS.navy,
        },

        /* ===============================================
           PAYMENT METHODS
        =============================================== */

        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
          emi: false,
          paylater: true,
        },

        notes: {
          feature: "non-abhitech-signup",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      /* ===============================================
         RAZORPAY PAYMENT FAILURE
      =============================================== */

      rzp.on("payment.failed", function (response) {
        const description =
          response?.error?.description ||
          "Payment could not be completed.";

        setError(description);
        setLoading(false);
      });

      rzp.open();
    } catch (e) {
      setError(
        e.message ||
          "Something went wrong while starting the payment."
      );

      setLoading(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        position: "relative",
        overflow: "hidden",

        bgcolor: COLORS.surface,

        p: {
          xs: 2,
          sm: 3,
          md: 5,
        },

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
      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <Box
        sx={{
          position: "absolute",

          width: 500,
          height: 500,

          borderRadius: "50%",

          top: -280,
          right: -180,

          background: `radial-gradient(
            circle,
            ${alpha(COLORS.blue, 0.09)} 0%,
            transparent 70%
          )`,

          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",

          width: 450,
          height: 450,

          borderRadius: "50%",

          bottom: -260,
          left: -180,

          background: `radial-gradient(
            circle,
            ${alpha(COLORS.cyan, 0.08)} 0%,
            transparent 70%
          )`,

          pointerEvents: "none",
        }}
      />

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: "100%",

            borderRadius: {
              xs: "20px",
              sm: "24px",
            },

            overflow: "hidden",

            bgcolor: COLORS.white,

            border: `1px solid ${COLORS.border}`,

            boxShadow: `
              0 24px 70px rgba(16, 24, 40, 0.08),
              0 4px 12px rgba(16, 24, 40, 0.03)
            `,
          }}
        >
          {/* =================================================
              TOP SECURITY STRIP
          ================================================= */}

          <Box
            sx={{
              px: {
                xs: 3,
                sm: 4,
              },

              py: 1.5,

              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",

              gap: 2,

              bgcolor: "#F8FAFC",

              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <LockRounded
                sx={{
                  fontSize: 16,
                  color: COLORS.green,
                }}
              />

              <Typography
                sx={{
                  color: COLORS.muted,

                  fontSize: "0.72rem",
                  fontWeight: 650,
                }}
              >
                Secure account activation
              </Typography>
            </Stack>

            <Chip
              icon={
                <VerifiedUserRounded
                  sx={{
                    fontSize: "15px !important",
                  }}
                />
              }
              label="Protected payment"
              size="small"
              sx={{
                display: {
                  xs: "none",
                  sm: "inline-flex",
                },

                height: 26,

                bgcolor: COLORS.greenSoft,
                color: COLORS.green,

                border: `1px solid ${alpha(
                  COLORS.green,
                  0.15
                )}`,

                fontSize: "0.65rem",
                fontWeight: 700,

                "& .MuiChip-icon": {
                  color: COLORS.green,
                },
              }}
            />
          </Box>

          <CardContent
            sx={{
              p: {
                xs: 3,
                sm: 5,
                md: 6,
              },

              "&:last-child": {
                pb: {
                  xs: 3,
                  sm: 5,
                  md: 6,
                },
              },
            }}
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <Box
              sx={{
                textAlign: "center",

                maxWidth: 560,

                mx: "auto",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,

                  mx: "auto",
                  mb: 2.5,

                  display: "grid",
                  placeItems: "center",

                  borderRadius: "18px",

                  bgcolor: COLORS.blueSoft,

                  border: `1px solid ${alpha(
                    COLORS.blue,
                    0.1
                  )}`,

                  color: COLORS.blue,
                }}
              >
                <PaymentsRounded
                  sx={{
                    fontSize: 31,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  color: COLORS.text,

                  fontSize: {
                    xs: "1.55rem",
                    sm: "1.85rem",
                  },

                  lineHeight: 1.2,

                  fontWeight: 800,

                  letterSpacing: "-0.03em",
                }}
              >
                Complete your account activation
              </Typography>

              <Typography
                sx={{
                  mt: 1.2,

                  color: COLORS.muted,

                  fontSize: "0.88rem",

                  lineHeight: 1.65,
                }}
              >
                Complete the one-time verification
                payment to activate your external
                AbhiStat account.
              </Typography>
            </Box>

            {/* =================================================
                PAYMENT AMOUNT
            ================================================= */}

            <Box
              sx={{
                mt: 4,

                p: {
                  xs: 2.5,
                  sm: 3,
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

                borderRadius: "16px",

                bgcolor: "#F8FAFC",

                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: COLORS.muted,

                    fontSize: "0.72rem",
                    fontWeight: 650,

                    letterSpacing: "0.02em",
                  }}
                >
                  ACCOUNT ACTIVATION
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,

                    color: COLORS.text,

                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  External user verification
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,

                    color: COLORS.subtle,

                    fontSize: "0.72rem",
                  }}
                >
                  One-time payment
                </Typography>
              </Box>

              <Box
                sx={{
                  textAlign: {
                    xs: "left",
                    sm: "right",
                  },
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.text,

                    fontSize: {
                      xs: "2rem",
                      sm: "2.3rem",
                    },

                    lineHeight: 1,

                    fontWeight: 850,

                    letterSpacing: "-0.04em",
                  }}
                >
                  ₹1
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,

                    color: COLORS.subtle,

                    fontSize: "0.68rem",
                  }}
                >
                  INR
                </Typography>
              </Box>
            </Box>

            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: 3,

                  borderRadius: "12px",

                  alignItems: "center",

                  "& .MuiAlert-message": {
                    fontSize: "0.8rem",
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                icon={<CheckCircleRounded />}
                sx={{
                  mt: 3,

                  borderRadius: "12px",

                  alignItems: "center",

                  "& .MuiAlert-message": {
                    fontSize: "0.8rem",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  Payment verified successfully
                </Typography>

                {success.payment?.id && (
                  <Typography
                    sx={{
                      mt: 0.25,

                      fontSize: "0.7rem",

                      wordBreak: "break-all",
                    }}
                  >
                    Payment ID: {success.payment.id}
                  </Typography>
                )}
              </Alert>
            )}

            {/* =================================================
                PAYMENT BUTTON
            ================================================= */}

            {!success && (
              <Button
                fullWidth
                variant="contained"
                onClick={startPayment}
                disabled={loading}
                endIcon={
                  !loading && (
                    <ArrowForwardRounded />
                  )
                }
                sx={{
                  mt: 3,

                  minHeight: 54,

                  borderRadius: "12px",

                  bgcolor: COLORS.navy,

                  color: COLORS.white,

                  textTransform: "none",

                  fontSize: "0.9rem",
                  fontWeight: 750,

                  boxShadow:
                    "0 8px 20px rgba(11,31,51,0.16)",

                  "&:hover": {
                    bgcolor: COLORS.navyLight,

                    transform:
                      "translateY(-1px)",

                    boxShadow:
                      "0 12px 25px rgba(11,31,51,0.2)",
                  },

                  "&.Mui-disabled": {
                    bgcolor: "#D0D5DD",
                    color: COLORS.white,
                  },

                  transition:
                    "all 0.2s ease",
                }}
              >
                {loading ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.2}
                  >
                    <CircularProgress
                      size={18}
                      thickness={5}
                      sx={{
                        color: COLORS.white,
                      }}
                    />

                    <span>
                      Opening secure payment...
                    </span>
                  </Stack>
                ) : (
                  "Pay ₹1 securely"
                )}
              </Button>
            )}

            {/* =================================================
                PAYMENT METHODS
            ================================================= */}

            {!success && (
              <>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{
                    my: 3,
                  }}
                >
                  <Divider
                    sx={{
                      flex: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      color: COLORS.subtle,

                      fontSize: "0.65rem",
                      fontWeight: 600,
                    }}
                  >
                    PAYMENT OPTIONS
                  </Typography>

                  <Divider
                    sx={{
                      flex: 1,
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  spacing={{
                    xs: 1,
                    sm: 2,
                  }}
                  justifyContent="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <PaymentMethod
                    icon={<AccountBalanceRounded />}
                    label="UPI"
                  />

                  <PaymentMethod
                    icon={<CreditCardRounded />}
                    label="Cards"
                  />

                  <PaymentMethod
                    icon={<AccountBalanceRounded />}
                    label="Net Banking"
                  />

                  <PaymentMethod
                    icon={<PaymentsRounded />}
                    label="Wallets"
                  />
                </Stack>
              </>
            )}

            {/* =================================================
                SECURITY MESSAGE
            ================================================= */}

            <Box
              sx={{
                mt: 4,
                pt: 3,

                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="flex-start"
              >
                <SecurityRounded
                  sx={{
                    mt: 0.1,

                    flexShrink: 0,

                    fontSize: 18,

                    color: COLORS.green,
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      color: COLORS.text,

                      fontSize: "0.73rem",
                      fontWeight: 700,
                    }}
                  >
                    Secure payment processing
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,

                      color: COLORS.subtle,

                      fontSize: "0.67rem",

                      lineHeight: 1.55,
                    }}
                  >
                    Payment is processed through
                    Razorpay. AbhiStat does not
                    directly collect or store your
                    card, UPI, or banking credentials.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* =================================================
            PAGE FOOTER
        ================================================= */}

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

/* =========================================================
   PAYMENT METHOD COMPONENT
========================================================= */

const PaymentMethod = ({ icon, label }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.7}
      sx={{
        px: 1.4,
        py: 0.8,

        borderRadius: "8px",

        bgcolor: "#F8FAFC",

        border: `1px solid ${COLORS.border}`,

        color: COLORS.muted,
      }}
    >
      {React.cloneElement(icon, {
        sx: {
          fontSize: 15,
        },
      })}

      <Typography
        sx={{
          fontSize: "0.67rem",
          fontWeight: 650,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};

export default Payment;