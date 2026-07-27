import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ReactDOM from "react-dom";

import {
  Box,
  Typography,
  Button,
  TextField,
  Slider,
  Tooltip,
  IconButton,
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import {
  AddRounded,
  CloseRounded,
  ColorLensRounded,
  DeleteOutlineRounded,
  GradientRounded,
  OpacityRounded,
  PaletteOutlined,
  CheckRounded,
  TuneRounded,
} from "@mui/icons-material";


/* ============================================================================
   DEFAULTS
============================================================================ */

const DEFAULT_COLOR = "#3B82F6";

const DEFAULT_GRADIENT_STOPS = [
  {
    color: "#3B82F6",
    position: 0,
  },
  {
    color: "#EF4444",
    position: 1,
  },
];


/* ============================================================================
   COLOR HELPERS
============================================================================ */

const clamp = (value, min, max) => {
  return Math.min(
    Math.max(value, min),
    max
  );
};


const normalizeHex = (hex) => {
  if (!hex) {
    return DEFAULT_COLOR;
  }

  let value = String(hex)
    .trim()
    .replace("#", "");

  if (value.length === 3) {
    value = value
      .split("")
      .map((character) =>
        character + character
      )
      .join("");
  }

  if (
    !/^[0-9a-fA-F]{6}$/.test(value)
  ) {
    return DEFAULT_COLOR;
  }

  return `#${value.toUpperCase()}`;
};


const hexToRgba = (
  hex,
  alpha = 1
) => {
  const normalized =
    normalizeHex(hex).replace("#", "");

  const r = parseInt(
    normalized.substring(0, 2),
    16
  );

  const g = parseInt(
    normalized.substring(2, 4),
    16
  );

  const b = parseInt(
    normalized.substring(4, 6),
    16
  );

  return `rgba(${r}, ${g}, ${b}, ${clamp(
    alpha,
    0,
    1
  )})`;
};


const hexToRgb = (hex) => {
  const normalized =
    normalizeHex(hex).replace("#", "");

  return {
    r: parseInt(
      normalized.substring(0, 2),
      16
    ),

    g: parseInt(
      normalized.substring(2, 4),
      16
    ),

    b: parseInt(
      normalized.substring(4, 6),
      16
    ),
  };
};


const rgbaToHexAndAlpha = (
  color
) => {
  if (!color) {
    return {
      hex: DEFAULT_COLOR,
      alpha: 1,
    };
  }

  /*
   * Handle HEX directly.
   */

  if (
    String(color)
      .trim()
      .startsWith("#")
  ) {
    return {
      hex: normalizeHex(color),
      alpha: 1,
    };
  }

  /*
   * Handle rgb() and rgba().
   */

  const rgbaRegex =
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*([\d.]+)\s*)?\)/i;

  const match =
    String(color).match(rgbaRegex);

  if (!match) {
    return {
      hex: DEFAULT_COLOR,
      alpha: 1,
    };
  }

  const r = clamp(
    Math.round(Number(match[1])),
    0,
    255
  );

  const g = clamp(
    Math.round(Number(match[2])),
    0,
    255
  );

  const b = clamp(
    Math.round(Number(match[3])),
    0,
    255
  );

  const alpha =
    match[4] !== undefined
      ? clamp(
          Number(match[4]),
          0,
          1
        )
      : 1;

  const toHex = (value) =>
    value
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return {
    hex: `#${toHex(r)}${toHex(
      g
    )}${toHex(b)}`,

    alpha,
  };
};


const createColorValue = (
  hex,
  alpha
) => {
  const normalized =
    normalizeHex(hex);

  if (alpha >= 0.999) {
    return normalized;
  }

  return hexToRgba(
    normalized,
    alpha
  );
};


/* ============================================================================
   GRADIENT HELPERS
============================================================================ */

const createGradientString = (
  colors,
  direction = "to right"
) => {
  if (
    !colors ||
    colors.length === 0
  ) {
    return "transparent";
  }

  if (colors.length === 1) {
    return colors[0].color;
  }

  const sortedColors = [
    ...colors,
  ].sort(
    (a, b) =>
      a.position - b.position
  );

  const colorStops =
    sortedColors
      .map(
        (stop) =>
          `${stop.color} ${Math.round(
            stop.position * 100
          )}%`
      )
      .join(", ");

  return `linear-gradient(${direction}, ${colorStops})`;
};


const parseGradient = (
  value
) => {
  if (
    !value ||
    !String(value).includes(
      "gradient"
    )
  ) {
    return null;
  }

  /*
   * Capture the gradient direction and
   * everything after the first comma.
   */

  const gradientRegex =
    /linear-gradient\(\s*([^,]+)\s*,\s*(.+)\)$/i;

  const match =
    String(value).match(
      gradientRegex
    );

  if (!match) {
    return null;
  }

  const colorStopsString =
    match[2];

  /*
   * Supports:
   *
   * #3B82F6 0%
   * rgba(59, 130, 246, 0.5) 25%
   * rgb(59, 130, 246) 50%
   */

  const stopRegex =
    /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s+([\d.]+)%/g;

  const stops = [];

  let stopMatch;

  while (
    (stopMatch =
      stopRegex.exec(
        colorStopsString
      )) !== null
  ) {
    stops.push({
      color: stopMatch[1],

      position: clamp(
        parseFloat(
          stopMatch[2]
        ) / 100,
        0,
        1
      ),
    });
  }

  return stops.length >= 2
    ? stops
    : null;
};


/* ============================================================================
   INITIAL STATE
============================================================================ */

const getInitialStops = (
  value
) => {
  const gradient =
    parseGradient(value);

  if (gradient) {
    return gradient;
  }

  const {
    hex,
    alpha,
  } =
    rgbaToHexAndAlpha(
      value ||
        DEFAULT_COLOR
    );

  const color =
    createColorValue(
      hex,
      alpha
    );

  return [
    {
      color,
      position: 0,
    },
    {
      color,
      position: 1,
    },
  ];
};


/* ============================================================================
   GRADIENT COLOR PICKER
============================================================================ */

const GradientColorPicker = ({
  value = DEFAULT_COLOR,
  onChange,
  label = "Color",
  swatchSize = 40,
  colorOptions = [],
  portalZIndex = 30000,
  direction = "to right",
}) => {
  /* ==========================================================================
     STATE
  ========================================================================== */

  const [
    isGradient,
    setIsGradient,
  ] = useState(
    String(value).includes(
      "gradient"
    )
  );

  const [
    colorStops,
    setColorStops,
  ] = useState(() =>
    getInitialStops(value)
  );

  const [
    selectedStopIndex,
    setSelectedStopIndex,
  ] = useState(0);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    tempValue,
    setTempValue,
  ] = useState(value);

  const [
    hexInput,
    setHexInput,
  ] = useState("");

  const [
    dropdownPos,
    setDropdownPos,
  ] = useState({
    top: 0,
    left: 0,
    positionAbove: false,
    arrowLeftOffset: 24,
  });


  /* ==========================================================================
     REFS
  ========================================================================== */

  const swatchRef =
    useRef(null);

  const editorRef =
    useRef(null);


  /* ==========================================================================
     SELECTED STOP
  ========================================================================== */

  const selectedStop =
    colorStops[
      selectedStopIndex
    ] ||
    colorStops[0];


  const selectedColorData =
    useMemo(() => {
      return rgbaToHexAndAlpha(
        selectedStop?.color ||
          DEFAULT_COLOR
      );
    }, [selectedStop]);


  const {
    hex,
    alpha,
  } =
    selectedColorData;


  const rgb =
    useMemo(
      () =>
        hexToRgb(hex),
      [hex]
    );


  /* ==========================================================================
     CURRENT PREVIEW
  ========================================================================== */

  const previewBackground =
    useMemo(() => {
      if (isGradient) {
        return createGradientString(
          colorStops,
          direction
        );
      }

      return (
        colorStops[0]?.color ||
        DEFAULT_COLOR
      );
    }, [
      isGradient,
      colorStops,
      direction,
    ]);


  /* ==========================================================================
     TEMP VALUE
  ========================================================================== */

  useEffect(() => {
    if (isGradient) {
      setTempValue(
        createGradientString(
          colorStops,
          direction
        )
      );
    } else {
      setTempValue(
        colorStops[0]?.color ||
          DEFAULT_COLOR
      );
    }
  }, [
    colorStops,
    isGradient,
    direction,
  ]);


  /* ==========================================================================
     SYNC HEX INPUT
  ========================================================================== */

  useEffect(() => {
    setHexInput(hex);
  }, [hex]);


  /* ==========================================================================
     SYNC WHEN VALUE CHANGES EXTERNALLY
  ========================================================================== */

  useEffect(() => {
    if (isOpen) {
      return;
    }

    const gradient =
      String(value).includes(
        "gradient"
      );

    setIsGradient(
      gradient
    );

    setColorStops(
      getInitialStops(value)
    );

    setSelectedStopIndex(
      0
    );

    setTempValue(
      value
    );
  }, [
    value,
    isOpen,
  ]);


  /* ==========================================================================
     POSITION EDITOR
  ========================================================================== */

  const updateEditorPosition =
    () => {
      if (
        !swatchRef.current
      ) {
        return;
      }

      const rect =
        swatchRef.current.getBoundingClientRect();

      const editorWidth = 360;

      const editorHeight =
        Math.min(
          610,
          window.innerHeight - 32
        );

      const viewportPadding =
        16;

      const gap = 10;

      const spaceBelow =
        window.innerHeight -
        rect.bottom;

      const spaceAbove =
        rect.top;

      const positionAbove =
        spaceBelow <
          editorHeight + gap &&
        spaceAbove >
          spaceBelow;

      /*
       * Portal uses position: fixed,
       * therefore scrollX / scrollY
       * must NOT be added.
       */

      let left =
        rect.left;

      if (
        left + editorWidth >
        window.innerWidth -
          viewportPadding
      ) {
        left =
          window.innerWidth -
          editorWidth -
          viewportPadding;
      }

      left = Math.max(
        viewportPadding,
        left
      );

      let top;

      if (positionAbove) {
        top =
          rect.top -
          editorHeight -
          gap;

        top = Math.max(
          viewportPadding,
          top
        );
      } else {
        top =
          rect.bottom + gap;

        if (
          top + editorHeight >
          window.innerHeight -
            viewportPadding
        ) {
          top = Math.max(
            viewportPadding,
            window.innerHeight -
              editorHeight -
              viewportPadding
          );
        }
      }

      const swatchCenter =
        rect.left +
        rect.width / 2;

      const arrowLeftOffset =
        clamp(
          swatchCenter - left,
          22,
          editorWidth - 22
        );

      setDropdownPos({
        top,
        left,
        positionAbove,
        arrowLeftOffset,
      });
    };


  /* ==========================================================================
     OPEN
  ========================================================================== */

  const handleOpen = () => {
    /*
     * Reset the editor to the
     * currently applied value.
     */

    const gradient =
      String(value).includes(
        "gradient"
      );

    const stops =
      getInitialStops(value);

    setIsGradient(
      gradient
    );

    setColorStops(
      stops
    );

    setSelectedStopIndex(
      0
    );

    setTempValue(
      value
    );

    setIsOpen(true);

    requestAnimationFrame(
      updateEditorPosition
    );
  };


  /* ==========================================================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================================================== */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown =
      (event) => {
        const clickedSwatch =
          swatchRef.current?.contains(
            event.target
          );

        const clickedEditor =
          editorRef.current?.contains(
            event.target
          );

        if (
          !clickedSwatch &&
          !clickedEditor
        ) {
          setIsOpen(false);
        }
      };

    const handleResize =
      () => {
        updateEditorPosition();
      };

    const handleScroll =
      () => {
        updateEditorPosition();
      };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, [isOpen]);


  /* ==========================================================================
     ESCAPE KEY
  ========================================================================== */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          handleCancel();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });


  /* ==========================================================================
     APPLY
  ========================================================================== */

  const handleApply = () => {
    if (
      typeof onChange ===
      "function"
    ) {
      onChange(
        tempValue
      );
    }

    setIsOpen(false);
  };


  /* ==========================================================================
     CANCEL
  ========================================================================== */

  const handleCancel = () => {
    const gradient =
      String(value).includes(
        "gradient"
      );

    setIsGradient(
      gradient
    );

    setColorStops(
      getInitialStops(value)
    );

    setSelectedStopIndex(
      0
    );

    setTempValue(
      value
    );

    setIsOpen(false);
  };


  /* ==========================================================================
     UPDATE SELECTED COLOR
  ========================================================================== */

  const updateSelectedColor =
    (
      newHex,
      newAlpha = alpha
    ) => {
      const color =
        createColorValue(
          newHex,
          newAlpha
        );

      setColorStops(
        (previous) => {
          const next = [
            ...previous,
          ];

          const targetIndex =
            isGradient
              ? selectedStopIndex
              : 0;

          next[targetIndex] = {
            ...next[
              targetIndex
            ],

            color,
          };

          /*
           * For a solid color both
           * stops remain identical.
           */

          if (!isGradient) {
            return [
              {
                color,
                position: 0,
              },
              {
                color,
                position: 1,
              },
            ];
          }

          return next;
        }
      );
    };


  /* ==========================================================================
     COLOR INPUT
  ========================================================================== */

  const handleNativeColorChange =
    (event) => {
      updateSelectedColor(
        event.target.value,
        alpha
      );
    };


  /* ==========================================================================
     HEX INPUT
  ========================================================================== */

  const handleHexInputChange =
    (event) => {
      const input =
        event.target.value;

      setHexInput(input);

      const clean =
        input.replace(
          "#",
          ""
        );

      if (
        /^[0-9a-fA-F]{6}$/.test(
          clean
        )
      ) {
        updateSelectedColor(
          `#${clean}`,
          alpha
        );
      }
    };


  const handleHexBlur =
    () => {
      setHexInput(hex);
    };


  /* ==========================================================================
     OPACITY
  ========================================================================== */

  const handleAlphaChange =
    (
      _event,
      newValue
    ) => {
      updateSelectedColor(
        hex,
        newValue
      );
    };


  /* ==========================================================================
     POSITION
  ========================================================================== */

  const handlePositionChange =
    (
      _event,
      newValue
    ) => {
      setColorStops(
        (previous) => {
          const next = [
            ...previous,
          ];

          next[
            selectedStopIndex
          ] = {
            ...next[
              selectedStopIndex
            ],

            position:
              newValue,
          };

          return next;
        }
      );
    };


  /* ==========================================================================
     ADD STOP
  ========================================================================== */

  const handleAddColorStop =
    () => {
      const sorted = [
        ...colorStops,
      ].sort(
        (a, b) =>
          a.position -
          b.position
      );

      /*
       * Find the largest gap so
       * the new stop appears in
       * the most useful position.
       */

      let bestPosition =
        0.5;

      let largestGap = -1;

      for (
        let index = 0;
        index <
        sorted.length - 1;
        index++
      ) {
        const gap =
          sorted[index + 1]
            .position -
          sorted[index]
            .position;

        if (
          gap >
          largestGap
        ) {
          largestGap = gap;

          bestPosition =
            (
              sorted[index]
                .position +
              sorted[index + 1]
                .position
            ) / 2;
        }
      }

      const newColor =
        colorOptions.length > 0
          ? colorOptions[
              colorStops.length %
                colorOptions.length
            ]
          : "#06B6D4";

      const next = [
        ...colorStops,
        {
          color: newColor,
          position:
            bestPosition,
        },
      ];

      setColorStops(
        next
      );

      setSelectedStopIndex(
        next.length - 1
      );
    };


  /* ==========================================================================
     REMOVE STOP
  ========================================================================== */

  const handleRemoveColorStop =
    () => {
      if (
        colorStops.length <= 2
      ) {
        return;
      }

      const next =
        colorStops.filter(
          (_, index) =>
            index !==
            selectedStopIndex
        );

      setColorStops(
        next
      );

      setSelectedStopIndex(
        Math.min(
          selectedStopIndex,
          next.length - 1
        )
      );
    };


  /* ==========================================================================
     TOGGLE MODE
  ========================================================================== */

  const handleModeChange =
    (_event, mode) => {
      if (!mode) {
        return;
      }

      const nextGradient =
        mode === "gradient";

      setIsGradient(
        nextGradient
      );

      if (!nextGradient) {
        const current =
          colorStops[
            selectedStopIndex
          ]?.color ||
          colorStops[0]
            ?.color ||
          DEFAULT_COLOR;

        setColorStops([
          {
            color: current,
            position: 0,
          },
          {
            color: current,
            position: 1,
          },
        ]);

        setSelectedStopIndex(
          0
        );
      } else if (
        colorStops.length < 2
      ) {
        setColorStops(
          DEFAULT_GRADIENT_STOPS
        );
      }
    };


  /* ==========================================================================
     PRESET
  ========================================================================== */

  const handlePresetColor =
    (color) => {
      updateSelectedColor(
        color,
        1
      );
    };


  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
      {/* ======================================================================
          PICKER TRIGGER
      ====================================================================== */}

      <Box
        onClick={handleOpen}
        sx={{
          width: "100%",

          minWidth: 0,

          display: "flex",

          alignItems:
            "center",

          gap: 1.1,

          p: 0.8,

          border:
            "1px solid #E2E8F0",

          borderRadius: 2,

          bgcolor: "#FFFFFF",

          cursor: "pointer",

          transition:
            "border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",

          "&:hover": {
            borderColor:
              "#CBD5E1",

            boxShadow:
              "0 4px 12px rgba(15, 23, 42, 0.06)",

            transform:
              "translateY(-1px)",
          },
        }}
      >
        {/* SWATCH */}

        <Box
          ref={swatchRef}
          sx={{
            position:
              "relative",

            width:
              swatchSize,

            height:
              swatchSize,

            flexShrink: 0,

            overflow:
              "hidden",

            border:
              "1px solid rgba(15, 23, 42, 0.14)",

            borderRadius:
              1.5,

            background:
              previewBackground,

            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.35), 0 2px 5px rgba(15,23,42,0.08)",

            /*
             * Checkerboard makes
             * transparency visible.
             */
            "&::before": {
              content:
                '""',

              position:
                "absolute",

              inset: 0,

              zIndex: -1,

              backgroundImage:
                "linear-gradient(45deg, #E2E8F0 25%, transparent 25%), linear-gradient(-45deg, #E2E8F0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E2E8F0 75%), linear-gradient(-45deg, transparent 75%, #E2E8F0 75%)",

              backgroundSize:
                "10px 10px",

              backgroundPosition:
                "0 0, 0 5px, 5px -5px, -5px 0px",

              bgcolor:
                "#FFFFFF",
            },
          }}
        />

        {/* LABEL */}

        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              color:
                "#334155",

              fontSize:
                "0.72rem",

              fontWeight:
                750,
            }}
          >
            {label}
          </Typography>

          <Box
            sx={{
              mt: 0.2,

              display: "flex",

              alignItems:
                "center",

              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color:
                  "#94A3B8",

                fontSize:
                  "0.59rem",
              }}
            >
              {isGradient
                ? "Gradient"
                : alpha < 1
                ? `${hex} · ${Math.round(
                    alpha *
                      100
                  )}%`
                : hex}
            </Typography>
          </Box>
        </Box>

        <PaletteOutlined
          sx={{
            mr: 0.3,

            flexShrink: 0,

            color: "#94A3B8",

            fontSize: 17,
          }}
        />
      </Box>


      {/* ======================================================================
          COLOR EDITOR
      ====================================================================== */}

      {isOpen &&
        ReactDOM.createPortal(
          <Box
            ref={editorRef}
            sx={{
              position:
                "fixed",

              top:
                dropdownPos.top,

              left:
                dropdownPos.left,

              zIndex:
                portalZIndex,

              width: {
                xs:
                  "calc(100vw - 32px)",

                sm: 360,
              },

              maxWidth: 360,

              maxHeight:
                "calc(100vh - 32px)",

              display: "flex",

              flexDirection:
                "column",

              overflow:
                "hidden",

              bgcolor:
                "#FFFFFF",

              border:
                "1px solid #E2E8F0",

              borderRadius: 3,

              boxShadow:
                "0 20px 50px rgba(15, 23, 42, 0.18)",

              /*
               * Arrow.
               */

              "&::before": {
                content:
                  '""',

                position:
                  "absolute",

                left:
                  dropdownPos.arrowLeftOffset -
                  7,

                width: 14,

                height: 14,

                bgcolor:
                  "#FFFFFF",

                borderLeft:
                  "1px solid #E2E8F0",

                borderTop:
                  "1px solid #E2E8F0",

                transform:
                  dropdownPos.positionAbove
                    ? "rotate(225deg)"
                    : "rotate(45deg)",

                top:
                  dropdownPos.positionAbove
                    ? "auto"
                    : -8,

                bottom:
                  dropdownPos.positionAbove
                    ? -8
                    : "auto",

                zIndex: 2,
              },
            }}
          >
            {/* ================================================================
                HEADER
            ================================================================= */}

            <Box
              sx={{
                px: 1.75,

                py: 1.35,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap: 1,

                flexShrink: 0,

                borderBottom:
                  "1px solid #EDF1F6",

                bgcolor:
                  "#FCFDFE",
              }}
            >
              <Box
                sx={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap: 0.9,
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

                    borderRadius:
                      1.5,

                    bgcolor:
                      "#EFF6FF",

                    color:
                      "#2563EB",
                  }}
                >
                  <ColorLensRounded
                    sx={{
                      fontSize:
                        17,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        "#1E293B",

                      fontSize:
                        "0.78rem",

                      fontWeight:
                        800,
                    }}
                  >
                    Color Editor
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display:
                        "block",

                      mt: 0.1,

                      color:
                        "#94A3B8",

                      fontSize:
                        "0.59rem",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Box>

              <Tooltip
                title="Close"
                arrow
              >
                <IconButton
                  size="small"
                  onClick={
                    handleCancel
                  }
                  sx={{
                    color:
                      "#64748B",

                    "&:hover":
                      {
                        bgcolor:
                          "#F1F5F9",
                      },
                  }}
                >
                  <CloseRounded
                    sx={{
                      fontSize:
                        18,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>


            {/* ================================================================
                SCROLLABLE CONTENT
            ================================================================= */}

            <Box
              sx={{
                flex: 1,

                minHeight: 0,

                overflowY:
                  "auto",

                p: 1.75,

                "&::-webkit-scrollbar":
                  {
                    width:
                      "6px",
                  },

                "&::-webkit-scrollbar-thumb":
                  {
                    bgcolor:
                      "#CBD5E1",

                    borderRadius:
                      10,
                  },
              }}
            >
              {/* ==============================================================
                  MODE
              =============================================================== */}

              <SectionLabel
                icon={
                  <TuneRounded />
                }
                title="Color type"
              />

              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={
                  isGradient
                    ? "gradient"
                    : "solid"
                }
                onChange={
                  handleModeChange
                }
                sx={{
                  mb: 2,

                  p: 0.35,

                  bgcolor:
                    "#F1F5F9",

                  borderRadius:
                    1.75,

                  "& .MuiToggleButtonGroup-grouped":
                    {
                      minHeight:
                        34,

                      border:
                        "0 !important",

                      borderRadius:
                        "6px !important",

                      color:
                        "#64748B",

                      textTransform:
                        "none",

                      fontSize:
                        "0.67rem",

                      fontWeight:
                        750,

                      "&.Mui-selected":
                        {
                          bgcolor:
                            "#FFFFFF",

                          color:
                            "#2563EB",

                          boxShadow:
                            "0 2px 5px rgba(15,23,42,0.08)",

                          "&:hover":
                            {
                              bgcolor:
                                "#FFFFFF",
                            },
                        },
                    },
                }}
              >
                <ToggleButton value="solid">
                  <ColorLensRounded
                    sx={{
                      mr: 0.5,

                      fontSize:
                        15,
                    }}
                  />

                  Solid
                </ToggleButton>

                <ToggleButton value="gradient">
                  <GradientRounded
                    sx={{
                      mr: 0.5,

                      fontSize:
                        15,
                    }}
                  />

                  Gradient
                </ToggleButton>
              </ToggleButtonGroup>


              {/* ==============================================================
                  LARGE PREVIEW
              =============================================================== */}

              <Box
                sx={{
                  mb: isGradient
                    ? 3.2
                    : 2,

                  position:
                    "relative",

                  height: 70,

                  border:
                    "1px solid #DCE3EC",

                  borderRadius:
                    2,

                  /*
                   * Transparency grid.
                   */

                  backgroundColor:
                    "#FFFFFF",

                  backgroundImage:
                    "linear-gradient(45deg, #E2E8F0 25%, transparent 25%), linear-gradient(-45deg, #E2E8F0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E2E8F0 75%), linear-gradient(-45deg, transparent 75%, #E2E8F0 75%)",

                  backgroundSize:
                    "14px 14px",

                  backgroundPosition:
                    "0 0, 0 7px, 7px -7px, -7px 0px",
                }}
              >
                <Box
                  sx={{
                    position:
                      "absolute",

                    inset: 0,

                    borderRadius:
                      "inherit",

                    background:
                      previewBackground,
                  }}
                />

                {/* GRADIENT STOPS */}

                {isGradient &&
                  colorStops.map(
                    (
                      stop,
                      index
                    ) => {
                      const selected =
                        index ===
                        selectedStopIndex;

                      return (
                        <Tooltip
                          key={`${index}-${stop.position}`}
                          title={`${Math.round(
                            stop.position *
                              100
                          )}%`}
                          arrow
                        >
                          <Box
                            onClick={() =>
                              setSelectedStopIndex(
                                index
                              )
                            }
                            sx={{
                              position:
                                "absolute",

                              left: `calc(${stop.position *
                                100}% - 9px)`,

                              bottom:
                                -23,

                              width:
                                18,

                              height:
                                18,

                              borderRadius:
                                "50%",

                              bgcolor:
                                stop.color,

                              border:
                                selected
                                  ? "2px solid #2563EB"
                                  : "2px solid #FFFFFF",

                              outline:
                                selected
                                  ? "2px solid #BFDBFE"
                                  : "1px solid #CBD5E1",

                              cursor:
                                "pointer",

                              boxShadow:
                                "0 2px 5px rgba(15,23,42,0.12)",

                              transform:
                                selected
                                  ? "scale(1.12)"
                                  : "scale(1)",

                              transition:
                                "transform 120ms ease",
                            }}
                          />
                        </Tooltip>
                      );
                    }
                  )}
              </Box>


              {/* ==============================================================
                  SELECTED STOP
              =============================================================== */}

              {isGradient && (
                <Box
                  sx={{
                    mb: 1.75,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "#64748B",

                      fontSize:
                        "0.62rem",

                      fontWeight:
                        700,
                    }}
                  >
                    Editing stop{" "}
                    {selectedStopIndex +
                      1}{" "}
                    of{" "}
                    {
                      colorStops.length
                    }
                  </Typography>

                  <Chip
                    size="small"
                    label={`${Math.round(
                      (selectedStop?.position ||
                        0) *
                        100
                    )}%`}
                    sx={{
                      height: 22,

                      bgcolor:
                        "#F1F5F9",

                      color:
                        "#475569",

                      fontSize:
                        "0.58rem",

                      fontWeight:
                        750,
                    }}
                  />
                </Box>
              )}


              {/* ==============================================================
                  COLOR
              =============================================================== */}

              <SectionLabel
                icon={
                  <PaletteOutlined />
                }
                title={
                  isGradient
                    ? "Stop color"
                    : "Color"
                }
              />

              <Box
                sx={{
                  mb: 2,

                  display:
                    "grid",

                  gridTemplateColumns:
                    "50px 1fr",

                  gap: 1,
                }}
              >
                {/* NATIVE COLOR */}

                <Box
                  component="label"
                  sx={{
                    position:
                      "relative",

                    height: 40,

                    overflow:
                      "hidden",

                    border:
                      "1px solid #DCE3EC",

                    borderRadius:
                      1.5,

                    cursor:
                      "pointer",

                    bgcolor:
                      hex,

                    boxShadow:
                      "inset 0 0 0 2px #FFFFFF",
                  }}
                >
                  <input
                    type="color"
                    value={
                      hex
                    }
                    onChange={
                      handleNativeColorChange
                    }
                    style={{
                      position:
                        "absolute",

                      inset: 0,

                      width:
                        "100%",

                      height:
                        "100%",

                      opacity: 0,

                      cursor:
                        "pointer",
                    }}
                  />
                </Box>

                {/* HEX */}

                <TextField
                  fullWidth
                  size="small"
                  value={
                    hexInput
                  }
                  onChange={
                    handleHexInputChange
                  }
                  onBlur={
                    handleHexBlur
                  }
                  placeholder="#3B82F6"
                  inputProps={{
                    maxLength: 7,
                    spellCheck:
                      false,
                  }}
                  InputProps={{
                    startAdornment: (
                      <Typography
                        sx={{
                          mr: 0.75,

                          color:
                            "#94A3B8",

                          fontSize:
                            "0.64rem",

                          fontWeight:
                            700,
                        }}
                      >
                        HEX
                      </Typography>
                    ),
                  }}
                  sx={
                    fieldSx
                  }
                />
              </Box>


              {/* ==============================================================
                  RGB INFO
              =============================================================== */}

              <Box
                sx={{
                  mb: 2,

                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(3, 1fr)",

                  gap: 0.75,
                }}
              >
                <ValueBox
                  label="R"
                  value={
                    rgb.r
                  }
                />

                <ValueBox
                  label="G"
                  value={
                    rgb.g
                  }
                />

                <ValueBox
                  label="B"
                  value={
                    rgb.b
                  }
                />
              </Box>


              {/* ==============================================================
                  OPACITY
              =============================================================== */}

              <SectionLabel
                icon={
                  <OpacityRounded />
                }
                title="Opacity"
                value={`${Math.round(
                  alpha * 100
                )}%`}
              />

              <Slider
                value={
                  alpha
                }
                min={0}
                max={1}
                step={0.01}
                onChange={
                  handleAlphaChange
                }
                valueLabelDisplay="auto"
                valueLabelFormat={(
                  sliderValue
                ) =>
                  `${Math.round(
                    sliderValue *
                      100
                  )}%`
                }
                sx={{
                  mb: 1.5,

                  color:
                    "#2563EB",

                  "& .MuiSlider-thumb":
                    {
                      width: 16,

                      height:
                        16,

                      boxShadow:
                        "0 2px 5px rgba(37,99,235,0.25)",
                    },

                  "& .MuiSlider-track":
                    {
                      border:
                        "none",
                    },

                  "& .MuiSlider-rail":
                    {
                      opacity:
                        1,

                      bgcolor:
                        "#E2E8F0",
                    },
                }}
              />


              {/* ==============================================================
                  GRADIENT POSITION
              =============================================================== */}

              {isGradient && (
                <>
                  <Divider
                    sx={{
                      my: 1.75,

                      borderColor:
                        "#EDF1F6",
                    }}
                  />

                  <SectionLabel
                    icon={
                      <GradientRounded />
                    }
                    title="Stop position"
                    value={`${Math.round(
                      (selectedStop?.position ||
                        0) *
                        100
                    )}%`}
                  />

                  <Slider
                    value={
                      selectedStop?.position ||
                      0
                    }
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={
                      handlePositionChange
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(
                      sliderValue
                    ) =>
                      `${Math.round(
                        sliderValue *
                          100
                      )}%`
                    }
                    sx={{
                      mb: 1,

                      color:
                        "#2563EB",

                      "& .MuiSlider-thumb":
                        {
                          width:
                            16,

                          height:
                            16,
                        },

                      "& .MuiSlider-track":
                        {
                          border:
                            "none",
                        },

                      "& .MuiSlider-rail":
                        {
                          opacity:
                            1,

                          bgcolor:
                            "#E2E8F0",
                        },
                    }}
                  />

                  <Box
                    sx={{
                      mb: 2,

                      display:
                        "grid",

                      gridTemplateColumns:
                        "1fr 1fr",

                      gap: 0.75,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        <AddRounded />
                      }
                      onClick={
                        handleAddColorStop
                      }
                      sx={
                        secondaryButtonSx
                      }
                    >
                      Add stop
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={
                        <DeleteOutlineRounded />
                      }
                      onClick={
                        handleRemoveColorStop
                      }
                      disabled={
                        colorStops.length <=
                        2
                      }
                      sx={{
                        ...secondaryButtonSx,

                        "&.Mui-disabled":
                          {
                            borderColor:
                              "#E2E8F0",

                            color:
                              "#CBD5E1",
                          },
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                </>
              )}


              {/* ==============================================================
                  PRESET COLORS
              =============================================================== */}

              {colorOptions.length >
                0 && (
                <>
                  <Divider
                    sx={{
                      my: 1.75,

                      borderColor:
                        "#EDF1F6",
                    }}
                  />

                  <SectionLabel
                    icon={
                      <ColorLensRounded />
                    }
                    title="Preset colors"
                  />

                  <Box
                    sx={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "repeat(8, 1fr)",

                      gap: 0.65,
                    }}
                  >
                    {colorOptions.map(
                      (
                        color,
                        index
                      ) => {
                        const normalizedPreset =
                          rgbaToHexAndAlpha(
                            color
                          ).hex;

                        const selected =
                          normalizedPreset.toUpperCase() ===
                          hex.toUpperCase();

                        return (
                          <Tooltip
                            key={`${color}-${index}`}
                            title={
                              normalizedPreset
                            }
                            arrow
                          >
                            <Box
                              onClick={() =>
                                handlePresetColor(
                                  color
                                )
                              }
                              sx={{
                                position:
                                  "relative",

                                aspectRatio:
                                  "1",

                                minWidth:
                                  0,

                                borderRadius:
                                  1.25,

                                bgcolor:
                                  color,

                                cursor:
                                  "pointer",

                                border:
                                  selected
                                    ? "2px solid #2563EB"
                                    : "1px solid rgba(15,23,42,0.12)",

                                outline:
                                  selected
                                    ? "2px solid #DBEAFE"
                                    : "none",

                                transition:
                                  "transform 120ms ease",

                                "&:hover":
                                  {
                                    transform:
                                      "scale(1.08)",
                                  },
                              }}
                            >
                              {selected && (
                                <CheckRounded
                                  sx={{
                                    position:
                                      "absolute",

                                    inset:
                                      0,

                                    m:
                                      "auto",

                                    color:
                                      "#FFFFFF",

                                    fontSize:
                                      15,

                                    filter:
                                      "drop-shadow(0 1px 2px rgba(0,0,0,0.55))",
                                  }}
                                />
                              )}
                            </Box>
                          </Tooltip>
                        );
                      }
                    )}
                  </Box>
                </>
              )}
            </Box>


            {/* ================================================================
                ACTION BAR
            ================================================================= */}

            <Box
              sx={{
                px: 1.75,

                py: 1.25,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap: 1,

                flexShrink: 0,

                borderTop:
                  "1px solid #EDF1F6",

                bgcolor:
                  "#FCFDFE",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },

                  color:
                    "#94A3B8",

                  fontSize:
                    "0.58rem",
                }}
              >
                Changes apply after
                confirmation
              </Typography>

              <Box
                sx={{
                  ml: "auto",

                  display:
                    "flex",

                  gap: 0.75,
                }}
              >
                <Button
                  size="small"
                  onClick={
                    handleCancel
                  }
                  sx={{
                    minHeight:
                      34,

                    px: 1.5,

                    borderRadius:
                      1.5,

                    color:
                      "#64748B",

                    textTransform:
                      "none",

                    fontSize:
                      "0.68rem",

                    fontWeight:
                      700,
                  }}
                >
                  Cancel
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    <CheckRounded />
                  }
                  onClick={
                    handleApply
                  }
                  sx={{
                    minHeight:
                      34,

                    px: 1.6,

                    borderRadius:
                      1.5,

                    bgcolor:
                      "#2563EB",

                    textTransform:
                      "none",

                    fontSize:
                      "0.68rem",

                    fontWeight:
                      750,

                    boxShadow:
                      "0 4px 10px rgba(37,99,235,0.18)",

                    "&:hover":
                      {
                        bgcolor:
                          "#1D4ED8",
                      },
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Box>,

          document.body
        )}
    </>
  );
};


/* ============================================================================
   SECTION LABEL
============================================================================ */

const SectionLabel = ({
  icon,
  title,
  value,
}) => {
  return (
    <Box
      sx={{
        mb: 0.8,

        display: "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        gap: 1,
      }}
    >
      <Box
        sx={{
          display:
            "flex",

          alignItems:
            "center",

          gap: 0.55,
        }}
      >
        <Box
          sx={{
            display:
              "inline-flex",

            alignItems:
              "center",

            color:
              "#94A3B8",

            "& svg":
              {
                fontSize:
                  14,
              },
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="caption"
          sx={{
            color:
              "#475569",

            fontSize:
              "0.63rem",

            fontWeight:
              800,
          }}
        >
          {title}
        </Typography>
      </Box>

      {value !==
        undefined && (
        <Typography
          variant="caption"
          sx={{
            color:
              "#64748B",

            fontSize:
              "0.6rem",

            fontWeight:
              750,

            fontVariantNumeric:
              "tabular-nums",
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
};


/* ============================================================================
   RGB VALUE BOX
============================================================================ */

const ValueBox = ({
  label,
  value,
}) => {
  return (
    <Box
      sx={{
        minHeight: 34,

        px: 1,

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        gap: 0.5,

        border:
          "1px solid #E2E8F0",

        borderRadius:
          1.5,

        bgcolor:
          "#FAFBFD",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color:
            "#94A3B8",

          fontSize:
            "0.57rem",

          fontWeight:
            800,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color:
            "#334155",

          fontSize:
            "0.62rem",

          fontWeight:
            750,

          fontVariantNumeric:
            "tabular-nums",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};


/* ============================================================================
   SHARED STYLES
============================================================================ */

const fieldSx = {
  "& .MuiOutlinedInput-root":
    {
      height: 40,

      borderRadius:
        1.5,

      bgcolor:
        "#FFFFFF",

      fontSize:
        "0.72rem",

      "& fieldset":
        {
          borderColor:
            "#DCE3EC",
        },

      "&:hover fieldset":
        {
          borderColor:
            "#AEBACA",
        },

      "&.Mui-focused":
        {
          boxShadow:
            "0 0 0 3px rgba(37,99,235,0.07)",
        },

      "&.Mui-focused fieldset":
        {
          borderColor:
            "#2563EB",
        },
    },
};


const secondaryButtonSx = {
  minHeight: 34,

  borderRadius: 1.5,

  borderColor:
    "#DCE3EC",

  color: "#475569",

  textTransform:
    "none",

  fontSize:
    "0.65rem",

  fontWeight: 700,

  "&:hover": {
    borderColor:
      "#AEBACA",

    bgcolor:
      "#F8FAFC",
  },
};


/* ============================================================================
   EXPORT
============================================================================ */

export default GradientColorPicker;