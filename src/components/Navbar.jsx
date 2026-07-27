import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  Tooltip,
  Chip,
} from "@mui/material";

import {
  MenuBookOutlined,
  BookmarkBorderRounded,
  KeyboardArrowDownRounded,
  LogoutRounded,
  PersonOutlineRounded,
  HomeRounded,
} from "@mui/icons-material";

import { useAuth } from "../hooks/useAuth";
import SavedVisualizationsList from "./SavedVisualizationsList";


/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const COLORS = {
  navy: "#1A2B4B",
  navyDark: "#13213A",
  blue: "#2563EB",
  blueLight: "#EFF6FF",

  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  borderLight: "#EDF1F5",

  background: "#FFFFFF",
  surface: "#F8FAFC",
};


/* ============================================================================
   NAVBAR
============================================================================ */

const Navbar = () => {

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();


  /* ==========================================================================
     STATE
  ========================================================================== */

  const [
    anchorEl,
    setAnchorEl,
  ] = useState(null);

  const [
    savedVizOpen,
    setSavedVizOpen,
  ] = useState(false);

  const profileMenuOpen =
    Boolean(anchorEl);


  /* ==========================================================================
     USER INFORMATION
  ========================================================================== */

  const userInitials =
    useMemo(() => {

      if (!user?.name) {
        return "U";
      }

      const parts =
        user.name
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      if (parts.length === 1) {
        return parts[0]
          .charAt(0)
          .toUpperCase();
      }

      return (
        parts[0]
          .charAt(0) +
        parts[
          parts.length - 1
        ].charAt(0)
      ).toUpperCase();

    }, [user]);


  /* ==========================================================================
     HANDLERS
  ========================================================================== */

  const handleLogoClick = () => {
    navigate("/");
  };


  const handleProfileClick = (
    event
  ) => {
    setAnchorEl(
      event.currentTarget
    );
  };


  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleLogout = () => {

    handleClose();

    logout();
  };


  const handleSavedVisualizations =
    () => {
      setSavedVizOpen(true);
    };


  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor:
            "rgba(255,255,255,0.96)",

          color:
            COLORS.textPrimary,

          borderBottom:
            `1px solid ${COLORS.border}`,

          backdropFilter:
            "blur(14px)",

          WebkitBackdropFilter:
            "blur(14px)",

          zIndex:
            (theme) =>
              theme.zIndex.appBar,
        }}
      >

        <Toolbar
          sx={{
            minHeight: {
              xs: "64px !important",
              md: "70px !important",
            },

            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap: 2,
          }}
        >

          {/* ================================================================
              BRAND
          ================================================================= */}

          <Box
            onClick={
              handleLogoClick
            }
            role="button"
            tabIndex={0}
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                  "Enter" ||
                event.key === " "
              ) {
                handleLogoClick();
              }
            }}
            sx={{
              minWidth: 0,

              display: "flex",

              alignItems:
                "center",

              gap: {
                xs: 1,
                md: 1.4,
              },

              cursor:
                "pointer",

              userSelect:
                "none",

              "&:hover img":
                {
                  transform:
                    "scale(1.025)",
                },
            }}
          >

            {/* LOGO */}

            <Box
              sx={{
                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src="/abhitech-logo.png"
                alt="Abhitech"
                sx={{
                  height: {
                    xs: 28,
                    md: 34,
                  },

                  width: "auto",

                  objectFit:
                    "contain",

                  transition:
                    "transform 160ms ease",
                }}
              />
            </Box>


            {/* DIVIDER */}

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },

                width: "1px",

                height: 28,

                mx: 0.25,

                bgcolor:
                  COLORS.border,
              }}
            />


            {/* PRODUCT NAME */}

            <Box
              sx={{
                minWidth: 0,

                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              <Typography
                sx={{
                  color:
                    COLORS.navy,

                  fontFamily:
                    "Inter, sans-serif",

                  fontSize: {
                    sm: "0.85rem",
                    md: "0.94rem",
                  },

                  fontWeight:
                    750,

                  lineHeight:
                    1.25,

                  letterSpacing:
                    "-0.015em",

                  whiteSpace:
                    "nowrap",
                }}
              >
                Abhitech Statistical
                Analysis Tool
              </Typography>

              <Typography
                sx={{
                  display: {
                    sm: "none",
                    lg: "block",
                  },

                  mt: 0.15,

                  color:
                    COLORS.textMuted,

                  fontSize:
                    "0.57rem",

                  fontWeight:
                    500,

                  letterSpacing:
                    "0.015em",
                }}
              >
                Data analysis &
                visualization platform
              </Typography>
            </Box>

          </Box>


          {/* ================================================================
              RIGHT NAVIGATION
          ================================================================= */}

          <Box
            sx={{
              display: "flex",

              alignItems:
                "center",

              gap: {
                xs: 0.4,
                sm: 0.75,
              },

              flexShrink: 0,
            }}
          >

            {/* ==============================================================
                USER MANUAL
            =============================================================== */}

            <Tooltip
              title="Open User Manual"
              arrow
            >
              <Button
                onClick={() =>
                  navigate(
                    "/manual"
                  )
                }
                startIcon={
                  <MenuBookOutlined />
                }
                sx={{
                  ...navButtonSx,

                  display: {
                    xs: "none",
                    md: "inline-flex",
                  },
                }}
              >
                User Manual
              </Button>
            </Tooltip>


            {/* ==============================================================
                MOBILE MANUAL
            =============================================================== */}

            <Tooltip
              title="User Manual"
              arrow
            >
              <IconButton
                onClick={() =>
                  navigate(
                    "/manual"
                  )
                }
                sx={{
                  ...navIconButtonSx,

                  display: {
                    xs: "inline-flex",
                    md: "none",
                  },
                }}
              >
                <MenuBookOutlined
                  sx={{
                    fontSize: 19,
                  }}
                />
              </IconButton>
            </Tooltip>


            {/* ==============================================================
                SAVED VISUALIZATIONS
            =============================================================== */}

            {user && (
              <>
                <Tooltip
                  title="View Saved Visualizations"
                  arrow
                >
                  <Button
                    onClick={
                      handleSavedVisualizations
                    }
                    startIcon={
                      <BookmarkBorderRounded />
                    }
                    sx={{
                      ...navButtonSx,

                      display: {
                        xs: "none",
                        lg: "inline-flex",
                      },
                    }}
                  >
                    Saved Visualizations
                  </Button>
                </Tooltip>


                {/* MOBILE / TABLET */}

                <Tooltip
                  title="Saved Visualizations"
                  arrow
                >
                  <IconButton
                    onClick={
                      handleSavedVisualizations
                    }
                    sx={{
                      ...navIconButtonSx,

                      display: {
                        xs: "inline-flex",
                        lg: "none",
                      },
                    }}
                  >
                    <BookmarkBorderRounded
                      sx={{
                        fontSize:
                          19,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </>
            )}


            {/* ==============================================================
                SEPARATOR
            =============================================================== */}

            {user && (
              <Box
                sx={{
                  width: "1px",

                  height: 28,

                  mx: {
                    xs: 0.2,
                    sm: 0.5,
                  },

                  bgcolor:
                    COLORS.border,
                }}
              />
            )}


            {/* ==============================================================
                USER PROFILE
            =============================================================== */}

            {user && (
              <Box>
                <Tooltip
                  title="Account"
                  arrow
                >
                  <Button
                    id="profile-button"
                    onClick={
                      handleProfileClick
                    }
                    aria-controls={
                      profileMenuOpen
                        ? "profile-menu"
                        : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={
                      profileMenuOpen
                        ? "true"
                        : undefined
                    }
                    sx={{
                      minWidth:
                        "auto",

                      p: 0.45,

                      pr: {
                        xs: 0.45,
                        md: 0.8,
                      },

                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: 0.7,

                      border:
                        "1px solid transparent",

                      borderRadius:
                        2,

                      color:
                        COLORS.textPrimary,

                      textTransform:
                        "none",

                      transition:
                        "background-color 150ms ease, border-color 150ms ease",

                      "&:hover":
                        {
                          bgcolor:
                            COLORS.surface,

                          borderColor:
                            COLORS.border,
                        },
                    }}
                  >

                    {/* AVATAR */}

                    <Avatar
                      alt={
                        user.name ||
                        "User"
                      }
                      sx={{
                        width: 34,

                        height: 34,

                        bgcolor:
                          COLORS.navy,

                        color:
                          "#FFFFFF",

                        fontSize:
                          "0.72rem",

                        fontWeight:
                          750,

                        boxShadow:
                          "0 2px 6px rgba(26,43,75,0.16)",
                      }}
                    >
                      {userInitials}
                    </Avatar>


                    {/* USER NAME */}

                    <Box
                      sx={{
                        display: {
                          xs: "none",
                          md: "block",
                        },

                        maxWidth:
                          120,

                        textAlign:
                          "left",
                      }}
                    >
                      <Typography
                        sx={{
                          overflow:
                            "hidden",

                          color:
                            COLORS.textPrimary,

                          fontSize:
                            "0.68rem",

                          fontWeight:
                            750,

                          lineHeight:
                            1.25,

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {user.name ||
                          "User"}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.1,

                          color:
                            COLORS.textMuted,

                          fontSize:
                            "0.53rem",

                          fontWeight:
                            500,

                          lineHeight:
                            1.2,
                        }}
                      >
                        Account
                      </Typography>
                    </Box>


                    <KeyboardArrowDownRounded
                      sx={{
                        display: {
                          xs: "none",
                          md: "block",
                        },

                        ml: -0.2,

                        color:
                          COLORS.textMuted,

                        fontSize:
                          17,

                        transform:
                          profileMenuOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",

                        transition:
                          "transform 180ms ease",
                      }}
                    />

                  </Button>
                </Tooltip>


                {/* ============================================================
                    PROFILE MENU
                ============================================================ */}

                <Menu
                  id="profile-menu"
                  anchorEl={
                    anchorEl
                  }
                  open={
                    profileMenuOpen
                  }
                  onClose={
                    handleClose
                  }
                  MenuListProps={{
                    "aria-labelledby":
                      "profile-button",

                    sx: {
                      p: 0.75,
                    },
                  }}
                  transformOrigin={{
                    horizontal:
                      "right",

                    vertical:
                      "top",
                  }}
                  anchorOrigin={{
                    horizontal:
                      "right",

                    vertical:
                      "bottom",
                  }}
                  slotProps={{
                    paper: {
                      elevation: 0,

                      sx: {
                        mt: 1,

                        width: 260,

                        overflow:
                          "visible",

                        border:
                          `1px solid ${COLORS.border}`,

                        borderRadius:
                          2.5,

                        boxShadow:
                          "0 14px 35px rgba(15, 23, 42, 0.13)",

                        bgcolor:
                          "#FFFFFF",
                      },
                    },
                  }}
                >

                  {/* ==========================================================
                      ACCOUNT HEADER
                  =========================================================== */}

                  <Box
                    sx={{
                      px: 1.25,

                      pt: 1,

                      pb: 1.25,

                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 38,

                        height: 38,

                        bgcolor:
                          COLORS.navy,

                        color:
                          "#FFFFFF",

                        fontSize:
                          "0.75rem",

                        fontWeight:
                          750,
                      }}
                    >
                      {userInitials}
                    </Avatar>

                    <Box
                      sx={{
                        minWidth: 0,

                        flex: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          overflow:
                            "hidden",

                          color:
                            COLORS.textPrimary,

                          fontSize:
                            "0.75rem",

                          fontWeight:
                            750,

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {user.name ||
                          "User"}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.15,

                          color:
                            COLORS.textMuted,

                          fontSize:
                            "0.58rem",
                        }}
                      >
                        Signed in
                      </Typography>
                    </Box>

                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        height: 21,

                        bgcolor:
                          "#ECFDF5",

                        color:
                          "#047857",

                        fontSize:
                          "0.52rem",

                        fontWeight:
                          750,

                        border:
                          "1px solid #D1FAE5",
                      }}
                    />
                  </Box>


                  <Divider
                    sx={{
                      borderColor:
                        COLORS.borderLight,
                    }}
                  />


                  {/* ==========================================================
                      HOME
                  =========================================================== */}

                  <MenuItem
                    onClick={() => {
                      handleClose();

                      navigate("/");
                    }}
                    sx={
                      menuItemSx
                    }
                  >
                    <MenuIconBox>
                      <HomeRounded />
                    </MenuIconBox>

                    <Box>
                      <Typography
                        sx={
                          menuTitleSx
                        }
                      >
                        Dashboard
                      </Typography>

                      <Typography
                        sx={
                          menuDescriptionSx
                        }
                      >
                        Return to the
                        analysis workspace
                      </Typography>
                    </Box>
                  </MenuItem>


                  {/* ==========================================================
                      SAVED VISUALIZATIONS
                  =========================================================== */}

                  <MenuItem
                    onClick={() => {
                      handleClose();

                      setSavedVizOpen(
                        true
                      );
                    }}
                    sx={
                      menuItemSx
                    }
                  >
                    <MenuIconBox>
                      <BookmarkBorderRounded />
                    </MenuIconBox>

                    <Box>
                      <Typography
                        sx={
                          menuTitleSx
                        }
                      >
                        Saved Visualizations
                      </Typography>

                      <Typography
                        sx={
                          menuDescriptionSx
                        }
                      >
                        Open saved charts
                        and analyses
                      </Typography>
                    </Box>
                  </MenuItem>


                  {/* ==========================================================
                      USER MANUAL
                  =========================================================== */}

                  <MenuItem
                    onClick={() => {
                      handleClose();

                      navigate(
                        "/manual"
                      );
                    }}
                    sx={
                      menuItemSx
                    }
                  >
                    <MenuIconBox>
                      <MenuBookOutlined />
                    </MenuIconBox>

                    <Box>
                      <Typography
                        sx={
                          menuTitleSx
                        }
                      >
                        User Manual
                      </Typography>

                      <Typography
                        sx={
                          menuDescriptionSx
                        }
                      >
                        Documentation and
                        usage guidance
                      </Typography>
                    </Box>
                  </MenuItem>


                  <Divider
                    sx={{
                      my: 0.6,

                      borderColor:
                        COLORS.borderLight,
                    }}
                  />


                  {/* ==========================================================
                      LOGOUT
                  =========================================================== */}

                  <MenuItem
                    onClick={
                      handleLogout
                    }
                    sx={{
                      ...menuItemSx,

                      color:
                        "#DC2626",

                      "&:hover":
                        {
                          bgcolor:
                            "#FEF2F2",
                        },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,

                        height: 32,

                        display:
                          "grid",

                        placeItems:
                          "center",

                        flexShrink:
                          0,

                        borderRadius:
                          1.3,

                        bgcolor:
                          "#FEF2F2",

                        color:
                          "#DC2626",

                        "& svg":
                          {
                            fontSize:
                              17,
                          },
                      }}
                    >
                      <LogoutRounded />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          ...menuTitleSx,

                          color:
                            "#DC2626",
                        }}
                      >
                        Sign out
                      </Typography>

                      <Typography
                        sx={{
                          ...menuDescriptionSx,

                          color:
                            "#EF4444",
                        }}
                      >
                        End your current
                        session
                      </Typography>
                    </Box>

                  </MenuItem>

                </Menu>
              </Box>
            )}

          </Box>

        </Toolbar>
      </AppBar>


      {/* ======================================================================
          SAVED VISUALIZATIONS
      ====================================================================== */}

      <SavedVisualizationsList
        open={
          savedVizOpen
        }
        onClose={() =>
          setSavedVizOpen(false)
        }
      />
    </>
  );
};


/* ============================================================================
   MENU ICON BOX
============================================================================ */

const MenuIconBox = ({
  children,
}) => {

  return (
    <Box
      sx={{
        width: 32,

        height: 32,

        display: "grid",

        placeItems:
          "center",

        flexShrink: 0,

        borderRadius:
          1.3,

        bgcolor:
          "#F1F5F9",

        color:
          "#64748B",

        "& svg": {
          fontSize: 17,
        },
      }}
    >
      {children}
    </Box>
  );
};


/* ============================================================================
   SHARED STYLES
============================================================================ */

const navButtonSx = {
  minHeight: 36,

  px: 1.25,

  borderRadius: 1.5,

  color:
    COLORS.textSecondary,

  textTransform:
    "none",

  fontSize:
    "0.68rem",

  fontWeight: 700,

  "& .MuiButton-startIcon": {
    mr: 0.65,

    "& svg": {
      fontSize: 17,
    },
  },

  "&:hover": {
    color:
      COLORS.navy,

    bgcolor:
      COLORS.surface,
  },
};


const navIconButtonSx = {
  width: 36,

  height: 36,

  border:
    "1px solid transparent",

  borderRadius: 1.5,

  color:
    COLORS.textSecondary,

  "&:hover": {
    color:
      COLORS.navy,

    bgcolor:
      COLORS.surface,

    borderColor:
      COLORS.border,
  },
};


const menuItemSx = {
  minHeight: 52,

  px: 1,

  py: 0.8,

  gap: 1,

  borderRadius: 1.5,

  alignItems: "center",

  transition:
    "background-color 120ms ease",

  "&:hover": {
    bgcolor:
      COLORS.surface,
  },
};


const menuTitleSx = {
  color:
    COLORS.textPrimary,

  fontSize:
    "0.68rem",

  fontWeight: 700,

  lineHeight: 1.3,
};


const menuDescriptionSx = {
  mt: 0.15,

  color:
    COLORS.textMuted,

  fontSize:
    "0.54rem",

  lineHeight: 1.35,
};


/* ============================================================================
   EXPORT
============================================================================ */

export default Navbar;