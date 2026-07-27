import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip as MuiTooltip,
  Chip,
  Divider,
} from "@mui/material";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import GradientColorPicker from "./GradientColorPicker";

/* ============================================================================
   CHART SETTINGS MODAL
============================================================================ */

const ChartSettingsModal = ({
  open,
  onClose,
  onApply,
  onReset,
  colorPairs = [],
  colorOptions = [],
  featureSections = [],
  colorSection = true,
  title = "Chart Settings",
  description = "Customize your visualization appearance",
  colorSectionTitle,
  minHeight = 600,
  maxWidth = "lg",
  multiDatasetColors = false,
  children,
}) => {
  const pairCount = colorPairs.length;

  /* ==========================================================================
     HANDLERS
  ========================================================================== */

  const handleReset = () => {
    if (typeof onReset === "function") {
      onReset();
    }
  };

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleApply = () => {
    if (typeof onApply === "function") {
      onApply();
    }
  };

  /* ==========================================================================
     COLOR SECTION
  ========================================================================== */

  const renderColorSection = () => {
    if (!colorSection) {
      return null;
    }

    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E5EAF2",
          borderRadius: 3,
          overflow: "hidden",
          backgroundImage: "none",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* Section Header */}

        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: "1px solid #EDF1F6",
            bgcolor: "#FCFDFE",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                bgcolor: "#F5F3FF",
                color: "#7C3AED",
              }}
            >
              <PaletteRoundedIcon sx={{ fontSize: 19 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#1E293B",
                  fontWeight: 800,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                {colorSectionTitle ||
                  (multiDatasetColors
                    ? "Dataset Colors by Variable Pair"
                    : "Variable Pair Colors")}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "#64748B",
                  mt: 0.25,
                }}
              >
                {multiDatasetColors
                  ? "Assign independent colors to each dataset within every variable pair."
                  : "Choose how each variable pair appears in the visualization."}
              </Typography>
            </Box>
          </Box>

          {pairCount > 0 && (
            <Chip
              size="small"
              label={`${pairCount} ${pairCount === 1 ? "pair" : "pairs"}`}
              sx={{
                flexShrink: 0,
                height: 27,
                bgcolor: "#F1F5F9",
                color: "#475569",
                fontSize: "0.7rem",
                fontWeight: 750,
                "& .MuiChip-label": {
                  px: 1.1,
                },
              }}
            />
          )}
        </Box>

        {/* Section Body */}

        <CardContent
          sx={{
            p: { xs: 2, sm: 2.5 },
            "&:last-child": {
              pb: { xs: 2, sm: 2.5 },
            },
          }}
        >
          {pairCount === 0 ? (
            /* ================================================================
               EMPTY STATE
            ================================================================= */

            <Box
              sx={{
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
                border: "1px dashed #CBD5E1",
                borderRadius: 2.5,
                bgcolor: "#FAFBFD",
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2.5,
                  bgcolor: "#F1F5F9",
                  color: "#64748B",
                  mb: 1.5,
                }}
              >
                <PaletteRoundedIcon sx={{ fontSize: 26 }} />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: "#334155",
                  fontWeight: 750,
                }}
              >
                No variable pairs available
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#94A3B8",
                  mt: 0.6,
                  maxWidth: 330,
                  lineHeight: 1.6,
                }}
              >
                Select X and Y variables in the chart to enable individual color
                customization.
              </Typography>
            </Box>
          ) : (
            /* ================================================================
               COLOR PAIRS
            ================================================================= */

            <Grid container spacing={2}>
              {colorPairs.map((pair, index) => (
                <Grid
                  item
                  xs={12}
                  sm={multiDatasetColors ? 12 : 6}
                  md={multiDatasetColors ? 6 : 4}
                  key={pair.key || index}
                >
                  {multiDatasetColors ? (
                    /* ========================================================
                       MULTI-DATASET COLOR CARD
                    ========================================================= */

                    <Box
                      sx={{
                        height: "100%",
                        p: 2,
                        border: "1px solid #E7ECF3",
                        borderRadius: 2.5,
                        bgcolor: "#FAFBFD",
                        transition: "all 160ms ease",

                        "&:hover": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#D5DEEA",
                          boxShadow:
                            "0 7px 20px rgba(15, 23, 42, 0.055)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {/* Pair name */}

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 27,
                            height: 27,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "#EFF6FF",
                            color: "#2563EB",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </Box>

                        <Typography
                          variant="body2"
                          title={pair.label}
                          sx={{
                            minWidth: 0,
                            color: "#334155",
                            fontWeight: 750,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pair.label}
                        </Typography>
                      </Box>

                      <Divider
                        sx={{
                          mb: 2,
                          borderColor: "#E9EDF3",
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {/* With Product */}

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mb: 0.7,
                              color: "#64748B",
                              fontWeight: 700,
                            }}
                          >
                            With Product
                          </Typography>

                          <GradientColorPicker
                            value={pair.withProductColor}
                            onChange={(color) =>
                              pair.onWithProductColorChange?.(color)
                            }
                            label="With Product"
                            colorOptions={colorOptions}
                          />
                        </Box>

                        {/* Without Product */}

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mb: 0.7,
                              color: "#64748B",
                              fontWeight: 700,
                            }}
                          >
                            Without Product
                          </Typography>

                          <GradientColorPicker
                            value={pair.withoutProductColor}
                            onChange={(color) =>
                              pair.onWithoutProductColorChange?.(color)
                            }
                            label="Without Product"
                            colorOptions={colorOptions}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    /* ========================================================
                       SINGLE COLOR PAIR
                    ========================================================= */

                    <Box
                      sx={{
                        height: "100%",
                        p: 1.75,
                        border: "1px solid #E7ECF3",
                        borderRadius: 2.5,
                        bgcolor: "#FAFBFD",
                        transition: "all 160ms ease",

                        "&:hover": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#D5DEEA",
                          boxShadow:
                            "0 7px 20px rgba(15, 23, 42, 0.055)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <GradientColorPicker
                        value={pair.value}
                        onChange={(color) => pair.onChange?.(color)}
                        label={pair.label}
                        colorOptions={colorOptions}
                      />
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    );
  };

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      scroll="paper"
      PaperProps={{
        elevation: 0,

        sx: {
          minHeight,
          maxHeight: "90vh",
          borderRadius: { xs: 2, sm: 3 },
          overflow: "hidden",
          border: "1px solid #DDE4ED",
          bgcolor: "#F7F9FC",
          backgroundImage: "none",
          boxShadow: "0 28px 80px rgba(15, 23, 42, 0.24)",
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(15, 23, 42, 0.46)",
          backdropFilter: "blur(3px)",
        },
      }}
    >
      {/* ======================================================================
          HEADER
      ====================================================================== */}

      <DialogTitle
        sx={{
          p: 0,
          borderBottom: "1px solid #E5EAF2",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.4 },
          }}
        >
          {/* Decorative background */}

          <Box
            sx={{
              position: "absolute",
              width: 190,
              height: 190,
              borderRadius: "50%",
              bgcolor: "#EFF6FF",
              right: -65,
              top: -115,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 85,
              height: 85,
              borderRadius: "50%",
              bgcolor: "#F5F3FF",
              right: 105,
              bottom: -65,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Heading */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: { xs: 42, sm: 46 },
                  height: { xs: 42, sm: 46 },
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2.25,
                  bgcolor: "#172B4D",
                  color: "#FFFFFF",
                  boxShadow: "0 8px 18px rgba(23, 43, 77, 0.17)",
                }}
              >
                <SettingsRoundedIcon sx={{ fontSize: 23 }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#0F172A",
                    fontWeight: 850,
                    fontSize: {
                      xs: "1rem",
                      sm: "1.18rem",
                    },
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontSize: {
                      xs: "0.75rem",
                      sm: "0.82rem",
                    },
                    mt: 0.35,
                  }}
                >
                  {description}
                </Typography>
              </Box>
            </Box>

            {/* Header controls */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <MuiTooltip title="Reset all settings to default" arrow>
                <IconButton
                  onClick={handleReset}
                  aria-label="Reset chart settings"
                  sx={{
                    width: 38,
                    height: 38,
                    border: "1px solid #E2E8F0",
                    borderRadius: 2,
                    bgcolor: "#FFFFFF",
                    color: "#64748B",

                    "&:hover": {
                      bgcolor: "#FFF7ED",
                      borderColor: "#FED7AA",
                      color: "#C2410C",
                    },
                  }}
                >
                  <RestoreRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </MuiTooltip>

              <MuiTooltip title="Close" arrow>
                <IconButton
                  onClick={handleClose}
                  aria-label="Close chart settings"
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    color: "#64748B",

                    "&:hover": {
                      bgcolor: "#F1F5F9",
                      color: "#0F172A",
                    },
                  }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 21 }} />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      {/* ======================================================================
          CONTENT
      ====================================================================== */}

      <DialogContent
        dividers={false}
        sx={{
          p: 0,
          bgcolor: "#F7F9FC",
          overflowY: "auto",

          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",

          "&::-webkit-scrollbar": {
            width: 7,
          },

          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },

          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: 10,
          },
        }}
      >
        <Box
          sx={{
            p: {
              xs: 1.5,
              sm: 2.5,
              md: 3,
            },
          }}
        >
          {/* ==================================================================
              FEATURE SECTIONS
          ================================================================== */}

          {featureSections.length > 0 && (
            <Box sx={{ mb: colorSection ? 2.5 : 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                  px: 0.25,
                }}
              >
                <TuneRoundedIcon
                  sx={{
                    fontSize: 17,
                    color: "#64748B",
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    color: "#64748B",
                    fontWeight: 800,
                    fontSize: "0.68rem",
                    letterSpacing: "0.09em",
                    lineHeight: 1,
                  }}
                >
                  Visualization Controls
                </Typography>

                <Chip
                  size="small"
                  label={featureSections.length}
                  sx={{
                    height: 21,
                    bgcolor: "#E2E8F0",
                    color: "#475569",
                    fontWeight: 800,
                    fontSize: "0.65rem",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {featureSections.map((section, idx) => (
                  <Card
                    key={idx}
                    elevation={0}
                    sx={{
                      border: "1px solid #E5EAF2",
                      borderRadius: 3,
                      bgcolor: "#FFFFFF",
                      backgroundImage: "none",
                      overflow: "visible",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: {
                          xs: 2,
                          sm: 2.5,
                        },

                        "&:last-child": {
                          pb: {
                            xs: 2,
                            sm: 2.5,
                          },
                        },
                      }}
                    >
                      {section}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* ==================================================================
              COLOR CONFIGURATION
          ================================================================== */}

          {renderColorSection()}

          {/* ==================================================================
              CUSTOM CHILD CONTENT
          ================================================================== */}

          {children && (
            <Box
              sx={{
                mt:
                  featureSections.length > 0 || colorSection
                    ? 2.5
                    : 0,
              }}
            >
              {children}
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* ======================================================================
          FOOTER
      ====================================================================== */}

      <DialogActions
        sx={{
          px: {
            xs: 1.5,
            sm: 3,
          },
          py: {
            xs: 1.5,
            sm: 2,
          },

          borderTop: "1px solid #E5EAF2",
          bgcolor: "#FFFFFF",

          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Reset */}

        <Button
          onClick={handleReset}
          startIcon={<RestoreRoundedIcon />}
          sx={{
            display: {
              xs: "none",
              sm: "inline-flex",
            },
            minHeight: 40,
            px: 1.5,
            color: "#64748B",
            borderRadius: 2,
            textTransform: "none",
            fontSize: "0.8rem",
            fontWeight: 700,

            "&:hover": {
              color: "#C2410C",
              bgcolor: "#FFF7ED",
            },
          }}
        >
          Reset Defaults
        </Button>

        {/* Main actions */}

        <Box
          sx={{
            ml: {
              xs: 0,
              sm: "auto",
            },
            width: {
              xs: "100%",
              sm: "auto",
            },
            display: "flex",
            gap: 1.25,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            fullWidth
            sx={{
              minWidth: {
                sm: 100,
              },
              minHeight: 42,
              px: 2,
              borderRadius: 2,
              borderColor: "#D8E0EA",
              color: "#475569",
              bgcolor: "#FFFFFF",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",

              "&:hover": {
                borderColor: "#B8C4D4",
                bgcolor: "#F8FAFC",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleApply}
            variant="contained"
            startIcon={<CheckRoundedIcon />}
            fullWidth
            sx={{
              minWidth: {
                sm: 145,
              },
              minHeight: 42,
              px: 2.25,
              borderRadius: 2,
              bgcolor: "#172B4D",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 750,
              boxShadow: "none",

              "&:hover": {
                bgcolor: "#223A61",
                boxShadow:
                  "0 7px 18px rgba(23, 43, 77, 0.18)",
              },
            }}
          >
            Apply Changes
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChartSettingsModal;