import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardMedia,
  CardActionArea,
  Grid,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Chip,
  Checkbox,
  FormControlLabel,
  Paper,
  Fade,
} from "@mui/material";

import {
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import {
  VisibilityRounded,
  DownloadRounded,
  RefreshRounded,
  CloseRounded,
  FilterListRounded,
  AccountCircleOutlined,
  CheckBoxRounded,
  CheckBoxOutlineBlankRounded,
  SelectAllRounded,
  CollectionsBookmarkRounded,
  CalendarMonthOutlined,
  BarChartRounded,
  ClearRounded,
  ImageOutlined,
} from "@mui/icons-material";

import {
  s3Client,
  BUCKET_NAME,
  PUBLIC_URL,
} from "../utils/s3Client";

import { useAuth } from "../hooks/useAuth";


/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const COLORS = {
  navy: "#1A2B4B",
  navyDark: "#13213A",

  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  primarySoft: "#EFF6FF",

  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  borderLight: "#EDF2F7",

  background: "#F8FAFC",
  surface: "#FFFFFF",

  success: "#059669",
  successSoft: "#ECFDF5",
};


/* ============================================================================
   VISUALIZATION TYPES
============================================================================ */

const VISUALIZATION_TYPES = [
  "All",
  "Distribution Curve",
  "Scatter Plot",
  "Multivariate Scatter",
  "Bootstrapping",
  "Correlation Analysis",
];


/* ============================================================================
   SAVED VISUALIZATIONS
============================================================================ */

const SavedVisualizationsList = ({
  open,
  onClose,
}) => {
  const { user } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [
    visualizations,
    setVisualizations,
  ] = useState([]);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    selectedItems,
    setSelectedItems,
  ] = useState(new Set());

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("All");

  const [
    dateFilter,
    setDateFilter,
  ] = useState("");


  /* ==========================================================================
     CURRENT USER
  ========================================================================== */

  const currentUser =
    useMemo(() => {
      try {
        if (user?.name) {
          return user.name;
        }

        const storedUser =
          JSON.parse(
            localStorage.getItem(
              "user"
            ) || "{}"
          );

        return (
          storedUser.name ||
          null
        );
      } catch (error) {
        console.error(
          "Error getting current user:",
          error
        );

        return null;
      }
    }, [user]);


  /* ==========================================================================
     FETCH VISUALIZATIONS
  ========================================================================== */

  const fetchVisualizations =
    useCallback(async () => {
      if (!currentUser) {
        setVisualizations([]);
        return;
      }

      setLoading(true);

      try {
        const userPrefix =
          `AbhiStat/${currentUser}/`;

        const command =
          new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: userPrefix,
          });

        const response =
          await s3Client.send(
            command
          );

        const files =
          response.Contents || [];

        let allFiles = files;


        /* ====================================================================
           BACKWARD COMPATIBILITY
        ==================================================================== */

        if (files.length === 0) {
          const allCommand =
            new ListObjectsV2Command({
              Bucket:
                BUCKET_NAME,

              Prefix:
                "AbhiStat/",
            });

          const allResponse =
            await s3Client.send(
              allCommand
            );

          const allFilesList =
            allResponse.Contents ||
            [];

          const userNameLower =
            currentUser
              .toLowerCase()
              .trim();

          const userNameVariations =
            [
              userNameLower,

              userNameLower.replace(
                /\s+/g,
                "-"
              ),

              userNameLower.replace(
                /\s+/g,
                "_"
              ),

              currentUser.trim(),
            ];

          const userFiles =
            allFilesList.filter(
              (file) => {
                const key =
                  file.Key;

                if (
                  key.startsWith(
                    `AbhiStat/${currentUser}/`
                  ) ||
                  key.startsWith(
                    `AbhiStat/${currentUser.trim()}/`
                  )
                ) {
                  return true;
                }

                const pathAfterAbhiStat =
                  key
                    .replace(
                      "AbhiStat/",
                      ""
                    )
                    .split(
                      "/"
                    )[0];

                return userNameVariations.some(
                  (
                    variation
                  ) =>
                    pathAfterAbhiStat.toLowerCase() ===
                    variation.toLowerCase()
                );
              }
            );

          if (
            userFiles.length >
            0
          ) {
            allFiles =
              userFiles;
          }
        }


        /* ====================================================================
           MAP FILES
        ==================================================================== */

        const mappedFiles =
          allFiles
            .filter((file) =>
              file.Key.endsWith(
                ".png"
              )
            )

            .sort(
              (a, b) =>
                b.LastModified -
                a.LastModified
            )

            .map((file) => {
              let displayName =
                "";

              let username =
                currentUser;


              if (
                file.Key.startsWith(
                  userPrefix
                )
              ) {
                const pathParts =
                  file.Key
                    .replace(
                      userPrefix,
                      ""
                    )
                    .split(
                      "/"
                    );

                const fileName =
                  pathParts[
                    pathParts.length -
                      1
                  ];

                displayName =
                  fileName.replace(
                    ".png",
                    ""
                  );
              } else {
                const pathParts =
                  file.Key
                    .replace(
                      "AbhiStat/",
                      ""
                    )
                    .split(
                      "/"
                    );

                if (
                  pathParts.length >
                  1
                ) {
                  username =
                    pathParts[0];

                  displayName =
                    pathParts[
                      pathParts.length -
                        1
                    ].replace(
                      ".png",
                      ""
                    );
                } else {
                  displayName =
                    pathParts[0].replace(
                      ".png",
                      ""
                    );
                }
              }


              /* ==============================================================
                 DETERMINE TYPE
              =============================================================== */

              let type = "Other";

              if (
                displayName.includes(
                  "Distribution Curve"
                )
              ) {
                type =
                  "Distribution Curve";
              } else if (
                displayName.includes(
                  "Multivariate Scatter"
                )
              ) {
                type =
                  "Multivariate Scatter";
              } else if (
                displayName.includes(
                  "Scatter Plot"
                )
              ) {
                type =
                  "Scatter Plot";
              } else if (
                displayName.includes(
                  "Bootstrapping"
                )
              ) {
                type =
                  "Bootstrapping";
              } else if (
                displayName.includes(
                  "Correlation Analysis"
                )
              ) {
                type =
                  "Correlation Analysis";
              }


              const dateStr =
                file.LastModified.toLocaleString(
                  "en-US",
                  {
                    day:
                      "2-digit",

                    month:
                      "short",

                    year:
                      "numeric",

                    hour:
                      "2-digit",

                    minute:
                      "2-digit",
                  }
                );


              return {
                key: file.Key,

                name:
                  displayName,

                displayName,

                username,

                type,

                url:
                  `${PUBLIC_URL}/${file.Key}`,

                lastModified:
                  file.LastModified,

                dateStr,

                dateIso:
                  file.LastModified
                    .toISOString()
                    .split(
                      "T"
                    )[0],
              };
            });


        setVisualizations(
          mappedFiles
        );
      } catch (error) {
        console.error(
          "Error fetching visualizations:",
          error
        );

        setVisualizations([]);
      } finally {
        setLoading(false);
      }
    }, [currentUser]);


  /* ==========================================================================
     FETCH WHEN DIALOG OPENS
  ========================================================================== */

  useEffect(() => {
    if (
      open &&
      currentUser
    ) {
      fetchVisualizations();
    } else if (
      open &&
      !currentUser
    ) {
      setVisualizations([]);
    }
  }, [
    open,
    currentUser,
    fetchVisualizations,
  ]);


  /* ==========================================================================
     FILTER VISUALIZATIONS
  ========================================================================== */

  const filteredVisualizations =
    useMemo(() => {
      return visualizations.filter(
        (viz) => {
          const matchesType =
            typeFilter ===
              "All" ||
            viz.type ===
              typeFilter;

          const matchesDate =
            !dateFilter ||
            viz.dateIso ===
              dateFilter;

          return (
            matchesType &&
            matchesDate
          );
        }
      );
    }, [
      visualizations,
      typeFilter,
      dateFilter,
    ]);


  /* ==========================================================================
     SELECTION
  ========================================================================== */

  const handleSelectAll =
    () => {
      if (
        selectedItems.size ===
        filteredVisualizations.length
      ) {
        setSelectedItems(
          new Set()
        );
      } else {
        setSelectedItems(
          new Set(
            filteredVisualizations.map(
              (viz) =>
                viz.key
            )
          )
        );
      }
    };


  const handleToggleSelect =
    (key) => {
      setSelectedItems(
        (previous) => {
          const next =
            new Set(
              previous
            );

          if (
            next.has(key)
          ) {
            next.delete(key);
          } else {
            next.add(key);
          }

          return next;
        }
      );
    };


  const allSelected =
    filteredVisualizations.length >
      0 &&
    selectedItems.size ===
      filteredVisualizations.length;

  const someSelected =
    selectedItems.size > 0 &&
    selectedItems.size <
      filteredVisualizations.length;


  /* ==========================================================================
     S3 KEY
  ========================================================================== */

  const extractS3KeyFromUrl =
    (url) => {
      try {
        const e2eBaseUrl =
          `${PUBLIC_URL}/`;

        if (
          url.startsWith(
            e2eBaseUrl
          )
        ) {
          return url.replace(
            e2eBaseUrl,
            ""
          );
        }

        const awsPattern =
          /https:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\//;

        if (
          awsPattern.test(url)
        ) {
          return url.replace(
            awsPattern,
            ""
          );
        }

        const urlObj =
          new URL(url);

        return urlObj.pathname.substring(
          1
        );
      } catch (error) {
        console.error(
          "Error extracting key from URL:",
          error
        );

        throw new Error(
          "Invalid storage URL format"
        );
      }
    };


  /* ==========================================================================
     DOWNLOAD
  ========================================================================== */

  const handleDownload =
    async (
      url,
      name,
      s3Key = null
    ) => {
      try {
        const key =
          s3Key ||
          extractS3KeyFromUrl(
            url
          );

        const command =
          new GetObjectCommand({
            Bucket:
              BUCKET_NAME,

            Key: key,
          });

        const response =
          await s3Client.send(
            command
          );

        let blob;


        if (
          response.Body &&
          typeof response.Body
            .transformToByteArray ===
            "function"
        ) {
          const byteArray =
            await response.Body.transformToByteArray();

          blob =
            new Blob(
              [byteArray],
              {
                type:
                  "image/png",
              }
            );
        } else if (
          response.Body &&
          typeof response.Body
            .getReader ===
            "function"
        ) {
          const chunks = [];

          const reader =
            response.Body.getReader();

          while (true) {
            const {
              done,
              value,
            } =
              await reader.read();

            if (done) {
              break;
            }

            chunks.push(
              value
            );
          }

          const totalLength =
            chunks.reduce(
              (
                acc,
                chunk
              ) =>
                acc +
                chunk.length,
              0
            );

          const combined =
            new Uint8Array(
              totalLength
            );

          let offset = 0;

          for (const chunk of chunks) {
            combined.set(
              chunk,
              offset
            );

            offset +=
              chunk.length;
          }

          blob =
            new Blob(
              [combined],
              {
                type:
                  "image/png",
              }
            );
        } else if (
          response.Body &&
          typeof response.Body
            .arrayBuffer ===
            "function"
        ) {
          const arrayBuffer =
            await response.Body.arrayBuffer();

          blob =
            new Blob(
              [arrayBuffer],
              {
                type:
                  "image/png",
              }
            );
        } else {
          const chunks = [];

          for await (
            const chunk
            of response.Body
          ) {
            chunks.push(
              chunk
            );
          }

          blob =
            new Blob(
              chunks,
              {
                type:
                  "image/png",
              }
            );
        }


        const blobUrl =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          blobUrl;

        link.download =
          `${name}.png`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        window.URL.revokeObjectURL(
          blobUrl
        );
      } catch (error) {
        console.error(
          "Error downloading image:",
          error
        );

        try {
          const response =
            await fetch(
              url
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Fetch failed"
            );
          }

          const blob =
            await response.blob();

          const blobUrl =
            window.URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              "a"
            );

          link.href =
            blobUrl;

          link.download =
            `${name}.png`;

          document.body.appendChild(
            link
          );

          link.click();

          document.body.removeChild(
            link
          );

          window.URL.revokeObjectURL(
            blobUrl
          );
        } catch (
          fetchError
        ) {
          console.error(
            "Download fallback failed:",
            fetchError
          );

          window.open(
            url,
            "_blank"
          );
        }
      }
    };


  /* ==========================================================================
     BULK DOWNLOAD
  ========================================================================== */

  const handleBulkDownload =
    async () => {
      const selectedVizs =
        filteredVisualizations.filter(
          (viz) =>
            selectedItems.has(
              viz.key
            )
        );

      for (
        let i = 0;
        i <
        selectedVizs.length;
        i++
      ) {
        await handleDownload(
          selectedVizs[i].url,
          selectedVizs[i].name,
          selectedVizs[i].key
        );

        if (
          i <
          selectedVizs.length -
            1
        ) {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                200
              )
          );
        }
      }
    };


  /* ==========================================================================
     RESET FILTERS
  ========================================================================== */

  const resetFilters =
    () => {
      setTypeFilter(
        "All"
      );

      setDateFilter("");

      setSelectedItems(
        new Set()
      );
    };


  useEffect(() => {
    setSelectedItems(
      new Set()
    );
  }, [
    typeFilter,
    dateFilter,
  ]);


  const filtersActive =
    typeFilter !== "All" ||
    Boolean(dateFilter);


  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
      {/* ======================================================================
          MAIN DIALOG
      ====================================================================== */}

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: {
              xs: "92vh",
              md: "88vh",
            },

            maxHeight:
              "900px",

            overflow:
              "hidden",

            borderRadius: {
              xs: 2,
              md: 3,
            },

            bgcolor:
              COLORS.background,

            boxShadow:
              "0 24px 60px rgba(15,23,42,0.18)",
          },
        }}
      >

        {/* ====================================================================
            HEADER
        ==================================================================== */}

        <DialogTitle
          sx={{
            px: {
              xs: 2,
              sm: 3,
            },

            py: 2.25,

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap: 2,

            bgcolor:
              COLORS.surface,

            borderBottom:
              `1px solid ${COLORS.border}`,
          }}
        >

          <Box
            sx={{
              display: "flex",

              alignItems:
                "center",

              gap: 1.4,

              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,

                display: "grid",

                placeItems:
                  "center",

                flexShrink: 0,

                borderRadius:
                  2,

                bgcolor:
                  COLORS.primarySoft,

                color:
                  COLORS.primary,
              }}
            >
              <CollectionsBookmarkRounded
                sx={{
                  fontSize: 21,
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
                  color:
                    COLORS.textPrimary,

                  fontSize: {
                    xs: "0.95rem",
                    sm: "1.05rem",
                  },

                  fontWeight:
                    800,

                  letterSpacing:
                    "-0.02em",

                  lineHeight:
                    1.25,
                }}
              >
                Saved Visualizations
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,

                  color:
                    COLORS.textMuted,

                  fontSize:
                    "0.62rem",

                  lineHeight:
                    1.4,
                }}
              >
                Browse, preview and
                download your saved
                analysis charts
              </Typography>
            </Box>
          </Box>


          <Stack
            direction="row"
            spacing={0.5}
          >
            <Tooltip
              title="Refresh visualizations"
              arrow
            >
              <span>
                <IconButton
                  onClick={
                    fetchVisualizations
                  }
                  disabled={
                    loading
                  }
                  sx={
                    headerIconButtonSx
                  }
                >
                  {loading ? (
                    <CircularProgress
                      size={17}
                      thickness={5}
                    />
                  ) : (
                    <RefreshRounded />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title="Close"
              arrow
            >
              <IconButton
                onClick={
                  onClose
                }
                sx={
                  headerIconButtonSx
                }
              >
                <CloseRounded />
              </IconButton>
            </Tooltip>
          </Stack>

        </DialogTitle>


        {/* ====================================================================
            FILTER TOOLBAR
        ==================================================================== */}

        <Box
          sx={{
            px: {
              xs: 2,
              sm: 3,
            },

            py: 1.75,

            bgcolor:
              COLORS.surface,

            borderBottom:
              `1px solid ${COLORS.border}`,
          }}
        >

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1.25}
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
          >

            {/* FILTER LABEL */}

            <Box
              sx={{
                display: "flex",

                alignItems:
                  "center",

                gap: 0.6,

                mr: {
                  md: 0.5,
                },
              }}
            >
              <FilterListRounded
                sx={{
                  color:
                    COLORS.textMuted,

                  fontSize: 17,
                }}
              />

              <Typography
                sx={{
                  color:
                    COLORS.textSecondary,

                  fontSize:
                    "0.66rem",

                  fontWeight:
                    700,
                }}
              >
                Filters
              </Typography>
            </Box>


            {/* TYPE */}

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 185,
                },
              }}
            >
              <InputLabel>
                Visualization Type
              </InputLabel>

              <Select
                value={
                  typeFilter
                }
                label="Visualization Type"
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value
                  )
                }
                sx={
                  fieldSx
                }
              >
                {VISUALIZATION_TYPES.map(
                  (type) => (
                    <MenuItem
                      key={
                        type
                      }
                      value={
                        type
                      }
                    >
                      {type}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>


            {/* DATE */}

            <TextField
              label="Saved Date"
              type="date"
              size="small"
              value={
                dateFilter
              }
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 165,
                },

                ...fieldSx,
              }}
            />


            {/* RESET */}

            {filtersActive && (
              <Button
                onClick={
                  resetFilters
                }
                startIcon={
                  <ClearRounded />
                }
                sx={{
                  minHeight: 40,

                  px: 1.4,

                  color:
                    COLORS.textSecondary,

                  textTransform:
                    "none",

                  fontSize:
                    "0.65rem",

                  fontWeight:
                    700,

                  borderRadius:
                    1.5,

                  "&:hover": {
                    bgcolor:
                      COLORS.background,

                    color:
                      COLORS.navy,
                  },
                }}
              >
                Clear Filters
              </Button>
            )}


            {/* SPACER */}

            <Box
              sx={{
                flex: 1,
              }}
            />


            {/* USER */}

            {currentUser && (
              <Chip
                icon={
                  <AccountCircleOutlined />
                }
                label={
                  currentUser
                }
                variant="outlined"
                size="small"
                sx={{
                  height: 31,

                  maxWidth:
                    190,

                  borderColor:
                    COLORS.border,

                  bgcolor:
                    COLORS.background,

                  color:
                    COLORS.textSecondary,

                  fontSize:
                    "0.61rem",

                  fontWeight:
                    650,

                  "& .MuiChip-icon":
                    {
                      color:
                        COLORS.textMuted,

                      fontSize:
                        16,
                    },
                }}
              />
            )}


            {/* COUNT */}

            <Box
              sx={{
                px: 1.1,
                py: 0.6,

                borderRadius:
                  1.4,

                bgcolor:
                  COLORS.background,

                border:
                  `1px solid ${COLORS.border}`,
              }}
            >
              <Typography
                sx={{
                  color:
                    COLORS.textSecondary,

                  fontSize:
                    "0.59rem",

                  fontWeight:
                    650,

                  whiteSpace:
                    "nowrap",
                }}
              >
                {
                  filteredVisualizations.length
                }{" "}
                of{" "}
                {
                  visualizations.length
                }{" "}
                visualizations
              </Typography>
            </Box>

          </Stack>
        </Box>


        {/* ====================================================================
            SELECTION TOOLBAR
        ==================================================================== */}

        {filteredVisualizations.length >
          0 && (
          <Box
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },

              py: 1.1,

              minHeight: 52,

              display: "flex",

              alignItems:
                "center",

              bgcolor:
                selectedItems.size >
                0
                  ? COLORS.primarySoft
                  : COLORS.surface,

              borderBottom:
                `1px solid ${COLORS.border}`,

              transition:
                "background-color 160ms ease",
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
              sx={{
                width: "100%",
              }}
            >

              <FormControlLabel
                sx={{
                  m: 0,

                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.64rem",

                      fontWeight:
                        650,

                      color:
                        COLORS.textSecondary,
                    },
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={
                      allSelected
                    }
                    indeterminate={
                      someSelected
                    }
                    onChange={
                      handleSelectAll
                    }
                    icon={
                      <CheckBoxOutlineBlankRounded />
                    }
                    checkedIcon={
                      <CheckBoxRounded />
                    }
                    sx={{
                      color:
                        COLORS.textMuted,

                      "&.Mui-checked":
                        {
                          color:
                            COLORS.primary,
                        },

                      "&.MuiCheckbox-indeterminate":
                        {
                          color:
                            COLORS.primary,
                        },
                    }}
                  />
                }
                label={
                  allSelected
                    ? "Deselect all"
                    : "Select all"
                }
              />


              {selectedItems.size >
                0 && (
                <>
                  <Chip
                    label={`${selectedItems.size} selected`}
                    size="small"
                    sx={{
                      height: 27,

                      bgcolor:
                        "#FFFFFF",

                      color:
                        COLORS.primary,

                      border:
                        "1px solid #BFDBFE",

                      fontSize:
                        "0.58rem",

                      fontWeight:
                        750,
                    }}
                  />

                  <Button
                    onClick={
                      handleBulkDownload
                    }
                    startIcon={
                      <DownloadRounded />
                    }
                    variant="contained"
                    size="small"
                    sx={{
                      minHeight: 32,

                      bgcolor:
                        COLORS.primary,

                      borderRadius:
                        1.4,

                      boxShadow:
                        "none",

                      textTransform:
                        "none",

                      fontSize:
                        "0.61rem",

                      fontWeight:
                        700,

                      "&:hover": {
                        bgcolor:
                          COLORS.primaryHover,

                        boxShadow:
                          "none",
                      },
                    }}
                  >
                    Download Selected
                  </Button>

                  <Button
                    onClick={() =>
                      setSelectedItems(
                        new Set()
                      )
                    }
                    size="small"
                    sx={{
                      color:
                        COLORS.textSecondary,

                      textTransform:
                        "none",

                      fontSize:
                        "0.6rem",

                      fontWeight:
                        650,
                    }}
                  >
                    Clear
                  </Button>
                </>
              )}

              <Box
                sx={{
                  flex: 1,
                }}
              />

              <Typography
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },

                  color:
                    COLORS.textMuted,

                  fontSize:
                    "0.57rem",
                }}
              >
                Select charts for
                bulk download
              </Typography>

            </Stack>
          </Box>
        )}


        {/* ====================================================================
            CONTENT
        ==================================================================== */}

        <DialogContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },

            flex: 1,

            overflowY:
              "auto",

            bgcolor:
              COLORS.background,

            "&::-webkit-scrollbar":
              {
                width: 8,
              },

            "&::-webkit-scrollbar-thumb":
              {
                bgcolor:
                  "#CBD5E1",

                borderRadius:
                  10,
              },

            "&::-webkit-scrollbar-track":
              {
                bgcolor:
                  "transparent",
              },
          }}
        >

          {/* ==================================================================
              LOADING
          ================================================================== */}

          {loading ? (
            <Box
              sx={{
                minHeight: 350,

                display: "flex",

                flexDirection:
                  "column",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,

                  display: "grid",

                  placeItems:
                    "center",

                  borderRadius:
                    "50%",

                  bgcolor:
                    COLORS.primarySoft,
                }}
              >
                <CircularProgress
                  size={25}
                  thickness={4}
                  sx={{
                    color:
                      COLORS.primary,
                  }}
                />
              </Box>

              <Box
                sx={{
                  textAlign:
                    "center",
                }}
              >
                <Typography
                  sx={{
                    color:
                      COLORS.textPrimary,

                    fontSize:
                      "0.75rem",

                    fontWeight:
                      750,
                  }}
                >
                  Loading visualizations
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,

                    color:
                      COLORS.textMuted,

                    fontSize:
                      "0.6rem",
                  }}
                >
                  Retrieving your saved
                  analysis charts...
                </Typography>
              </Box>
            </Box>
          ) : filteredVisualizations.length ===
            0 ? (

            /* ================================================================
               EMPTY STATE
            ================================================================ */

            <Box
              sx={{
                minHeight: 350,

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",
              }}
            >
              <Box
                sx={{
                  maxWidth: 380,

                  textAlign:
                    "center",
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,

                    mx: "auto",
                    mb: 1.5,

                    display:
                      "grid",

                    placeItems:
                      "center",

                    borderRadius:
                      2.5,

                    bgcolor:
                      "#F1F5F9",

                    color:
                      COLORS.textMuted,
                  }}
                >
                  <ImageOutlined
                    sx={{
                      fontSize: 29,
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    color:
                      COLORS.textPrimary,

                    fontSize:
                      "0.82rem",

                    fontWeight:
                      750,
                  }}
                >
                  {filtersActive
                    ? "No matching visualizations"
                    : "No saved visualizations yet"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.55,

                    color:
                      COLORS.textMuted,

                    fontSize:
                      "0.62rem",

                    lineHeight:
                      1.55,
                  }}
                >
                  {filtersActive
                    ? "Try adjusting or clearing your filters to see more saved charts."
                    : "Visualizations you save from your analyses will appear here."}
                </Typography>

                {filtersActive && (
                  <Button
                    variant="outlined"
                    onClick={
                      resetFilters
                    }
                    startIcon={
                      <ClearRounded />
                    }
                    sx={{
                      mt: 1.75,

                      borderColor:
                        COLORS.border,

                      borderRadius:
                        1.5,

                      color:
                        COLORS.textSecondary,

                      textTransform:
                        "none",

                      fontSize:
                        "0.64rem",

                      fontWeight:
                        700,
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            </Box>
          ) : (

            /* ================================================================
               VISUALIZATION GRID
            ================================================================ */

            <Fade in>
              <Grid
                container
                spacing={2}
              >
                {filteredVisualizations.map(
                  (viz) => {
                    const isSelected =
                      selectedItems.has(
                        viz.key
                      );

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        lg={4}
                        key={
                          viz.key
                        }
                      >
                        <VisualizationCard
                          viz={
                            viz
                          }
                          selected={
                            isSelected
                          }
                          onToggle={() =>
                            handleToggleSelect(
                              viz.key
                            )
                          }
                          onView={() =>
                            setSelectedImage(
                              viz
                            )
                          }
                          onDownload={() =>
                            handleDownload(
                              viz.url,
                              viz.name,
                              viz.key
                            )
                          }
                        />
                      </Grid>
                    );
                  }
                )}
              </Grid>
            </Fade>
          )}

        </DialogContent>


        {/* ====================================================================
            FOOTER
        ==================================================================== */}

        <DialogActions
          sx={{
            px: {
              xs: 2,
              sm: 3,
            },

            py: 1.5,

            justifyContent:
              "space-between",

            bgcolor:
              COLORS.surface,

            borderTop:
              `1px solid ${COLORS.border}`,
          }}
        >

          <Typography
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },

              color:
                COLORS.textMuted,

              fontSize:
                "0.57rem",
            }}
          >
            {selectedItems.size >
            0
              ? `${selectedItems.size} visualization${selectedItems.size === 1 ? "" : "s"} selected`
              : "Click a visualization to preview it"}
          </Typography>


          <Stack
            direction="row"
            spacing={1}
            sx={{
              ml: "auto",
            }}
          >

            {selectedItems.size >
              0 && (
              <Button
                variant="outlined"
                startIcon={
                  <DownloadRounded />
                }
                onClick={
                  handleBulkDownload
                }
                sx={{
                  borderColor:
                    COLORS.border,

                  borderRadius:
                    1.5,

                  color:
                    COLORS.textSecondary,

                  textTransform:
                    "none",

                  fontSize:
                    "0.64rem",

                  fontWeight:
                    700,

                  "&:hover": {
                    borderColor:
                      COLORS.primary,

                    bgcolor:
                      COLORS.primarySoft,

                    color:
                      COLORS.primary,
                  },
                }}
              >
                Download{" "}
                {
                  selectedItems.size
                }
              </Button>
            )}


            <Button
              onClick={
                onClose
              }
              variant="contained"
              sx={{
                minWidth: 90,

                borderRadius:
                  1.5,

                bgcolor:
                  COLORS.navy,

                textTransform:
                  "none",

                fontSize:
                  "0.65rem",

                fontWeight:
                  750,

                boxShadow:
                  "0 3px 8px rgba(26,43,75,0.15)",

                "&:hover": {
                  bgcolor:
                    COLORS.navyDark,

                  boxShadow:
                    "0 5px 12px rgba(26,43,75,0.2)",
                },
              }}
            >
              Close
            </Button>

          </Stack>

        </DialogActions>
      </Dialog>


      {/* ======================================================================
          IMAGE PREVIEW DIALOG
      ====================================================================== */}

      <Dialog
        open={
          Boolean(
            selectedImage
          )
        }
        onClose={() =>
          setSelectedImage(
            null
          )
        }
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            overflow:
              "hidden",

            borderRadius:
              3,

            bgcolor:
              COLORS.background,

            boxShadow:
              "0 24px 70px rgba(15,23,42,0.25)",
          },
        }}
      >

        {/* PREVIEW HEADER */}

        <DialogTitle
          sx={{
            px: 2.5,
            py: 1.75,

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap: 2,

            bgcolor:
              COLORS.surface,

            borderBottom:
              `1px solid ${COLORS.border}`,
          }}
        >

          <Box
            sx={{
              minWidth: 0,

              display: "flex",

              alignItems:
                "center",

              gap: 1.1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,

                display: "grid",

                placeItems:
                  "center",

                flexShrink: 0,

                borderRadius:
                  1.5,

                bgcolor:
                  COLORS.primarySoft,

                color:
                  COLORS.primary,
              }}
            >
              <BarChartRounded
                sx={{
                  fontSize: 19,
                }}
              />
            </Box>

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                noWrap
                sx={{
                  maxWidth: {
                    xs: 220,
                    sm: 650,
                  },

                  color:
                    COLORS.textPrimary,

                  fontSize:
                    "0.8rem",

                  fontWeight:
                    750,
                }}
              >
                {
                  selectedImage?.displayName
                }
              </Typography>

              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{
                  mt: 0.25,
                }}
              >
                <Typography
                  sx={{
                    color:
                      COLORS.textMuted,

                    fontSize:
                      "0.56rem",
                  }}
                >
                  {
                    selectedImage?.type
                  }
                </Typography>

                <Box
                  sx={{
                    width: 3,
                    height: 3,

                    borderRadius:
                      "50%",

                    bgcolor:
                      COLORS.textMuted,
                  }}
                />

                <Typography
                  sx={{
                    color:
                      COLORS.textMuted,

                    fontSize:
                      "0.56rem",
                  }}
                >
                  {
                    selectedImage?.dateStr
                  }
                </Typography>
              </Stack>
            </Box>
          </Box>


          <IconButton
            onClick={() =>
              setSelectedImage(
                null
              )
            }
            sx={
              headerIconButtonSx
            }
          >
            <CloseRounded />
          </IconButton>

        </DialogTitle>


        {/* PREVIEW IMAGE */}

        <DialogContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2.5,
            },

            bgcolor:
              "#F1F5F9",
          }}
        >
          {selectedImage && (
            <Paper
              elevation={0}
              sx={{
                p: 1,

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                minHeight: 300,

                bgcolor:
                  "#FFFFFF",

                border:
                  `1px solid ${COLORS.border}`,

                borderRadius:
                  2,

                overflow:
                  "hidden",
              }}
            >
              <Box
                component="img"
                src={
                  selectedImage.url
                }
                alt={
                  selectedImage.name
                }
                sx={{
                  display:
                    "block",

                  width:
                    "100%",

                  maxHeight:
                    "72vh",

                  objectFit:
                    "contain",
                }}
              />
            </Paper>
          )}
        </DialogContent>


        {/* PREVIEW ACTIONS */}

        <DialogActions
          sx={{
            px: 2.5,
            py: 1.4,

            bgcolor:
              COLORS.surface,

            borderTop:
              `1px solid ${COLORS.border}`,
          }}
        >

          <Box
            sx={{
              flex: 1,
            }}
          >
            {selectedImage?.username && (
              <Typography
                sx={{
                  color:
                    COLORS.textMuted,

                  fontSize:
                    "0.57rem",
                }}
              >
                Saved by{" "}
                <Box
                  component="span"
                  sx={{
                    color:
                      COLORS.textSecondary,

                    fontWeight:
                      700,
                  }}
                >
                  {
                    selectedImage.username
                  }
                </Box>
              </Typography>
            )}
          </Box>


          <Button
            onClick={() =>
              setSelectedImage(
                null
              )
            }
            sx={{
              color:
                COLORS.textSecondary,

              textTransform:
                "none",

              fontSize:
                "0.64rem",

              fontWeight:
                700,
            }}
          >
            Close
          </Button>


          <Button
            variant="contained"
            startIcon={
              <DownloadRounded />
            }
            onClick={() =>
              handleDownload(
                selectedImage.url,
                selectedImage.name,
                selectedImage.key
              )
            }
            sx={{
              borderRadius:
                1.5,

              bgcolor:
                COLORS.navy,

              textTransform:
                "none",

              fontSize:
                "0.64rem",

              fontWeight:
                750,

              boxShadow:
                "none",

              "&:hover": {
                bgcolor:
                  COLORS.navyDark,

                boxShadow:
                  "none",
              },
            }}
          >
            Download PNG
          </Button>

        </DialogActions>

      </Dialog>
    </>
  );
};


/* ============================================================================
   VISUALIZATION CARD
============================================================================ */

const VisualizationCard = ({
  viz,
  selected,
  onToggle,
  onView,
  onDownload,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        display: "flex",

        flexDirection:
          "column",

        overflow:
          "hidden",

        position:
          "relative",

        border:
          selected
            ? `1.5px solid ${COLORS.primary}`
            : `1px solid ${COLORS.border}`,

        borderRadius:
          2.25,

        bgcolor:
          COLORS.surface,

        boxShadow:
          selected
            ? "0 8px 22px rgba(37,99,235,0.12)"
            : "0 2px 7px rgba(15,23,42,0.035)",

        transform:
          selected
            ? "translateY(-1px)"
            : "none",

        transition:
          "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",

        "&:hover": {
          borderColor:
            selected
              ? COLORS.primary
              : "#CBD5E1",

          boxShadow:
            "0 9px 24px rgba(15,23,42,0.09)",

          transform:
            "translateY(-2px)",
        },
      }}
    >

      {/* ======================================================================
          IMAGE
      ====================================================================== */}

      <Box
        sx={{
          position:
            "relative",

          bgcolor:
            "#FFFFFF",

          borderBottom:
            `1px solid ${COLORS.borderLight}`,
        }}
      >

        {/* CHECKBOX */}

        <Tooltip
          title={
            selected
              ? "Deselect"
              : "Select"
          }
          arrow
        >
          <Checkbox
            checked={
              selected
            }
            onChange={
              onToggle
            }
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            icon={
              <CheckBoxOutlineBlankRounded />
            }
            checkedIcon={
              <CheckBoxRounded />
            }
            sx={{
              position:
                "absolute",

              top: 8,
              left: 8,

              zIndex: 3,

              width: 31,
              height: 31,

              p: 0.5,

              border:
                `1px solid ${selected ? "#BFDBFE" : COLORS.border}`,

              borderRadius:
                1.25,

              bgcolor:
                "rgba(255,255,255,0.94)",

              color:
                COLORS.textMuted,

              boxShadow:
                "0 2px 6px rgba(15,23,42,0.08)",

              "&:hover": {
                bgcolor:
                  "#FFFFFF",
              },

              "&.Mui-checked":
                {
                  color:
                    COLORS.primary,

                  bgcolor:
                    "#FFFFFF",
                },

              "& svg": {
                fontSize: 18,
              },
            }}
          />
        </Tooltip>


        {/* TYPE BADGE */}

        <Chip
          label={
            viz.type
          }
          size="small"
          sx={{
            position:
              "absolute",

            top: 9,
            right: 9,

            zIndex: 2,

            height: 24,

            maxWidth:
              "70%",

            bgcolor:
              "rgba(248,250,252,0.95)",

            color:
              COLORS.textSecondary,

            border:
              `1px solid ${COLORS.border}`,

            fontSize:
              "0.52rem",

            fontWeight:
              700,

            backdropFilter:
              "blur(8px)",

            "& .MuiChip-label":
              {
                overflow:
                  "hidden",

                textOverflow:
                  "ellipsis",
              },
          }}
        />


        <CardActionArea
          onClick={
            onView
          }
          sx={{
            display:
              "block",
          }}
        >
          <CardMedia
            component="img"
            image={
              viz.url
            }
            alt={
              viz.name
            }
            sx={{
              height: 180,

              objectFit:
                "contain",

              p: 1.5,

              bgcolor:
                "#FFFFFF",

              transition:
                "transform 180ms ease",

              ".MuiCardActionArea-root:hover &":
                {
                  transform:
                    "scale(1.015)",
                },
            }}
          />
        </CardActionArea>

      </Box>


      {/* ======================================================================
          DETAILS
      ====================================================================== */}

      <Box
        sx={{
          p: 1.6,

          flex: 1,

          display: "flex",

          flexDirection:
            "column",
      }}
      >

        <Typography
          title={
            viz.displayName
          }
          sx={{
            overflow:
              "hidden",

            color:
              COLORS.textPrimary,

            fontSize:
              "0.7rem",

            fontWeight:
              750,

            lineHeight:
              1.45,

            display:
              "-webkit-box",

            WebkitLineClamp:
              2,

            WebkitBoxOrient:
              "vertical",

            minHeight:
              "2.9em",
          }}
        >
          {viz.displayName}
        </Typography>


        {/* META */}

        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{
            mt: 1.2,

            minWidth: 0,
          }}
        >

          <Box
            sx={{
              display:
                "flex",

              alignItems:
                "center",

              gap: 0.45,

              minWidth: 0,
            }}
          >
            <AccountCircleOutlined
              sx={{
                flexShrink: 0,

                color:
                  COLORS.textMuted,

                fontSize: 14,
              }}
            />

            <Typography
              noWrap
              sx={{
                maxWidth:
                  100,

                color:
                  COLORS.textSecondary,

                fontSize:
                  "0.55rem",

                fontWeight:
                  600,
              }}
            >
              {viz.username}
            </Typography>
          </Box>


          <Box
            sx={{
              width: 3,
              height: 3,

              flexShrink: 0,

              borderRadius:
                "50%",

              bgcolor:
                COLORS.border,
            }}
          />


          <Box
            sx={{
              display:
                "flex",

              alignItems:
                "center",

              gap: 0.4,

              minWidth: 0,
            }}
          >
            <CalendarMonthOutlined
              sx={{
                flexShrink: 0,

                color:
                  COLORS.textMuted,

                fontSize: 13,
              }}
            />

            <Typography
              noWrap
              sx={{
                color:
                  COLORS.textMuted,

                fontSize:
                  "0.53rem",
              }}
            >
              {viz.dateStr}
            </Typography>
          </Box>

        </Stack>

      </Box>


      {/* ======================================================================
          CARD ACTIONS
      ====================================================================== */}

      <Box
        sx={{
          px: 1.25,
          py: 0.85,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          borderTop:
            `1px solid ${COLORS.borderLight}`,

          bgcolor:
            "#FCFDFE",
        }}
      >

        <Button
          size="small"
          onClick={
            onView
          }
          startIcon={
            <VisibilityRounded />
          }
          sx={{
            minHeight: 30,

            px: 1,

            color:
              COLORS.textSecondary,

            textTransform:
              "none",

            fontSize:
              "0.57rem",

            fontWeight:
              700,

            borderRadius:
              1.25,

            "& .MuiButton-startIcon":
              {
                mr: 0.45,

                "& svg": {
                  fontSize: 15,
                },
              },

            "&:hover": {
              bgcolor:
                COLORS.primarySoft,

              color:
                COLORS.primary,
            },
          }}
        >
          Preview
        </Button>


        <Tooltip
          title="Download PNG"
          arrow
        >
          <IconButton
            size="small"
            onClick={(
              event
            ) => {
              event.stopPropagation();

              onDownload();
            }}
            sx={{
              width: 31,
              height: 31,

              borderRadius:
                1.25,

              color:
                COLORS.textSecondary,

              "&:hover": {
                bgcolor:
                  COLORS.primarySoft,

                color:
                  COLORS.primary,
              },
            }}
          >
            <DownloadRounded
              sx={{
                fontSize: 17,
              }}
            />
          </IconButton>
        </Tooltip>

      </Box>

    </Card>
  );
};


/* ============================================================================
   SHARED STYLES
============================================================================ */

const headerIconButtonSx = {
  width: 36,
  height: 36,

  borderRadius: 1.5,

  color:
    COLORS.textSecondary,

  "& svg": {
    fontSize: 19,
  },

  "&:hover": {
    bgcolor:
      COLORS.background,

    color:
      COLORS.navy,
  },
};


const fieldSx = {
  "& .MuiOutlinedInput-root":
    {
      minHeight: 40,

      borderRadius:
        1.5,

      bgcolor:
        "#FFFFFF",

      fontSize:
        "0.66rem",

      "& fieldset":
        {
          borderColor:
            COLORS.border,
        },

      "&:hover fieldset":
        {
          borderColor:
            "#CBD5E1",
        },

      "&.Mui-focused fieldset":
        {
          borderColor:
            COLORS.primary,

          borderWidth:
            "1px",
        },
    },

  "& .MuiInputLabel-root":
    {
      fontSize:
        "0.72rem",
    },
};


/* ============================================================================
   EXPORT
============================================================================ */

export default SavedVisualizationsList;